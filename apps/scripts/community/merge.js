#!/usr/bin/env node
import fs from "fs";
import path from "path";
import pino from "pino";
import pretty from "pino-pretty";
import admin from "firebase-admin";
import yaml from "js-yaml";

// ------------------- CLI FLAGS -------------------
const FLAGS = {
  "--write": "Apply changes (default is dry-run)",
  "--debug": "Enable verbose debug logging",
  "--help": "Show all available flags",
};

const args = process.argv.slice(2);
const isWriteMode = args.includes("--write");
const isDryRun = !isWriteMode;
const isDebug = args.includes("--debug");
const wantsHelp = args.includes("--help");

// Print available flags
console.log("\n🛠️  Available CLI flags:");
for (const [flag, desc] of Object.entries(FLAGS)) {
  console.log(`   ${flag.padEnd(10)} ${desc}`);
}
console.log("");

if (wantsHelp) process.exit(0);

// ------------------- LOGGER -------------------
const stream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
});
const logger = pino({ level: isDebug ? "debug" : "info" }, stream);
logger.info(`Log level: ${isDebug ? "debug" : "info"}`);
logger.info(
  `Mode: ${isDryRun ? "🧪 DRY RUN (no writes)" : "🚀 WRITE MODE (changes will be applied)"}`
);

// ------------------- LOAD YAML -------------------
const yamlPath = path.resolve("./merge.yaml");
if (!fs.existsSync(yamlPath)) {
  logger.error("❌ merge.yaml not found");
  process.exit(1);
}

let config;
try {
  config = yaml.load(fs.readFileSync(yamlPath, "utf8"));
} catch (err) {
  logger.error(err, "Failed to parse merge.yaml");
  process.exit(1);
}

const { environment, communityKeep, communityMove } = config || {};
if (!environment || !communityKeep || !communityMove) {
  logger.error("Missing required fields: environment, communityKeep, communityMove");
  process.exit(1);
}

logger.info({ environment, communityKeep, communityMove }, "Merge configuration loaded");

// ------------------- FIREBASE INIT -------------------
function initializeFirebase(env) {
  const keyMap = {
    emulator: "../serviceAccountKey.emulator.json",
    development: "../serviceAccountKey.development.json",
    live: "../serviceAccountKey.live.json",
  };

  const keyPath = keyMap[env];
  if (!keyPath) {
    logger.error(`❌ Unknown environment "${env}". Expected one of: emulator, development, live.`);
    process.exit(1);
  }

  const resolved = path.resolve(keyPath);
  if (!fs.existsSync(resolved)) {
    logger.error(`❌ Service account key not found: ${resolved}`);
    process.exit(1);
  }

  const sa = JSON.parse(fs.readFileSync(resolved, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id,
  });

  if (env === "emulator") {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    admin.firestore().settings({ host: "localhost:8080", ssl: false });
    logger.info("🔥 Using Firebase Emulators (Auth + Firestore)");
  } else {
    logger.info(`🔑 Firebase initialized for environment: ${env}`);
  }
}
initializeFirebase(environment);

const db = admin.firestore();
const auth = admin.auth();

// ------------------- HELPERS -------------------
const moveKey = `community-${communityMove}`;
const keepKey = `community-${communityKeep}`;

function clone(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}));
}

function mergeMapByRules(map, fromKey, toKey) {
  if (!(fromKey in map)) return { changed: false, before: map, after: map };
  const before = clone(map);
  const moveValue = before[fromKey];
  const keepValue = before[toKey];
  const after = clone(before);
  delete after[fromKey];
  if (keepValue == null) {
    after[toKey] = moveValue;
  } else if (moveValue === "admin") {
    after[toKey] = "admin";
  }
  const changed = JSON.stringify(before) !== JSON.stringify(after);
  return { changed, before, after, moveValue, keepValue };
}

// ------------------- FIRESTORE OPS -------------------
async function getCandidateUsers() {
  const fp = new admin.firestore.FieldPath("private", "communities", moveKey);
  const snap = await db.collection("users").where(fp, "in", ["member", "admin"]).get();
  return snap.docs;
}

function prepareFirestoreMerge(uid, docData) {
  const privateMap = clone(docData.private);
  const communities = clone(privateMap.communities);
  if (!communities || !(moveKey in communities)) return { touched: false };

  const { changed, before, after, moveValue, keepValue } = mergeMapByRules(
    communities,
    moveKey,
    keepKey
  );
  if (!changed) return { touched: false };

  const firestoreBefore = { private: { ...privateMap, communities: before } };
  const firestoreAfter = { private: { ...privateMap, communities: after } };

  logger.debug(
    { uid, firestore_before: firestoreBefore, firestore_after: firestoreAfter },
    "🧩 Firestore merge preview"
  );
  return { touched: true, firestoreBefore, firestoreAfter, moveValue, keepValue };
}

async function commitFirestore(uid, moveValue, keepValue) {
  const docRef = db.doc(`users/${uid}`);
  const updates = {
    [`private.communities.${moveKey}`]: admin.firestore.FieldValue.delete(),
  };

  if (keepValue === undefined || moveValue === "admin") {
    updates[`private.communities.${keepKey}`] = moveValue;
  }

  logger.debug({ uid, updates }, "📦 Firestore update payload");
  await docRef.update(updates);
  logger.info({ uid }, "✅ Firestore user record updated");
}

// Delete the old community document entirely
async function deleteOldCommunity() {
  const communityDoc = db.doc(`communities/${communityMove}`);
  const docSnap = await communityDoc.get();
  if (!docSnap.exists) {
    logger.info(`ℹ️  Community ${communityMove} not found (nothing to delete)`);
    return;
  }

  if (isDryRun) {
    logger.info(`🧪 Would delete Firestore document: communities/${communityMove}`);
    return;
  }

  await communityDoc.delete();
  logger.info(`🗑️  Deleted Firestore document: communities/${communityMove}`);
}

// ------------------- AUTH OPS -------------------
async function applyAuthMerge(uid) {
  try {
    const user = await auth.getUser(uid);
    const claimsIn = clone(user.customClaims);
    const { changed, before, after } = mergeMapByRules(claimsIn ?? {}, moveKey, keepKey);

    logger.debug({ uid, auth_before: before, auth_after: after }, "🔍 Auth merge preview");

    if (!changed) return { changed: false };
    if (isDryRun) return { changed: true };
    await auth.setCustomUserClaims(uid, after);
    return { changed: true };
  } catch (err) {
    logger.error({ uid, err }, "❌ Auth update failed");
    return { changed: false, error: err };
  }
}

// ------------------- MAIN -------------------
async function main() {
  logger.info("🔎 Scanning Firestore for candidate users...");
  const docs = await getCandidateUsers();
  logger.info({ count: docs.length }, "Found candidate user docs");

  let processed = 0;
  let updated = 0;

  for (const doc of docs) {
    const uid = doc.id;
    const data = doc.data() || {};
    processed++;

    // 1️⃣ Prepare Firestore merge
    const fsRes = prepareFirestoreMerge(uid, data);
    if (!fsRes.touched) {
      logger.debug({ uid }, "No Firestore change required (skipping Auth)");
      continue;
    }

    // 2️⃣ Apply Auth merge
    const authRes = await applyAuthMerge(uid);

    // 3️⃣ Apply Firestore (no rollback)
    if (!isDryRun) {
      await commitFirestore(uid, fsRes.moveValue, fsRes.keepValue);
    } else {
      logger.info({ uid }, "🧪 Dry run — no writes performed");
    }

    if (authRes.changed) updated++;
  }

  // 4️⃣ Delete old community document
  await deleteOldCommunity();

  logger.info({ processed, updated }, "🎉 Merge finished");
}

main().catch((err) => {
  logger.error(err, "Unexpected error");
  process.exit(1);
});

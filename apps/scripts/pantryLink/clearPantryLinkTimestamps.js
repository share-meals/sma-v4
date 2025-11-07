#!/usr/bin/env node
import fs from "fs";
import path from "path";
import pino from "pino";
import pretty from "pino-pretty";
import admin from "firebase-admin";
import yaml from "js-yaml";

/**
 * ==================================================
 *  clearPantryLinkTimestamps.js
 *  - Debug logging by default
 *  - Loads YAML config with { environment, community }
 *  - Initializes Firebase Admin (supports emulator)
 *  - Finds users in community-${community}
 *  - Removes 'timestamp' from private.pantryLink
 * ==================================================
 */

// ------------------- CLI FLAGS -------------------
const FLAGS = {
  "--write": "Apply changes (default is dry-run)",
  "--debug": "Enable verbose debug logging (default: on)",
  "--info": "Reduce log verbosity to info level",
  "--help": "Show all available flags",
};

const args = process.argv.slice(2);
const isWriteMode = args.includes("--write");
const isInfoMode = args.includes("--info");
const wantsHelp = args.includes("--help");
const isDebug = !isInfoMode;
const isDryRun = !isWriteMode;

// ------------------- FLAG OUTPUT -------------------
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

// ------------------- LOAD YAML CONFIG -------------------
const yamlPath = path.resolve("./clearPantryLinkTimestamps.yaml");
if (!fs.existsSync(yamlPath)) {
  logger.error("❌ clearPantryLinkTimestamps.yaml not found");
  process.exit(1);
}

let config;
try {
  config = yaml.load(fs.readFileSync(yamlPath, "utf8"));
} catch (err) {
  logger.error(err, "Failed to parse clearPantryLinkTimestamps.yaml");
  process.exit(1);
}

const { environment, community } = config || {};
if (!environment || !community) {
  logger.error("Missing required fields: environment, community");
  process.exit(1);
}

logger.info({ environment, community }, "Configuration loaded");

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

// ------------------- MAIN LOGIC -------------------
async function findUsersWithPantryLink(community) {
  const fieldPath = new admin.firestore.FieldPath(
    "private",
    "communities",
    `community-${community}`
  );

  logger.info(`🔎 Searching Firestore for users in community-${community}...`);
  const snap = await db
    .collection("users")
    .where(fieldPath, "in", ["member", "admin"])
    .get();

  if (snap.empty) {
    logger.info(`No users found in community-${community}`);
    return [];
  }

  const results = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const role = data?.private?.communities?.[`community-${community}`];
    const pantryLink = data?.private?.pantryLink;

    if (pantryLink && typeof pantryLink === "object") {
      results.push({ uid: doc.id, role });
      logger.debug({ uid: doc.id, role }, "📦 pantryLink user identified");
    }
  }

  logger.info(
    { count: results.length },
    `✅ Found ${results.length} users with pantryLink`
  );
  return results;
}

async function removeTimestamp(uid) {
  const docRef = db.doc(`users/${uid}`);
  const updatePath = new admin.firestore.FieldPath("private", "pantryLink", "timestamp");

  if (isDryRun) {
    logger.info(`🧪 Would remove pantryLink.timestamp for ${uid}`);
    return;
  }

  await docRef.update({
    [updatePath]: admin.firestore.FieldValue.delete(),
  });

  logger.info(`✅ Removed pantryLink.timestamp for ${uid}`);
}

// ------------------- MAIN -------------------
async function main() {
  logger.info("🏁 Starting clearPantryLinkTimestamps script...");
  logger.debug({ environment, community, dryRun: isDryRun }, "Runtime configuration");

  const users = await findUsersWithPantryLink(community);
  if (users.length === 0) {
    logger.info("No matching users with pantryLink — nothing to do.");
    return;
  }

  for (const user of users) {
    await removeTimestamp(user.uid);
  }

  logger.info("✅ clearPantryLinkTimestamps script finished successfully");
}

// ------------------- RUN -------------------
main().catch((err) => {
  logger.error(err, "Unexpected error in clearPantryLinkTimestamps");
  process.exit(1);
});

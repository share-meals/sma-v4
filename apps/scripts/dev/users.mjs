// scripts/users.mjs
import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'node:fs';

// --- config ---
const EMULATOR_AUTH_HOST = process.env.EMULATOR_AUTH_HOST || '127.0.0.1:9099';
const EMULATOR_KEY_PATH = '../serviceAccountKey.emulator.json';
const DEV_KEY_PATH = '../serviceAccountKey.development.json';
const FIXED_PASSWORD = 'password';
const EMULATOR_PROJECT_ID = process.env.EMULATOR_PROJECT_ID || null;

// --- helpers ---
function readJSON(p) {
  if (!fs.existsSync(p)) throw new Error(`Service account file not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
async function* listAllUsersPaged(auth, pageSize = 1000) {
  let pageToken;
  for (;;) {
    const res = await auth.listUsers(pageSize, pageToken);
    for (const u of res.users) yield u;
    if (!res.pageToken) break;
    pageToken = res.pageToken;
  }
}
function isValidHttpUrl(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
function isE164(s) {
  return typeof s === 'string' && /^\+\d{7,15}$/.test(s);
}
function sanitizeFromEmu(u) {
  const email = (u.email || '').trim() || undefined;
  const displayName = typeof u.displayName === 'string' ? u.displayName.slice(0, 128) : undefined;
  const photoURL = isValidHttpUrl(u.photoURL) ? u.photoURL : undefined;     // ← drop bad photoURL
  const phoneNumber = isE164(u.phoneNumber) ? u.phoneNumber : undefined;    // ← drop bad phone
  return {
    uid: u.uid,
    email,
    emailVerified: !!u.emailVerified,
    displayName,
    photoURL,
    phoneNumber,
    disabled: !!u.disabled,
    customClaims: u.customClaims && Object.keys(u.customClaims).length ? u.customClaims : null,
  };
}

// 1) Read all users from Auth Emulator into memory
const emulatorKey = readJSON(EMULATOR_KEY_PATH);
const prevAuthEmu = process.env.FIREBASE_AUTH_EMULATOR_HOST;
process.env.FIREBASE_AUTH_EMULATOR_HOST = EMULATOR_AUTH_HOST;
const srcApp = admin.initializeApp(
  { credential: admin.credential.cert(emulatorKey), projectId: EMULATOR_PROJECT_ID || emulatorKey.project_id },
  'src-auth'
);
const srcAuth = srcApp.auth();

let sourceUsers = [];
try {
  console.error(`Reading users from Auth Emulator (host=${EMULATOR_AUTH_HOST}, projectId=${EMULATOR_PROJECT_ID || emulatorKey.project_id})…`);
  for await (const u of listAllUsersPaged(srcAuth, 1000)) {
    sourceUsers.push(sanitizeFromEmu(u));
  }
  console.error(`Emulator users fetched: ${sourceUsers.length}`);
} finally {
  try { await srcApp.delete(); } catch {}
  if (prevAuthEmu === undefined) delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  else process.env.FIREBASE_AUTH_EMULATOR_HOST = prevAuthEmu;
}

// 2) Connect to CLOUD, wipe, then recreate
const devKey = readJSON(DEV_KEY_PATH);
const dstApp = admin.initializeApp(
  { credential: admin.credential.cert(devKey), projectId: devKey.project_id },
  'dst-auth'
);
const dstAuth = dstApp.auth();

(async () => {
  console.error(`Wiping users on CLOUD (${devKey.project_id})…`);
  {
    const batch = [];
    let total = 0;
    for await (const u of listAllUsersPaged(dstAuth, 1000)) {
      batch.push(u.uid);
      if (batch.length === 1000) {
        const res = await dstAuth.deleteUsers(batch);
        total += res.successCount;
        batch.length = 0;
      }
    }
    if (batch.length) {
      const res = await dstAuth.deleteUsers(batch);
      total += res.successCount;
    }
    console.error(`  Deleted ${total} user(s) on cloud.`);
  }

  console.error('Creating users on CLOUD from emulator dump…');
  let created = 0, claimsUpdated = 0;
  for (const u of sourceUsers) {
    const payload = {
      uid: u.uid,
      email: u.email,
      emailVerified: u.emailVerified,
      displayName: u.displayName,
      photoURL: u.photoURL,         // undefined if invalid → field ignored
      phoneNumber: u.phoneNumber,   // undefined if invalid → field ignored
      disabled: u.disabled,
      ...(u.email ? { password: FIXED_PASSWORD } : {}), // only if email exists
    };

    try {
      await dstAuth.createUser(payload);
      created++;
    } catch (e) {
      const code = e?.errorInfo?.code || e?.code || '';
      // Retry once without optional fields if validation still complains
      if (code && code.startsWith('auth/')) {
        try {
          const { emailVerified, displayName, disabled } = payload;
          await dstAuth.updateUser(u.uid, { email: u.email, emailVerified, displayName, disabled, ...(u.email ? { password: FIXED_PASSWORD } : {}) });
          created++;
        } catch (e2) {
          console.error(`  WARN create/update ${u.uid}: ${e2.message || e2}`);
        }
      } else {
        console.error(`  WARN create ${u.uid}: ${e.message || e}`);
      }
    }

    if (u.customClaims) {
      try {
        await dstAuth.setCustomUserClaims(u.uid, u.customClaims);
        claimsUpdated++;
      } catch (e) {
        console.error(`  WARN set claims ${u.uid}: ${e.message || e}`);
      }
    }
  }

  console.error(`Done. Created/updated ${created} user(s); claims set for ${claimsUpdated}.`);
})().catch(err => {
  console.error('Error:', err?.stack || err?.message || err);
  process.exitCode = 1;
}).finally(async () => {
  try { await dstApp.delete(); } catch {}
});

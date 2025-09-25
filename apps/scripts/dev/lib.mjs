import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'node:fs';

const FS_EMU_VAR = 'FIRESTORE_EMULATOR_HOST';
if (process.env[FS_EMU_VAR]) {
  console.warn(`[lib.mjs] Ignoring ${FS_EMU_VAR}=${process.env[FS_EMU_VAR]} so DEV Firestore uses cloud.`);
  delete process.env[FS_EMU_VAR];
}

/** Disable the global RTDB emulator redirect so DEV uses cloud RTDB. */
const RTDB_EMU_VAR = 'FIREBASE_DATABASE_EMULATOR_HOST';
if (process.env[RTDB_EMU_VAR]) {
  console.warn(`[lib.mjs] Ignoring ${RTDB_EMU_VAR}=${process.env[RTDB_EMU_VAR]} for this run so the DEV app hits cloud RTDB.`);
  delete process.env[RTDB_EMU_VAR];
}

function readJSON(path) {
  if (!fs.existsSync(path)) throw new Error(`Service account file not found at ${path}`);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function prodDbUrl(projectId, envName) {
  // Allow override if your instance name differs (e.g., europe-west1.firebasedatabase.app)
  if (process.env[envName]) return process.env[envName];
  return `https://${projectId}.firebaseio.com`;
}

// --- Paths to your keys (both in ../) ---
const emulatorKeyPath = '../serviceAccountKey.emulator.json';
const devKeyPath = '../serviceAccountKey.development.json';

const emulatorKey = readJSON(emulatorKeyPath);
const devKey = readJSON(devKeyPath);

// --- Local RTDB emulator host:port (set EMULATOR_DB_HOST if different) ---
const emulatorHost = process.env.EMULATOR_DB_HOST || '127.0.0.1:9000';
// Explicit emulator URL (per-app) so only this app uses the emulator
function emulatorDbUrl(namespace /* usually project_id */) {
  return `http://${emulatorHost}?ns=${namespace}`;
}

// Source: LOCAL EMULATOR
const emulatorApp = admin.initializeApp(
  {
    credential: admin.credential.cert(emulatorKey),
    databaseURL: emulatorDbUrl(emulatorKey.project_id),
  },
  'emulator'
);

// Destination: CLOUD (DEV)
const devApp = admin.initializeApp(
  {
    credential: admin.credential.cert(devKey),
    databaseURL: prodDbUrl(devKey.project_id, 'DEV_DB_URL'),
  },
  'dev'
);

export const from = {
  db: () => emulatorApp.database(),
  fs: () => emulatorApp.firestore(),
  auth: () => emulatorApp.auth(),
  projectId: emulatorKey.project_id,
};

export const to = {
  db: () => devApp.database(),
  fs: () => devApp.firestore(),
  auth: () => devApp.auth(),
  projectId: devKey.project_id,
};

/** Cleanly shut down both Admin apps so the process can exit. */
export async function teardown() {
  await Promise.allSettled([emulatorApp.delete(), devApp.delete()]);
}

import { from, to, teardown } from './lib.mjs';

// Source = local emulator
const EMULATOR_FS_HOST = process.env.EMULATOR_FS_HOST || '127.0.0.1:8080';
const srcFs = from.fs();
srcFs.settings({ host: EMULATOR_FS_HOST, ssl: false, ignoreUndefinedProperties: true });

// Destination = cloud Firestore
const dstFs = to.fs();
dstFs.settings({ ignoreUndefinedProperties: true });

async function deleteDocRecursive(docRef) {
  const subs = await docRef.listCollections();
  for (const sub of subs) {
    const docs = await sub.listDocuments();
    for (const d of docs) {
      await deleteDocRecursive(d);
    }
  }
  await docRef.delete();
}

async function wipeDestination() {
  const rootCols = await dstFs.listCollections();
  for (const col of rootCols) {
    const docs = await col.listDocuments();
    for (const d of docs) {
      await deleteDocRecursive(d);
    }
  }
}

async function cloneDocRecursive(srcDocRef) {
  const snap = await srcDocRef.get();
  if (snap.exists) {
    const dstDocRef = dstFs.doc(srcDocRef.path);
    await dstDocRef.set(snap.data(), { merge: false });
  }
  const subs = await srcDocRef.listCollections();
  for (const sub of subs) {
    const docs = await sub.listDocuments();
    for (const d of docs) {
      await cloneDocRecursive(d);
    }
  }
}

async function cloneAll() {
  const rootCols = await srcFs.listCollections();
  for (const col of rootCols) {
    const docs = await col.listDocuments();
    for (const d of docs) {
      await cloneDocRecursive(d);
    }
  }
}

try {
  console.error(`Wiping cloud Firestore (dev: ${to.projectId})...`);
  await wipeDestination();
  console.error('Cloud wiped.');

  console.error(`Cloning from local emulator (${from.projectId} @ ${EMULATOR_FS_HOST}) to cloud...`);
  await cloneAll();
  console.error('Clone complete.');
} catch (e) {
  console.error('Error:', e?.message || e);
  process.exitCode = 1;
} finally {
  await teardown();
}

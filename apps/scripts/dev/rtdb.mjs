import { from, to, teardown } from './lib.mjs';

const TIMEOUT_MS = parseInt(process.env.RTDB_TIMEOUT_MS || '15000', 10);

function withTimeout(promise, label, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
    ),
  ]);
}

async function readRoot(db, label) {
  const ref = db.ref('/');
  // ref.toString() prints the full URL (incl. ?ns for emulator)
  console.error(`  → ${label} reading from: ${ref.toString()}`);
  const snap = await withTimeout(ref.get(), `${label} ref.get('/')`);
  return snap.val();
}

async function writeRoot(db, value, label) {
  const ref = db.ref('/');
  console.error(`  → ${label} writing to: ${ref.toString()}`);
  await withTimeout(ref.set(value), `${label} ref.set('/')`);
}

function countTopLevelKeys(val) {
  return val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).length
    : 0;
}
function byteSize(val) {
  try { return Buffer.byteLength(JSON.stringify(val), 'utf8'); } catch { return 0; }
}

(async () => {
  console.error(`RTDB clone: LOCAL EMULATOR (${from.projectId}) → CLOUD DEV (${to.projectId})`);

  // 1) Read source (emulator)
  console.error('Step 1/3: Reading source (emulator)…');
  const srcVal = await readRoot(from.db(), 'emulator');
  const srcKeys = countTopLevelKeys(srcVal);
  const srcBytes = byteSize(srcVal);
  console.error(`  Source summary: type=${srcVal === null ? 'null' : Array.isArray(srcVal) ? 'array' : typeof srcVal}, topLevelKeys=${srcKeys}, ~${srcBytes} bytes`);

  // 2) Wipe destination (cloud dev)
  console.error('Step 2/3: Wiping destination (dev) root…');
  await writeRoot(to.db(), null, 'dev');
  console.error('  Destination root cleared.');

  // 3) Write source to destination
  console.error('Step 3/3: Writing source data into destination…');
  if (srcVal === null) {
    console.error('  Source is null; destination will remain empty.');
  } else {
    await writeRoot(to.db(), srcVal, 'dev');
    console.error('  Write complete.');
  }

  // Verify
  console.error('Verification: reading destination…');
  const dstVal = await readRoot(to.db(), 'dev');
  const dstKeys = countTopLevelKeys(dstVal);
  const dstBytes = byteSize(dstVal);
  console.error(`  Dest summary: type=${dstVal === null ? 'null' : Array.isArray(dstVal) ? 'array' : typeof dstVal}, topLevelKeys=${dstKeys}, ~${dstBytes} bytes`);

  console.error('Done.');
})().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exitCode = 1;
}).finally(async () => {
  await teardown();
});

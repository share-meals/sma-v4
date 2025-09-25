// scripts/runAll.mjs
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scripts = [
  { name: 'RTDB',      file: 'rtdb.mjs' },
  { name: 'Firestore', file: 'firestore.mjs' },
  { name: 'Users',     file: 'users.mjs' },
];

function runNodeScript(absPath, name) {
  return new Promise((resolve, reject) => {
    console.error(`\n=== ${name}: START (${absPath}) ===`);
    const child = spawn(process.execPath, [absPath], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => {
      if (code === 0) {
        console.error(`=== ${name}: OK ===`);
        resolve();
      } else {
        reject(new Error(`${name} failed with exit code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

(async () => {
  const started = Date.now();

  for (const s of scripts) {
    const abs = join(__dirname, s.file);
    await runNodeScript(abs, s.name);
  }

  const elapsed = Math.round((Date.now() - started) / 1000);

  console.error('\n✅ All clone steps completed.');
  console.error(`⏱  Total time: ${elapsed}s\n`);

  // Simplified reminder
  console.error('🔔 Reminder: publish your Functions to the DEV project.\n');
})().catch((err) => {
  console.error('\n❌ runAll failed:', err?.message || err);
  process.exit(1);
});

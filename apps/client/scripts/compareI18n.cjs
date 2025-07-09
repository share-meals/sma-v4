#!/usr/bin/env node
/**
 * compareI18n.cjs
 * Usage: node compareI18n.cjs <file1.json> <file2.json>
 *
 * 1. Reads two flat (non-nested) JSON objects.
 * 2. Prints keys that appear only in file1 (A) and not in file2 (B) ─ no grep check.
 * 3. Prints keys that appear only in file2 (B) and not in file1 (A),
 *    after removing any key already used in ./src
 *    (excluding node_modules and src/hooks/I18n/locales).
 */

const fs = require('fs');
const { spawnSync } = require('child_process');

// ── 1. CLI parsing ──────────────────────────────────────────────────────────
if (process.argv.length < 4) {
  console.error('Usage: node compareI18n.cjs <file1.json> <file2.json>');
  process.exit(1);
}
const [ , , fileA, fileB ] = process.argv;

// ── 2. Helper functions ─────────────────────────────────────────────────────
function loadJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`Error reading or parsing "${path}": ${err.message}`);
    process.exit(1);
  }
}

/** Returns true if the key appears somewhere in ./src
 *  (skipping node_modules and any locales directory). */
function keyAppearsInSrc(key) {
  const res = spawnSync(
    'grep',
    [
      '-R', '-F', '-q',
      '--exclude-dir=node_modules',
      '--exclude-dir=locales',
      key,
      './src'
    ],
    { stdio: 'ignore' }
  );
  return res.status === 0;        // 0 → grep found a match
}

// ── 3. Load JSON files & gather keys ────────────────────────────────────────
const jsonA = loadJson(fileA);
const jsonB = loadJson(fileB);

const keysA = new Set(Object.keys(jsonA));
const keysB = new Set(Object.keys(jsonB));

// ── 4. Compute key differences ──────────────────────────────────────────────
const onlyInA = [...keysA].filter(k => !keysB.has(k)); // no grep filtering
let onlyInB   = [...keysB].filter(k => !keysA.has(k)); // will be grep-filtered

// ── 5. Apply grep check *only* to keys unique to fileB ──────────────────────
onlyInB = onlyInB.filter(k => !keyAppearsInSrc(k));

// ── 6. Output results ───────────────────────────────────────────────────────
console.log(`Keys in ${fileA} but not in ${fileB}:`);
console.log(onlyInA.length ? onlyInA.join('\n') : '(none)');
console.log('');

console.log(`Keys in ${fileB} but not in ${fileA} (and not used in ./src):`);
console.log(onlyInB.length ? onlyInB.join('\n') : '(none)');

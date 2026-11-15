// First Paycheck ($PAYDAY) — makefun-coin-promo-01 entry.
//
// The coin was launched on pump.fun by the agent (no dev buy); this
// program only hands the launch record to the grader. It copies
// LAUNCH.json from the repository root into the output directory, then
// reads the copy back and checks it is a JSON object with a base58 mint
// and a base58 create signature, so a broken record fails loudly here
// instead of being handed in silently.
//
// Standard library only. No network, no wall clock, no files outside
// the repository. Two runs write identical bytes.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

function isBase58(value: unknown, min: number, max: number): value is string {
  return (
    typeof value === 'string' &&
    value.length >= min &&
    value.length <= max &&
    BASE58.test(value)
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const outPath = join(OUTPUT_DIR, 'LAUNCH.json');
copyFileSync(join(BOT_DIR, 'LAUNCH.json'), outPath);

const record = JSON.parse(readFileSync(outPath, 'utf8')) as unknown;
if (typeof record !== 'object' || record === null || Array.isArray(record)) {
  console.error('LAUNCH.json is not a JSON object');
  process.exit(1);
}
const { mint, create_signature } = record as Record<string, unknown>;
const keys = Object.keys(record as Record<string, unknown>).sort();
if (keys.length !== 2 || keys[0] !== 'create_signature' || keys[1] !== 'mint') {
  console.error('LAUNCH.json must hold exactly mint and create_signature');
  process.exit(1);
}
if (!isBase58(mint, 32, 44)) {
  console.error('LAUNCH.json has no valid mint (base58, 32-44 characters)');
  process.exit(1);
}
if (typeof mint === 'string' && !mint.endsWith('pump')) {
  console.error('LAUNCH.json mint is not a pump.fun mint (must end in "pump")');
  process.exit(1);
}
if (!isBase58(create_signature, 64, 88)) {
  console.error('LAUNCH.json has no valid create_signature (base58, 64-88 characters)');
  process.exit(1);
}

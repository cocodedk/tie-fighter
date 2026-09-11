import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Generated-file exceptions are documented in codex.md.
const ignored = new Set([
  '.git', 'node_modules', 'dist', 'test-results', 'playwright-report', 'package-lock.json', 'LICENSE',
]);
const binary = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2']);
let count = 0;
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else {
      if (binary.has(extname(entry.name).toLowerCase())) continue;
      const content = await readFile(path, 'utf8');
      const lines = content.trimEnd().split('\n').length;
      count++;
      if (lines >= 100) throw new Error(`${path}: ${lines} lines (limit: 99).`);
    }
  }
}
await check('.');
console.log(`${count} maintained files checked; all under 100 lines.`);

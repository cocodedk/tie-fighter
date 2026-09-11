# Project instructions

- Keep files under 100 lines by default.
- Prefer small, cohesive modules; do not compress code to meet the limit.
- Exceptions are allowed when splitting would hurt clarity or maintainability;
  document the reason here before retaining an oversized handwritten file.
- Keep the first game version simple: Three.js, WASD/arrow-key flight, Space to shoot.

## File-length exceptions

- `package-lock.json`: generated dependency lockfile; preserve npm's format.
- `node_modules/`, `dist/`, `test-results/`, `playwright-report/`: generated files.

- `LICENSE`: standard Apache-2.0 license text; preserve the complete legal text.
- Binary assets such as `public/og.png`: image data has no meaningful line count.

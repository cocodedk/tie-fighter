## 2026-09-14 (Codex) — Darth Vader ending ready for publication

**State:** Independent source and visual review complete; all eight production
language/viewport checks passed using `/tmp/tie-vader-check.mjs`.

**Tried:** The full suite passed 29 tests before a reload-readiness race; waiting
for native tool registration fixed it, and both focused victory tests then passed.
Final model screenshots are in `/tmp/tie-vader/`.

**Lesson:** A failed save must not resurrect a completed campaign after New game;
readiness checks must wait for live behavior rather than placeholder HTML.

**Next:** Run the mandatory 30-test push gate, merge green CI, and verify the
published ending, new campaigns, and production assets.

## 2026-09-14 (Codex) — pilot progression ready for publication

**State:** Implementation and independent review complete; publication gates pending.
The 25-test suite passed before the final responsive adjustment; all eight final
production language/viewport checks passed using `/tmp/tie-career-check.mjs`.

**Tried:** Browser measurements exposed short-screen overlaps that source review
missed; screenshots are in `/tmp/tie-career/`.

**Lesson:** Check both language fonts on short portrait and landscape screens;
CSS import order can override responsive typography even when the rules exist.

**Next:** Run the mandatory push gate, merge a green PR, and verify the deployed
career progression and production assets.

## 2026-09-14 (Codex) — dogfight update ready for publication

**State:** Gameplay changes and independent review complete through `cca1140`;
all 19 native Chrome tests passed with tracing, no skips or retries.

**Tried:** Earlier local runs had intermittent browser exits and startup failures;
no concrete exit cause was found; diagnostics are in `/tmp/tie-game-trace-run.log`.

**Lesson:** Test fixtures must import the running page’s exact module URLs;
a separate import can create a second game and misleading physics failures.

**Next:** Push through the mandatory verification hook, merge a green PR,
and verify repairs on the deployed English and Persian pages.

## 2026-09-14 (Codex) — dogfight update ready for publication

**State:** Gameplay changes and independent review complete through `cca1140`;
all 19 native Chrome tests passed with tracing, no skips or retries.

**Tried:** Earlier local runs had intermittent browser exits and startup failures;
no concrete exit cause was found; diagnostics are in `/tmp/tie-game-trace-run.log`.

**Lesson:** Test fixtures must import the running page’s exact module URLs;
a separate import can create a second game and misleading physics failures.

**Next:** Push through the mandatory verification hook, merge a green PR,
and verify repairs on the deployed English and Persian pages.

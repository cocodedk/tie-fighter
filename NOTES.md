## 2026-09-16 (Codex) — optional bonus A-wings

**State:** Source review and four focused tests passed; previous release is `e53494e`.
**Tried:** Native WebMCP checks distinguish bonus points from kills and prove missed
A-wings cannot spend the final escape allowance; production QA is
`/tmp/tie-bonus-check.mjs`, with screenshots in `/tmp/tie-bonus/`.
**Lesson:** Observe terminal state instead of issuing flight controls after a forced escape.
**Next:** Finish visual review, run the strict 45-test gate, and verify the public release.

## 2026-09-15 (Codex) — smooth victory loop

**State:** Eight-second loop implemented; previous release is `a85e64c`.
**Tried:** Boundary/RTL tests and `/tmp/tie-loop-check.mjs`; images in `/tmp/tie-loop/`.
**Lesson:** Match Vader’s boundary pose and hide ship repositioning beyond the fog.
**Next:** Complete independent review, the strict 41-test gate, and live publication checks.

## 2026-09-15 (Codex) — Vader background battle ready for publication

**State:** Independent source and test review approved; two scripted pursuits
show the Fighter destroying an X-wing and Interceptor destroying an A-wing.
Production validation is in `/tmp/tie-battle-check.mjs`, screenshots in
`/tmp/tie-battle/`; the previous release is `d3a9800`.

**Tried:** WebMCP exposes both battle phases; tests check real cannon counts,
explosions, replay reset, frozen gameplay, and a stable reduced-motion ending.

**Lesson:** Check animated ship paths against window beams on short screens;
ship banking must expose the A-wing silhouette at its displayed size.

**Next:** Finish eight production layout checks, run the strict 40-test push
gate, merge green CI, and verify the deployed battle and production assets.

## 2026-09-15 (Codex) — four Interceptor cannons ready for publication

**State:** Independent cannon/model/test review approved; 10 focused tests and
eight production checks passed via `/tmp/tie-guns-check.mjs`; screenshots are in
`/tmp/tie-guns/`, and the previous ship-selection release is `e52b49b`.

**Tried:** Explicit muzzle transforms keep banked lasers aligned with all four
wing guns; swept tests verify each path hits and the empty center does not.

**Lesson:** Model weapon mounts explicitly so shared cockpit geometry cannot
give ships the wrong armament.

**Next:** Run the strict 38-test gate, merge green CI, and verify the live update;
review also noted an existing Persian phone Pause/Hull overlap for a separate fix.

## 2026-09-15 (Codex) — ship selection ready for publication

**State:** Independent source and visual review approved; all eight production
selection/layout checks passed using `/tmp/tie-ship-check.mjs`.

**Tried:** Native radio controls exposed a hidden-state CSS override and a blocked
Enter shortcut; both are fixed, and measured spacing clears both language HUDs.
Screenshots are in `/tmp/tie-ships/`; the previous release is `7645eeb`.

**Lesson:** Preserve native radio arrow keys without blocking the advertised launch
shortcut, and verify actual visibility when custom display rules meet `hidden`.

**Next:** Run the strict 35-test push gate, merge green CI, and verify the live
ship choice, remembered preference, and production assets.

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

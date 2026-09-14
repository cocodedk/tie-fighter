# Pilot progression plan

Kills build a permanent service record in this browser; restarting a run keeps it.
Awards are cosmetic, so flight, damage, scoring, and five-kill repairs stay balanced.

## Ranks — lifetime kills

| Rank | Kills |
| --- | ---: |
| Cadet | 0 |
| Pilot | 10 |
| Lieutenant | 25 |
| Captain | 50 |
| Commander | 100 |
| Admiral | 250 |

## Medals — kills in one run

| Medal | Kills |
| --- | ---: |
| First Victory | 1 |
| Ace Wings | 10 |
| Imperial Star | 25 |

## Honors — lifetime kills

| Honor | Kills |
| --- | ---: |
| Veteran | 50 |
| Elite | 100 |
| Legend | 250 |

## Player experience

The HUD shows the current rank; a brief award banner announces new achievements.
A Service record button on the launch, pause, and debrief screens opens the full
record, with the next promotion, earned awards, and requirements for locked awards.
English and Persian share progress; WebMCP exposes the same record for testing.
The existing saved best score credits its known kills once; older run totals are
unknown, so they cannot be reconstructed.

## Visual plan

Keep the game's Barlow / Barlow Condensed typography and Vazirmatn for Persian.
Use space navy `#080c13`, hull white `#edf0ee`, steel `#9babb4`, bronze `#d5ae78`,
and laser red `#ff5555`; medals use geometric ribbons, honors use star insignia.
The record follows reading direction and scrolls on small screens.

```text
Service record                         Close
Current rank                 Career kills
Progress to next rank
Medals       [ribbon] [ribbon] [ribbon]
Honors       [star]   [star]   [star]
```

Design review: keep the existing flight scene dominant; a separate service record
avoids crowding the cockpit, and earned ribbon colors carry the visual emphasis.

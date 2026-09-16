# Pilot progression plan

Kills build a permanent service record in this browser; restarting a run keeps it.
Each destroyed ship counts as one kill, including 200-point bonus A-wings.
Medals and honors are cosmetic; flight, damage, scoring, and five-kill repairs stay balanced.

## Ranks — kills in the current campaign

| Rank | Kills |
| --- | ---: |
| Cadet | 0 |
| Pilot | 10 |
| Lieutenant | 25 |
| Captain | 50 |
| Commander | 100 |
| Darth Vader | 250 |

At 250 campaign kills, the game ends immediately in victory: a procedural low-poly
Darth Vader raises his arm and ignites his red lightsaber on an Imperial bridge,
claiming victory over the Rebel forces; gameplay stays frozen during the scene.
Behind him, a TIE Fighter pursues and destroys an X-wing with two cannons, then a
four-cannon Interceptor destroys an A-wing; green bolts end in low-poly explosions.
The eight-second scene loops: Vader lowers his arm, the ships fly into the distance,
and the next pass begins without a visible reset; background kills add no score.
**New game** starts a fresh campaign at Cadet while preserving lifetime kills,
best score, medals, and honors; failed patrols retain campaign progress.
The service record offers a replay after the first victory; reduced-motion settings
show the final pose, and Escape dismisses the scene without starting a new game.

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
A legacy best score from before bonus targets credits its known kills once; bonus-era
scores cannot reconstruct a lost career record because ships award different points.

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

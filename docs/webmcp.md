# Chrome WebMCP testing

Enable `chrome://flags/#enable-webmcp-testing`, relaunch Chrome, and open the game.
Five native tools are exposed through `document.modelContext`:

- `get_game_state`: mode, `shipType`, `cannonCount`, score, `bestScore`, `health`, `maxHealth`, escapes,
  positions, bounds, `activeShots` (linked volleys), and `activeLasers` (visible beams); `enemyShots` includes positions and
  fixed velocities, and `invulnerableSeconds` reports protection after a hit.
  `career` includes lifetime `kills`, `campaignKills`, `bestRun`, `rank`, `nextRank`, and medals/honors
  with kill thresholds and `earned` flags; new games retain earned awards.
  At Darth Vader the mode becomes `won`; `victory` reports animation state,
  and `start_game` begins a new campaign while `resume_game` cannot resume a win.
  `killsUntilRepair` counts down to a full hull repair every five kills.
- `start_game`: start or reset a run; optionally pass `shipType: "fighter"` or
  `shipType: "interceptor"`, or omit it to use the remembered choice.
- `pause_game` / `resume_game`: control the current run.
- `control_fighter`: horizontal/vertical input (-1, 0, 1), `fire`, and `duration_ms`
  (50–3000, default 250); returns when the action completes or is interrupted.

In Chrome 153's console, discover and invoke tools:

```js
const tools = await document.modelContext.getTools();
const call = async (name, args = {}) => JSON.parse(
  await document.modelContext.executeTool(
    tools.find(tool => tool.name === name), JSON.stringify(args)
  )
);
await call('start_game', { shipType: 'interceptor' });
await call('control_fighter', { fire: true, duration_ms: 1000 });
await call('get_game_state');
```

Chrome 155+ also accepts an argument object instead of the JSON string.
Keep the game tab visible while running flight tools; switching tabs pauses it.
Normal keyboard play works without WebMCP support.
See [Chrome's imperative API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
and [local flag setup](https://developer.chrome.com/docs/ai/webmcp#local-webmcp).

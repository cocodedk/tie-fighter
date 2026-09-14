# Chrome WebMCP testing

Enable `chrome://flags/#enable-webmcp-testing`, relaunch Chrome, and open the game.
Five native tools are exposed through `document.modelContext`:

- `get_game_state`: mode, score, `bestScore`, `health`, `maxHealth`, escapes,
  positions, bounds, and active projectiles; `enemyShots` includes positions and
  fixed velocities, and `invulnerableSeconds` reports protection after a hit.
  `killsUntilRepair` counts down to a full hull repair every five kills.
- `start_game`: start or reset a run.
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
await call('start_game');
await call('control_fighter', { fire: true, duration_ms: 1000 });
await call('get_game_state');
```

Chrome 155+ also accepts an argument object instead of the JSON string.
Keep the game tab visible while running flight tools; switching tabs pauses it.
Normal keyboard play works without WebMCP support.
See [Chrome's imperative API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
and [local flag setup](https://developer.chrome.com/docs/ai/webmcp#local-webmcp).

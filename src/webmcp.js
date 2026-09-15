import { getState } from './state.js';
import { start, pause, resume } from './game.js';
import { shipTypes } from './player.js';
import { controlFighter } from './agent-control.js';

const emptyInput = { type: 'object', properties: {}, additionalProperties: false };

export async function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const tools = [
    {
      name: 'get_game_state',
      description: 'Read selected shipType, mode, score, best score, career kills, rank, medals, honors, hull health, kills until full repair, escapes, incoming laser positions and velocities, '
        + 'ship positions, flight bounds, and active shots. Player lasers travel toward negative Z; enemy lasers toward positive Z.',
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true },
      execute: () => getState(),
    },
    {
      name: 'start_game',
      description: 'Start or reset a run, optionally choosing fighter or interceptor; otherwise keep the selected ship.',
      inputSchema: {
        type: 'object', additionalProperties: false,
        properties: { shipType: { type: 'string', enum: shipTypes, description: 'Craft to fly in the new run.' } },
      },
      execute: ({ shipType } = {}) => { start(shipType); return getState(); },
    },
    {
      name: 'pause_game',
      description: 'Pause flight and cancel active control input. Leaves an inactive game unchanged.',
      inputSchema: emptyInput,
      execute: () => { pause(); return getState(); },
    },
    {
      name: 'resume_game',
      description: 'Resume a paused run; use start_game for a new run.',
      inputSchema: emptyInput,
      execute: () => { resume(); return getState(); },
    },
    {
      name: 'control_fighter',
      description: 'Fly and/or shoot using the same controls as WASD/arrow keys and Space for a bounded '
        + 'duration of game time, then release and return state with a completion status. '
        + 'Requires playing mode. Await completion before issuing another control; keyboard '
        + 'input, pause, restart, game over, or cancellation interrupts it.',
      inputSchema: {
        type: 'object', additionalProperties: false,
        properties: {
          horizontal: { type: 'integer', enum: [-1, 0, 1], description: '-1 left, 0 neutral, 1 right.' },
          vertical: { type: 'integer', enum: [-1, 0, 1], description: '-1 down, 0 neutral, 1 up.' },
          fire: { type: 'boolean', description: 'Hold the fire button; defaults to false.' },
          duration_ms: { type: 'integer', minimum: 50, maximum: 3000, description: 'Duration; defaults to 250 ms.' },
        },
      },
      execute: controlFighter,
    },
  ];
  const controller = new AbortController();
  for (const tool of tools) {
    const execute = tool.execute;
    await context.registerTool({
      ...tool,
      execute: async (input, options) => JSON.stringify(await execute(input, options)),
    }, { signal: controller.signal });
  }
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) controller.abort();
  });
}

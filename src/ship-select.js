import { player, selectShip } from './player.js';
import { state } from './state.js';

export function updateShipSelector(mode) {
  const selector = document.getElementById('ship-select');
  selector.hidden = mode === 'playing' || mode === 'paused';
  selector.disabled = selector.hidden;
  selector.querySelectorAll('input').forEach((input) => {
    input.checked = input.value === player.userData.shipType;
  });
}

export function bindShipSelector() {
  const selector = document.getElementById('ship-select');
  selector.addEventListener('change', (event) => {
    if (['ready', 'over', 'won'].includes(state.mode)) selectShip(event.target.value);
    updateShipSelector(state.mode);
  });
  updateShipSelector(state.mode);
}

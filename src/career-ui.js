import { getCareer } from './career.js';
import { careerText as text } from './career-text.js';
import { showVictory } from './victory.js';

const $ = (id) => document.getElementById(id);
let bannerTime = 0;

function awardTile(award, type) {
  const tile = document.createElement('li');
  tile.dataset.award = award.id;
  tile.dataset.earned = award.earned;
  const icon = document.createElement('span');
  icon.className = `award-icon ${type}`;
  icon.setAttribute('aria-hidden', 'true');
  const title = document.createElement('strong');
  title.textContent = text[award.id];
  const target = document.createElement('span');
  target.textContent = type === 'medals' ? text.runTarget(award.kills) : text.careerTarget(award.kills);
  const status = document.createElement('small');
  status.textContent = award.earned ? text.earned : text.locked;
  tile.append(icon, title, target, status);
  return tile;
}

export function updateCareerHud() {
  $('pilot-rank').textContent = text[getCareer().rank.id];
}

export function renderCareer() {
  const record = getCareer();
  $('career-rank').textContent = text[record.rank.id];
  $('career-kills').textContent = text.careerKills(record.kills);
  $('career-best').textContent = text.bestRun(record.bestRun);
  $('campaign-kills').textContent = text.campaign(record.campaignKills);
  $('victory-replay').hidden = record.kills < 250;
  const next = record.nextRank;
  $('career-next').textContent = next ? text.next(next.remaining, text[next.id]) : text.highest;
  $('rank-progress').max = next ? next.kills - record.rank.kills : 1;
  $('rank-progress').value = next ? record.campaignKills - record.rank.kills : 1;
  for (const type of ['medals', 'honors']) {
    $(type).replaceChildren(...record[type].map((award) => awardTile(award, type)));
  }
}

export function bindCareer() {
  document.querySelectorAll('[data-career]').forEach((element) => {
    element.textContent = text[element.dataset.career];
  });
  $('service-open').disabled = false;
  $('service-open').addEventListener('click', () => {
    renderCareer();
    $('service-record').showModal();
  });
  $('service-close').addEventListener('click', () => $('service-record').close());
  $('victory-replay').addEventListener('click', () => showVictory());
  updateCareerHud();
}

export function showAwards(unlocked) {
  if (!unlocked.length) return;
  $('award-notice').textContent = unlocked.map(({ type, id }) =>
    type === 'rank' ? text.promotion(text[id]) : text.award(text[id])).join(' • ');
  bannerTime = 4;
  $('award-notice').hidden = false;
}

export function clearAwards() {
  bannerTime = 0;
  $('award-notice').hidden = true;
  $('award-notice').textContent = '';
}

export function updateAwards(dt) {
  bannerTime = Math.max(0, bannerTime - dt);
  if (bannerTime === 0) $('award-notice').hidden = true;
}

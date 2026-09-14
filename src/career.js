import { readBestScore } from './scores.js';

export const careerKey = 'tie-fighter.career.v1';
export const ranks = [
  ['cadet', 0], ['pilot', 10], ['lieutenant', 25],
  ['captain', 50], ['commander', 100], ['darthVader', 250],
];
const medals = [['firstVictory', 1], ['aceWings', 10], ['imperialStar', 25]];
const honors = [['veteran', 50], ['elite', 100], ['legend', 250]];
const validCount = (value) => Number.isSafeInteger(value) && value >= 0;

function readCareer() {
  const legacyKills = Math.floor(readBestScore() / 100);
  try {
    const saved = JSON.parse(localStorage.getItem(careerKey));
    if (saved && validCount(saved.kills) && validCount(saved.bestRun)
      && saved.bestRun <= saved.kills) {
      const campaignKills = saved.campaignKills ?? Math.min(250, saved.kills);
      if (validCount(campaignKills) && campaignKills <= Math.min(250, saved.kills)) {
        return { kills: saved.kills, bestRun: saved.bestRun, campaignKills };
      }
    }
  } catch {
    // Invalid or unavailable storage must not prevent flight.
  }
  return { kills: legacyKills, bestRun: legacyKills, campaignKills: Math.min(250, legacyKills) };
}

export const career = readCareer();
let resetPending = false;
const awards = (items, kills) => items.map(([id, target]) => ({ id, kills: target, earned: kills >= target }));

export function getCareer() {
  const index = ranks.findLastIndex(([, kills]) => career.campaignKills >= kills);
  const [id, kills] = ranks[index];
  const next = ranks[index + 1];
  return {
    kills: career.kills, bestRun: career.bestRun, campaignKills: career.campaignKills, rank: { id, kills },
    nextRank: next ? { id: next[0], kills: next[1], remaining: next[1] - career.campaignKills } : null,
    medals: awards(medals, career.bestRun), honors: awards(honors, career.kills),
  };
}

export function recordKill(runKills) {
  const before = getCareer();
  const saved = readCareer();
  career.bestRun = Math.max(career.bestRun, saved.bestRun, runKills);
  career.kills = Math.max(Math.min(Number.MAX_SAFE_INTEGER,
    Math.max(career.kills, saved.kills) + 1), career.bestRun);
  career.campaignKills = Math.min(250, Math.max(career.campaignKills, resetPending ? 0 : saved.campaignKills) + 1);
  try {
    localStorage.setItem(careerKey, JSON.stringify(career));
    resetPending = false;
  } catch {
    // Earned progress still lasts for this page when storage is blocked or full.
  }
  const after = getCareer();
  const unlocked = after.rank.id === before.rank.id ? [] : [{ type: 'rank', id: after.rank.id }];
  for (const type of ['medals', 'honors']) {
    after[type].forEach((award, index) => {
      if (award.earned && !before[type][index].earned) unlocked.push({ type, id: award.id });
    });
  }
  return unlocked;
}

export function restartCampaign() {
  career.campaignKills = 0;
  resetPending = true;
  try {
    localStorage.setItem(careerKey, JSON.stringify(career));
    resetPending = false;
  } catch {
    // A new campaign remains playable when storage is unavailable.
  }
}

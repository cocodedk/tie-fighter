const key = 'tie-fighter.best-score';
const bonusKey = 'tie-fighter.bonus-scores.v1';

export function readBestScore() {
  try {
    const score = Number(localStorage.getItem(key));
    return Number.isSafeInteger(score) && score >= 0 ? score : 0;
  } catch {
    return 0;
  }
}

export function readLegacyKills() {
  try {
    // Bonus-era scores cannot reconstruct a missing career record.
    return localStorage.getItem(bonusKey) ? 0 : Math.floor(readBestScore() / 100);
  } catch { return 0; }
}

export function saveBestScore(score, runKills) {
  const best = Math.max(score, readBestScore());
  try {
    if (score > runKills * 100) localStorage.setItem(bonusKey, '1');
    localStorage.setItem(key, String(best));
  } catch {
    // Keep the score in memory when browser storage is unavailable or full.
  }
  return best;
}

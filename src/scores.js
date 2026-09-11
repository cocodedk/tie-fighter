const key = 'tie-fighter.best-score';

export function readBestScore() {
  try {
    const score = Number(localStorage.getItem(key));
    return Number.isSafeInteger(score) && score >= 0 ? score : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score) {
  const best = Math.max(score, readBestScore());
  try {
    localStorage.setItem(key, String(best));
  } catch {
    // Keep the score in memory when browser storage is unavailable or full.
  }
  return best;
}

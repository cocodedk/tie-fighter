const fa = document.documentElement.lang === 'fa';
export const language = fa ? 'fa' : 'en';
export const text = fa ? {
  name: 'تای فایتر', score: 'امتیاز', best: 'رکورد', hull: 'بدنه', escapes: 'گریخته‌ها',
  readyTitle: 'بازی تای فایتر', readyDescription: 'ایکس‌وینگ‌ها را شکار کن و از لیزرهای قرمزشان جاخالی بده. با صفر شدن سلامت بدنه یا فرار سه دشمن، گشت تمام می‌شود.',
  launch: 'شروع پرواز', resume: 'ادامهٔ پرواز', again: 'پرواز دوباره', pause: 'توقف',
  pausedTitle: 'پرواز متوقف شد.', pausedDescription: 'هر وقت آماده‌ای، ادامه بده.', overTitle: 'بخش از دست رفت.',
  debrief: (score) => `${score / 100} ایکس‌وینگ نابود شد. ${score} امتیاز. دوباره پرواز کن.`,
  ready: 'منتظر خلبان', playing: 'گشت فعال', paused: 'گشت متوقف', over: 'پایان مأموریت',
  repair: (count) => `${count} شکار تا ترمیم کامل`, repairDone: 'بدنه کاملاً ترمیم شد.',
  destroyedTitle: 'جنگنده نابود شد.', damage: (health) => `اصابت! بدنه: ${health} از ۳`,
  enter: 'یا Enter را بزن', resumeHint: 'برای ادامه Enter یا Esc را بزن',
  fly: 'حرکت', fire: 'شلیک', touchHint: 'با جهت‌ها حرکت کن و دکمهٔ شلیک را نگه دار.',
  up: 'بالا', down: 'پایین', left: 'چپ', right: 'راست', canvas: 'بازی پرواز جنگندهٔ تای',
  escape: (remaining) => remaining ? `یک ایکس‌وینگ گریخت؛ ${remaining} فرصت باقی است` : 'دشمن از بخش عبور کرد',
  loadFailed: 'بازی بارگیری نشد. اتصال اینترنت را بررسی کن و صفحه را دوباره بارگیری کن.',
  unavailable: 'پرواز در دسترس نیست', webgl: 'این بازی به WebGL2 نیاز دارد؛ شتاب‌دهی سخت‌افزاری مرورگر را فعال کن.',
} : {
  name: 'TIE Fighter', score: 'Score', best: 'Best', hull: 'Hull', escapes: 'Escapes',
  readyTitle: 'TIE Fighter game', readyDescription: 'Hunt X-wings and dodge their red lasers. The patrol ends at zero hull or three escapes.',
  launch: 'LAUNCH FIGHTER', resume: 'RESUME FLIGHT', again: 'FLY AGAIN', pause: 'Pause',
  pausedTitle: 'Patrol paused.', pausedDescription: 'Ready when you are, pilot.', overTitle: 'Sector lost.',
  debrief: (score) => `${score / 100} X-wings destroyed. ${score} points. Take another flight.`,
  ready: 'Awaiting pilot', playing: 'Patrol active', paused: 'Patrol paused', over: 'Sector lost',
  repair: (count) => `${count} ${count === 1 ? 'kill' : 'kills'} to full repair`, repairDone: 'Hull fully repaired.',
  destroyedTitle: 'TIE destroyed.', damage: (health) => `Hit! Hull: ${health} / 3`,
  enter: 'Or press Enter', resumeHint: 'Or press Enter / Esc',
  fly: 'Fly', fire: 'Fire', touchHint: 'Use the directions to fly. Hold Fire to shoot.',
  up: 'Up', down: 'Down', left: 'Left', right: 'Right', canvas: 'TIE fighter flight game',
  escape: (remaining) => remaining ? `X-wing escaped. ${remaining} ${remaining === 1 ? 'chance' : 'chances'} left.` : 'Sector breached',
  loadFailed: 'The game could not load. Check your connection and reload the page.',
  unavailable: 'Flight unavailable', webgl: 'This game needs WebGL2. Enable hardware acceleration in your browser.',
};

export function localize() {
  document.querySelectorAll('[data-text]').forEach((element) => {
    element.textContent = text[element.dataset.text];
  });
  document.querySelectorAll('[data-label]').forEach((element) => {
    element.setAttribute('aria-label', text[element.dataset.label]);
  });
}

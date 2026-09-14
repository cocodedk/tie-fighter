import { language } from './i18n.js';

export const careerText = language === 'fa' ? {
  service: 'پروندهٔ خلبان', close: 'بستن', medals: 'مدال‌ها', honors: 'افتخارات',
  cadet: 'دانشجو', pilot: 'خلبان', lieutenant: 'ستوان', captain: 'سروان',
  commander: 'فرمانده', admiral: 'دریاسالار', firstVictory: 'نخستین پیروزی',
  aceWings: 'بال‌های تک‌خال', imperialStar: 'ستارهٔ امپراتوری',
  veteran: 'کهنه‌کار', elite: 'زبده', legend: 'افسانه',
  earned: 'دریافت شد', locked: 'هنوز دریافت نشده', saved: 'پیشرفت در این مرورگر ذخیره می‌شود.',
  careerKills: (kills) => `${kills} شکار در کارنامه`, bestRun: (kills) => `بهترین پرواز: ${kills} شکار`,
  next: (kills, rank) => `${kills} شکار تا درجهٔ ${rank}`, highest: 'بالاترین درجه کسب شد',
  runTarget: (kills) => `${kills} شکار در یک پرواز`, careerTarget: (kills) => `${kills} شکار در کارنامه`,
  promotion: (rank) => `ارتقا به ${rank}`, award: (name) => `نشان دریافت شد: ${name}`,
} : {
  service: 'Service record', close: 'Close', medals: 'Medals', honors: 'Honors',
  cadet: 'Cadet', pilot: 'Pilot', lieutenant: 'Lieutenant', captain: 'Captain',
  commander: 'Commander', admiral: 'Admiral', firstVictory: 'First Victory',
  aceWings: 'Ace Wings', imperialStar: 'Imperial Star',
  veteran: 'Veteran', elite: 'Elite', legend: 'Legend',
  earned: 'Earned', locked: 'Locked', saved: 'Progress is saved in this browser.',
  careerKills: (kills) => `${kills} career ${kills === 1 ? 'kill' : 'kills'}`,
  bestRun: (kills) => `Best run: ${kills} ${kills === 1 ? 'kill' : 'kills'}`,
  next: (kills, rank) => `${kills} ${kills === 1 ? 'kill' : 'kills'} to ${rank}`,
  highest: 'Highest rank achieved',
  runTarget: (kills) => `${kills} ${kills === 1 ? 'kill' : 'kills'} in one run`,
  careerTarget: (kills) => `${kills} career kills`,
  promotion: (rank) => `Promoted to ${rank}`, award: (name) => `Award earned: ${name}`,
};

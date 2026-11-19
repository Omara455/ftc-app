// Arabic number agreement for the counts the designs show
// («ساعتين», «3 ساعات», «باقي 3 أيام»). Standard rules, approved in review:
// 1 → singular, 2 → dual, 3–10 → plural, 11+ → singular (accusative where needed).

/** Count + noun with Arabic agreement. `one`/`two` are complete words, so no number is shown. */
export function plural(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/** 1 ساعة · 2 ساعتين · 3–10 ساعات · 11+ ساعة */
export const hoursLabel = (n: number) => plural(n, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');

/** Unit only, after a signed number: «+3 ساعات», «+2 ساعتين», «+1 ساعة». */
export const hoursUnit = (n: number) =>
  n === 1 ? 'ساعة' : n === 2 ? 'ساعتين' : n <= 10 ? 'ساعات' : 'ساعة';

/** باقي يوم · باقي يومين · باقي 3 أيام · باقي 11 يوماً */
export const daysLeftLabel = (n: number) => `باقي ${plural(n, 'يوم', 'يومين', 'أيام', 'يوماً')}`;

/** باقي مقعد · باقي مقعدين · باقي 3 مقاعد · باقي 11 مقعداً */
export const seatsLeftLabel = (n: number) =>
  `باقي ${plural(n, 'مقعد', 'مقعدين', 'مقاعد', 'مقعداً')}`;

/** عضو · عضوان · 3 أعضاء · 11 عضواً */
export const membersLabel = (n: number) => plural(n, 'عضو', 'عضوان', 'أعضاء', 'عضواً');

/** لجنة · لجنتان · 8 لجان · 11 لجنة */
export const committeesLabel = (n: number) => plural(n, 'لجنة', 'لجنتان', 'لجان', 'لجنة');

/** فريق · فريقان · 4 فرق · 11 فريقاً */
export const teamsLabel = (n: number) => plural(n, 'فريق', 'فريقان', 'فرق', 'فريقاً');

/** «1.2 م.ب», «340 ك.ب» */
export function fileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(/\.0$/, '')} م.ب`;
  return `${Math.max(1, Math.round(bytes / 1000))} ك.ب`;
}

/** «سلمان ومحمد» · «أنت، سلمان، ومحمد» (screen 09) */
export function listAnd(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} و${names[1]}`;
  return `${names.slice(0, -1).join('، ')}، و${names.at(-1)}`;
}

/** First name only: «فيصل الدوسري» → «فيصل». */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

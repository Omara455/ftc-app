// Arabic number agreement for the counts the designs show
// («ساعتين», «3 ساعات», «باقي 3 أيام»).

function plural(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/** 1 ساعة · 2 ساعتين · 3–10 ساعات · 11+ ساعة */
export const hoursLabel = (n: number) => plural(n, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');

/** باقي يوم · باقي يومين · باقي 3 أيام · باقي 11 يوم */
export const daysLeftLabel = (n: number) => `باقي ${plural(n, 'يوم', 'يومين', 'أيام', 'يوم')}`;

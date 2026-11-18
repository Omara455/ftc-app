// Search helpers for Arabic names. Normalisation keeps the string length, so match
// positions found on the normalised text can highlight the original («سا» in «سارة»).
const MAP: Record<string, string> = {
  أ: 'ا',
  إ: 'ا',
  آ: 'ا',
  ٱ: 'ا',
  ة: 'ه',
  ى: 'ي',
  ؤ: 'و',
  ئ: 'ي',
};

/** Same length as the input: letter variants folded, Latin lowercased. */
export function normalizeArabic(s: string): string {
  let out = '';
  for (const ch of s) out += MAP[ch] ?? ch.toLowerCase();
  return out;
}

/** Index of `query` in `text` after normalising both, or -1. */
export function matchIndex(text: string, query: string): number {
  const q = normalizeArabic(query.trim());
  return q ? normalizeArabic(text).indexOf(q) : -1;
}

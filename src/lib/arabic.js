/*
 * Arabic text normalisation for search.
 *
 * Search must match "التوكل" against "التوكّل", "الإيمان" against "الايمان",
 * and so on. normalize() strips diacritics and unifies letter variants, and
 * also returns a map from each normalised character back to its index in the
 * original string, so matches can be highlighted in the original text.
 */

const DROP = /[ؐ-ًؚ-ٰٟۖ-ۭـ‌-‏]/;

const FOLD = {
  "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
  "ى": "ي", "ئ": "ي",
  "ؤ": "و",
  "ة": "ه",
};

export function normalize(text) {
  let out = "";
  const map = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (DROP.test(ch)) continue;
    let folded = FOLD[ch] ?? ch.toLowerCase();
    if (/\s/.test(folded)) {
      if (out.endsWith(" ")) continue; // collapse runs of whitespace
      folded = " ";
    }
    out += folded;
    map.push(i);
  }
  return { text: out, map };
}

export const normalizeQuery = (q) => normalize(q).text.trim();

/** Extend an original-text index past any trailing diacritics. */
export function extendOverMarks(text, end) {
  while (end < text.length && DROP.test(text[end])) end++;
  return end;
}

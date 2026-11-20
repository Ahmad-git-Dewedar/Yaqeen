/*
 * Site-wide search over the chapter content.
 *
 * The index is built from the rendered page (no duplicated content): every
 * leaf text block inside a chapter becomes an entry. Matching ignores
 * diacritics and letter variants (see arabic.js) and treats the article
 * "ال" as optional, so "التوكل" also finds "يتوكل"
 */
import { normalize, normalizeQuery, extendOverMarks } from "./arabic.js";

const BLOCKS = "h2, h3, h4, p, li, dt, dd, blockquote, figcaption, button.faq__q";
export const MAX_RESULTS = 30;

/** Text of a block, skipping decorative copies and spacing inline labels */
function textOf(el) {
  let out = "";
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) out += child.nodeValue;
      else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.getAttribute("aria-hidden") === "true" || child.tagName === "svg") continue;
        const spaced = child.tagName === "SPAN";
        if (spaced) out += " ";
        walk(child);
        if (spaced) out += " ";
      }
    }
  };
  walk(el);
  return out.replace(/\s+/g, " ").trim();
}

export function buildIndex() {
  const entries = [];
  document.querySelectorAll("[data-chapter]").forEach((chapter) => {
    const chapterTitle = textOf(chapter.querySelector(".chapter__title"));
    chapter.querySelectorAll(BLOCKS).forEach((el) => {
      if (el.closest(".quiz, .chapter__foot, .route, [aria-hidden='true']")) return;
      if (el.querySelector(BLOCKS)) return; // leaves only, avoids duplicates
      const text = textOf(el);
      if (text.length < 2) return;
      const weight = /^H[2-4]$|DT|BUTTON/.test(el.tagName) ? 3 : 1;
      entries.push({ el, chapterTitle, text, norm: normalize(text), weight });
    });
  });
  return entries;
}

function parseTerms(query) {
  return normalizeQuery(query)
    .split(" ")
    .filter(Boolean)
    .map((full) => ({ full, stem: full.startsWith("ال") && full.length >= 5 ? full.slice(2) : full }));
}

/** True when the term begins a word (optionally after the article "ال") */
function startsWord(hay, term) {
  for (let at = hay.indexOf(term); at !== -1; at = hay.indexOf(term, at + 1)) {
    const before = hay.slice(Math.max(0, at - 3), at);
    if (at === 0 || before.endsWith(" ") || before === " ال" || (at === 2 && before === "ال")) return true;
  }
  return false;
}

export function find(index, query) {
  const terms = parseTerms(query);
  if (!terms.length) return [];
  const scored = [];
  for (const entry of index) {
    const hay = entry.norm.text;
    if (!terms.every((t) => hay.includes(t.stem))) continue;
    let score = entry.weight * 10;
    for (const t of terms) {
      const at = hay.indexOf(t.stem);
      score += 5 - Math.min(4, at / 40);
      if (hay.includes(t.full)) score += 3;
      if (startsWord(hay, t.stem)) score += 4;
    }
    scored.push({ entry, score, terms });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

/** Snippet around the first match as [{ text, mark }] parts */
export function snippet(entry, terms) {
  const { text } = entry;
  const { text: norm, map } = entry.norm;

  const ranges = [];
  for (const { stem } of terms) {
    for (let at = norm.indexOf(stem); at !== -1; at = norm.indexOf(stem, at + stem.length)) {
      const from = norm.slice(at - 2, at) === "ال" ? at - 2 : at;
      const end = extendOverMarks(text, map[at + stem.length - 1] + 1);
      ranges.push([map[from], end]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }

  const first = merged[0]?.[0] ?? 0;
  const from = Math.max(0, text.lastIndexOf(" ", Math.max(0, first - 50)));
  const to = Math.min(text.length, first + 140);

  const parts = [];
  if (from > 0) parts.push({ text: "… " });
  let cursor = from;
  for (const [s, e] of merged) {
    if (e <= from || s >= to) continue;
    parts.push({ text: text.slice(cursor, Math.max(s, from)) });
    parts.push({ text: text.slice(Math.max(s, from), Math.min(e, to)), mark: true });
    cursor = Math.min(e, to);
  }
  parts.push({ text: text.slice(cursor, to) + (to < text.length ? " …" : "") });
  return parts;
}

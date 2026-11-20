/* Small shared helpers: storage, Arabic numerals, motion, events */

const NS = "yaqeen:";

/** localStorage that never throws (private mode, disabled storage, bad JSON) */
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* Not persisted, but the session keeps working */
    }
  },
};

const arabicDigits = new Intl.NumberFormat("ar-u-nu-arab", { useGrouping: false });

/** Format a number with Arabic-Indic digits */
export const ar = (n) => arabicDigits.format(n);

export const motionLevel = () => document.documentElement.dataset.motion ?? "full";

export const scrollBehavior = () => (motionLevel() === "full" ? "smooth" : "auto");

export function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Smoothly bring a chapter (or any element) into view */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  history.replaceState(null, "", `#${id}`);
}

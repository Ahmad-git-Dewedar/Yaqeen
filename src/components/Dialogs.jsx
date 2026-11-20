/* The three panels: chapter index, search and settings */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHAPTERS, TOTAL, countDone } from "../data/chapters.js";
import { dialogProps, openDialog } from "../lib/dialogs.js";
import { reset as resetProgress, useProgress } from "../lib/progress.js";
import { resetPrefs, resolveMotion, resolveTheme, updatePrefs, usePrefs } from "../lib/prefs.js";
import { buildIndex, find, MAX_RESULTS, snippet } from "../lib/search.js";
import { ar } from "../lib/utils.js";
import { scrollToElement } from "../hooks/useSmoothScroll.js";
import { Icon } from "./ui.jsx";

const ease = [0.22, 0.7, 0.2, 1];

/** Re-key a dialog's contents each time it opens so entry animations replay */
function useOpenCount(id) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const el = document.getElementById(id);
    const onOpen = () => setCount((c) => c + 1);
    el?.addEventListener("dialog:open", onOpen);
    return () => el?.removeEventListener("dialog:open", onOpen);
  }, [id]);
  return count;
}

function SheetHead({ id, title }) {
  return (
    <div className="sheet__head">
      <h2 className="sheet__title" id={id}>{title}</h2>
      <button className="icon-btn" type="button" data-close-dialog="" aria-label="إغلاق">
        <Icon name="close" />
      </button>
    </div>
  );
}

/* ---------------- Chapter index ---------------- */

export function IndexSheet({ current }) {
  const { done } = useProgress();
  const opened = useOpenCount("index-dialog");
  const count = countDone(done);
  const summary =
    count === TOTAL
      ? "أتممت جميع المحطات، بارك الله فيك"
      : count === 0
        ? "لم تكمل أي محطة بعد، وتكتمل المحطة عند بلوغ نهايتها"
        : `أكملت ${ar(count)} من ${ar(TOTAL)} محطات`;

  return (
    <dialog className="sheet" id="index-dialog" aria-labelledby="index-dialog-title" {...dialogProps}>
      <SheetHead id="index-dialog-title" title="محطات الرحلة" />
      <div className="sheet__body">
        <div className="index-summary">
          <p className="index-summary__text">{summary}</p>
          <div className="meter" aria-hidden="true">
            <motion.span
              key={opened}
              className="meter__fill meter__fill--motion"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count / TOTAL }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
            />
          </div>
        </div>
        <motion.ol
          key={opened}
          className="toc"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } } }}
        >
          {CHAPTERS.map((c) => {
            const isDone = done.includes(c.id);
            return (
              <motion.li
                key={c.id}
                variants={{ hidden: { opacity: 0, x: -16 }, shown: { opacity: 1, x: 0, transition: { duration: 0.4, ease } } }}
              >
                <a
                  className={`toc__link${isDone ? " is-done" : ""}`}
                  href={`#${c.id}`}
                  aria-current={c.id === current ? "true" : undefined}
                  data-close-dialog=""
                >
                  <span className="toc__num" aria-hidden="true">{ar(c.n)}</span>
                  <span className="toc__title">{c.title}</span>
                  <span className="toc__state" aria-hidden="true"><Icon name="check" /></span>
                  {isDone && <span className="visually-hidden">(مكتملة)</span>}
                </a>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </dialog>
  );
}

/* ---------------- Search ---------------- */

const SUGGESTIONS = ["التوحيد", "القدر", "الملائكة", "السنة النبوية", "التوكل", "اليوم الآخر"];

function countLabel(n) {
  if (n === 1) return "نتيجة واحدة";
  if (n === 2) return "نتيجتان";
  const label = n <= 10 ? `${ar(n)} نتائج` : `${ar(n)} نتيجة`;
  return n === MAX_RESULTS ? `${label}، الأقرب أولا` : label;
}

/** Open whatever hides `el` (tab, disclosure, FAQ), then scroll and flash it */
function goTo(el) {
  document.dispatchEvent(new CustomEvent("yaqeen:reveal", { detail: el }));
  // Give panels a moment to open before measuring
  setTimeout(() => {
    scrollToElement(el, { center: true });
    el.classList.remove("is-found");
    void el.offsetWidth;
    el.classList.add("is-found");
    el.addEventListener("animationend", () => el.classList.remove("is-found"), { once: true });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }, 380);
}

export function SearchDialog() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const index = useRef(null);
  const input = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const dialog = document.getElementById("search-dialog");
    const onOpen = () => {
      index.current ??= buildIndex();
      input.current?.select();
    };
    dialog.addEventListener("dialog:open", onOpen);

    // Ctrl/Cmd+K anywhere, or "/" when not typing
    const onKey = (event) => {
      const typing = event.target.closest?.("input, textarea, [contenteditable='true']");
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        openDialog("search-dialog");
      } else if (event.key === "/" && !typing && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        openDialog("search-dialog");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("dialog:open", onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trimmed = query.trim();
  const results = trimmed && index.current ? find(index.current, trimmed) : [];

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (i) => {
    const hit = results[i];
    if (!hit) return;
    document.getElementById("search-dialog").close();
    goTo(hit.entry.el);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(active);
    }
  };

  return (
    <dialog className="search" id="search-dialog" aria-labelledby="search-dialog-title" {...dialogProps}>
      <h2 className="visually-hidden" id="search-dialog-title">البحث في محتوى الموقع</h2>
      <div className="search__field">
        <Icon name="search" />
        <input
          ref={input}
          className="search__input"
          id="search-input"
          type="search"
          placeholder="ابحث في المحتوى… مثل: التوكل، القدر، الملائكة"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-describedby="search-status"
          aria-activedescendant={results.length ? `result-${active}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="search__close" type="button" data-close-dialog="" aria-label="إغلاق البحث"><kbd lang="en">Esc</kbd></button>
      </div>

      <p className="search__status" id="search-status" aria-live="polite">
        {trimmed ? (results.length ? countLabel(results.length) : `لا نتائج لـ «${trimmed}»، جرب كلمة أخرى أو أقصر`) : ""}
      </p>

      <ul className="search__results" id="search-results" role="listbox" aria-label="نتائج البحث" ref={listRef}>
        <AnimatePresence initial={false}>
          {results.map(({ entry, terms }, i) => (
            <motion.li
              key={`${trimmed}-${i}`}
              className="result"
              role="option"
              id={`result-${i}`}
              aria-selected={i === active}
              onClick={() => choose(i)}
              onMouseMove={() => setActive(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03, duration: 0.3 } }}
            >
              <span className="result__where">{entry.chapterTitle}</span>
              <span className="result__snippet">
                {snippet(entry, terms).map((part, k) => (part.mark ? <mark key={k}>{part.text}</mark> : <span key={k}>{part.text}</span>))}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!trimmed && (
        <div className="search__hints">
          <p className="search__hints-title">جرب البحث عن</p>
          <div className="search__chips">
            {SUGGESTIONS.map((s) => (
              <motion.button
                key={s}
                type="button"
                className="chip"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuery(s);
                  input.current?.focus();
                }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ---------------- Settings ---------------- */

const THEME_HINT = { light: "فاتح", dark: "داكن" };
const MOTION_HINT = { full: "كاملة", reduced: "مخففة", none: "متوقفة" };

/** Radio group whose active choice is marked by a pill that glides between options */
function Segmented({ name, value, options, onChange }) {
  return (
    <div className="seg" role="radiogroup" style={{ "--n": options.length }}>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label key={String(o.value)} className={`seg__opt${checked ? " is-on" : ""}`}>
            <input type="radio" name={name} value={String(o.value)} checked={checked} onChange={() => onChange(o.value)} />
            {checked && <motion.span className="seg__pill" layoutId={`seg-${name}`} transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="seg__label" style={o.style}>
              {o.icon && <Icon name={o.icon} />}
              {o.label}
            </span>
            {o.note && <span className="seg__note">{o.note}</span>}
          </label>
        );
      })}
    </div>
  );
}

/** A destructive button that needs a second click within a few seconds */
function ConfirmButton({ children, onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <motion.button
      className={`btn btn--quiet${armed ? " is-armed" : ""}`}
      type="button"
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      animate={armed ? { scale: [1, 1.04, 1] } : { scale: 1 }}
    >
      {armed ? "اضغط مرة أخرى للتأكيد" : children}
    </motion.button>
  );
}

/* Each section slides in a moment after the one before it */
const group = {
  hidden: { opacity: 0, y: 14 },
  shown: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: 0.06 + i * 0.05 } }),
};

function Group({ i, title, hint, children }) {
  return (
    <motion.fieldset className="setting" custom={i} variants={group} initial="hidden" animate="shown">
      <legend className="setting__label">{title}</legend>
      {children}
      {hint && <p className="setting__hint">{hint}</p>}
    </motion.fieldset>
  );
}

const SIZES = [
  { value: 0.9, label: "صغير", note: "٩٠٪" },
  { value: 1, label: "عادي", note: "١٠٠٪" },
  { value: 1.12, label: "كبير", note: "١١٢٪" },
  { value: 1.25, label: "أكبر", note: "١٢٥٪" },
];

export function SettingsSheet() {
  const s = usePrefs();
  const [status, setStatus] = useState("");
  const opened = useOpenCount("settings-dialog");
  useEffect(() => setStatus(""), [opened]);

  return (
    <dialog className="sheet sheet--settings" id="settings-dialog" aria-labelledby="settings-dialog-title" {...dialogProps}>
      <SheetHead id="settings-dialog-title" title="الإعدادات" />
      {/* Re-keyed on every opening so the sections cascade in again */}
      <form key={opened} className="sheet__body settings" onSubmit={(e) => e.preventDefault()}>
        <motion.div className="preview" aria-hidden="true" variants={group} custom={0} initial="hidden" animate="shown">
          <p className="preview__kicker">معاينة</p>
          <p className="preview__title">أركان الإيمان الستة</p>
          <p className="preview__text">الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره</p>
        </motion.div>

        <Group i={1} title="المظهر" hint={s.theme === "system" ? `يتبع إعداد جهازك، حاليا ${THEME_HINT[resolveTheme("system")]}` : null}>
          <Segmented
            name="theme"
            value={s.theme}
            onChange={(theme) => updatePrefs({ theme })}
            options={[
              { value: "light", label: "فاتح", icon: "sun" },
              { value: "dark", label: "داكن", icon: "moon" },
              { value: "system", label: "تلقائي", icon: "monitor" },
            ]}
          />
        </Group>

        <Group i={2} title="حجم النص">
          <Segmented
            name="scale"
            value={s.scale}
            onChange={(scale) => updatePrefs({ scale })}
            options={SIZES.map((z) => ({ ...z, style: { fontSize: `${0.82 * z.value}rem` } }))}
          />
        </Group>

        <Group i={3} title="سماكة الخط" hint="الرفيع هوية الموقع، والأثقل أريح لبعض الشاشات">
          <Segmented
            name="weight"
            value={s.weight}
            onChange={(weight) => updatePrefs({ weight })}
            options={[
              { value: 200, label: "رفيع", style: { fontWeight: 200 } },
              { value: 300, label: "خفيف", style: { fontWeight: 300 } },
              { value: 400, label: "واضح", style: { fontWeight: 400 } },
            ]}
          />
        </Group>

        <Group i={4} title="تباعد الأسطر">
          <Segmented
            name="leading"
            value={s.leading}
            onChange={(leading) => updatePrefs({ leading })}
            options={[
              { value: "comfortable", label: "مريح" },
              { value: "airy", label: "واسع" },
            ]}
          />
        </Group>

        <Group i={5} title="الحركة" hint={s.motion === "system" ? `يتبع إعداد جهازك، حاليا ${MOTION_HINT[resolveMotion("system")]}` : null}>
          <Segmented
            name="motion"
            value={s.motion}
            onChange={(motion) => updatePrefs({ motion })}
            options={[
              { value: "system", label: "تلقائي" },
              { value: "full", label: "كاملة" },
              { value: "reduced", label: "مخففة" },
              { value: "none", label: "بلا حركة" },
            ]}
          />
        </Group>

        <motion.div className="setting setting--row" variants={group} custom={6} initial="hidden" animate="shown">
          <div>
            <label className="setting__label" htmlFor="imagery-toggle">اللوحات الفنية</label>
            <p className="setting__hint">أخف الصور لقراءة أهدأ وبيانات أقل</p>
          </div>
          <input
            className="switch"
            type="checkbox"
            role="switch"
            id="imagery-toggle"
            checked={s.imagery}
            onChange={(e) => updatePrefs({ imagery: e.target.checked })}
          />
        </motion.div>

        <motion.div className="setting setting--danger" variants={group} custom={7} initial="hidden" animate="shown">
          <p className="setting__label">البيانات المحفوظة</p>
          <p className="setting__hint">تحفظ الإعدادات والتقدم على هذا الجهاز فقط</p>
          <div className="setting__actions">
            <ConfirmButton onConfirm={() => { resetProgress(); setStatus("تم مسح التقدم"); }}>مسح التقدم</ConfirmButton>
            <ConfirmButton onConfirm={() => { resetPrefs(); setStatus("عادت الإعدادات إلى الوضع الافتراضي"); }}>استعادة الافتراضي</ConfirmButton>
          </div>
          <AnimatePresence>
            {status && (
              <motion.p className="setting__hint setting__status" aria-live="polite" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {status}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </dialog>
  );
}

/* Shared building blocks: icons, ornament, evidence, animated words,
   chapter header and footer */
import { Fragment } from "react";
import { motion } from "framer-motion";
import { BY_ID, CHAPTERS } from "../data/chapters.js";
import { ar } from "../lib/utils.js";

export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.6-4.6" /></symbol>
      <symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></symbol>
      <symbol id="i-index" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r=".9" /><circle cx="4.5" cy="12" r=".9" /><circle cx="4.5" cy="18" r=".9" /></symbol>
      <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></symbol>
      <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17" /></symbol>
      <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></symbol>
      <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></symbol>
      <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></symbol>
      <symbol id="i-star" viewBox="0 0 24 24"><path pathLength="1" d="M12 2.5 21.5 12 12 21.5 2.5 12Z M5.3 5.3H18.7V18.7H5.3Z" /></symbol>
    </svg>
  );
}

export const Icon = ({ name, className = "" }) => (
  <svg className={`icon ${className}`} aria-hidden="true">
    <use href={`#i-${name}`} />
  </svg>
);

export const Ornament = () => (
  <svg className="ornament" aria-hidden="true">
    <use href="#i-star" />
  </svg>
);

/** Quran verse or hadith with its reference */
export function Evidence({ label, cite, compact, hadith, wide, reveal, children }) {
  const cls = ["evidence", compact && "evidence--compact", hadith && "evidence--hadith", wide && "evidence--wide"]
    .filter(Boolean)
    .join(" ");
  return (
    <figure className={cls} data-reveal={reveal ? "" : undefined}>
      {label && <p className="evidence__label">{label}</p>}
      <blockquote className="evidence__text">{children}</blockquote>
      <figcaption className="evidence__ref">{cite}</figcaption>
    </figure>
  );
}

/** Verse-number marker inside a quotation */
export const Ayah = ({ n }) => <span className="ayah">{ar(n)}</span>;

const maskEase = [0.16, 1, 0.3, 1];
const wordRise = {
  hidden: { y: "112%" },
  shown: { y: "0%", transition: { duration: 0.85, ease: maskEase } },
};

/**
 * Text whose words rise out of a mask when it scrolls into view (or when
 * `play` turns true). Words split on spaces only, so Arabic stays joined
 */
export function Words({ as = "p", text, className, id, delay = 0, play }) {
  const Tag = motion[as];
  const trigger = play === undefined
    ? { whileInView: "shown", viewport: { once: true, margin: "0px 0px -8% 0px" } }
    : { animate: play ? "shown" : "hidden" };
  return (
    <Tag
      className={className}
      id={id}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
    >
      <span className="visually-hidden">{text}</span>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="wmask" aria-hidden="true">
            <motion.span className="word" variants={wordRise}>{word}</motion.span>
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Two-digit Arabic index, e.g. ٠٣ */
export const index2 = (n) => ar(n).padStart(2, "٠");

export function ChapterHead({ id, onArt, sub }) {
  const c = BY_ID.get(id);
  return (
    <header className={`chapter__head${onArt ? " chapter__head--on-art" : ""}`} data-reveal="">
      <p className="head__meta">
        <span className="head__idx" aria-hidden="true">{index2(c.n)}</span>
        <Ornament />
        <span className="head__kicker">{c.kicker}</span>
      </p>
      <Words as="h2" className="chapter__title" id={`${id}-title`} text={c.title} delay={0.1} />
      {sub && <p className="chapter__sub">{sub}</p>}
    </header>
  );
}

/** Reaching this marker completes the chapter */
export const ChapterEnd = () => <span className="chapter__end" data-chapter-end="" aria-hidden="true" />;

export function ChapterFoot({ id }) {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  return (
    <nav className="chapter__foot" aria-label="التنقل بين المحطات">
      {prev && (
        <a className="step-link step-link--prev" href={`#${prev.id}`}>
          <span className="step-link__dir">السابقة</span>
          <span className="step-link__title">{prev.title}</span>
        </a>
      )}
      {next ? (
        <a className="step-link step-link--next" href={`#${next.id}`}>
          <span className="step-link__dir">التالية</span>
          <span className="step-link__title">{next.title}</span>
        </a>
      ) : (
        <a className="step-link step-link--next" href="#top">
          <span className="step-link__dir">العودة</span>
          <span className="step-link__title">إلى بداية الرحلة</span>
        </a>
      )}
    </nav>
  );
}

/** A chapter section with the attributes navigation and progress rely on */
export function Chapter({ id, className = "", children }) {
  const c = BY_ID.get(id);
  return (
    <section
      className={`chapter chapter--${id} ${className}`}
      id={id}
      data-chapter=""
      data-short={c.short}
      data-complete={c.manual ? "manual" : undefined}
      aria-labelledby={`${id}-title`}
    >
      {children}
    </section>
  );
}

/**
 * A painting revealed by a gold wipe as it enters (see styles/theme.css).
 * `wipe` follows the frame's shape: "down" / "up" for tall frames, "rtl" /
 * "ltr" for wide bands, "center" for a centred composition
 */
export const Art = ({ src, className = "", position, wipe = "rtl" }) => (
  <>
    <img
      className={`art ${className}`}
      src={`/assets/img/${src}`}
      alt=""
      width="2000"
      height="1116"
      loading="lazy"
      decoding="async"
      style={position ? { objectPosition: position } : undefined}
    />
    <span className="art-wipe" data-wipe={wipe} aria-hidden="true" />
  </>
);

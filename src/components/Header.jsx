import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { BY_ID, TOTAL, countDone } from "../data/chapters.js";
import { openDialog } from "../lib/dialogs.js";
import { useProgress } from "../lib/progress.js";
import { ar } from "../lib/utils.js";
import { Icon } from "./ui.jsx";

export default function Header({ current, overArt }) {
  const { done } = useProgress();
  const count = countDone(done);
  const chapter = BY_ID.get(current);

  // Reading position along the whole page, eased with a spring
  const { scrollYProgress } = useScroll();
  const reading = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  // Slides away while reading down, returns as soon as the reader scrolls up
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    if (Math.abs(delta) < 6) return;
    lastY.current = y;
    if (y < 120 || document.querySelector("dialog[open]")) setHidden(false);
    else setHidden(delta > 0);
  });

  return (
    <motion.header
      className="site-header"
      data-over-art={overArt ? "" : undefined}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onFocusCapture={() => setHidden(false)}
    >
      <a className="brand" href="#top" aria-label="يقين، العودة إلى البداية">
        <span className="brand__ar">يقين</span>
        <span className="brand__en" lang="en">YAQEEN</span>
      </a>

      <p className="site-header__current" aria-live="off">
        <AnimatePresence mode="wait" initial={false}>
          {chapter && !overArt && (
            <motion.span
              key={chapter.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {ar(chapter.n)} · {chapter.title}
            </motion.span>
          )}
        </AnimatePresence>
      </p>

      <div className="site-header__actions">
        <button className="icon-btn" type="button" onClick={() => openDialog("search-dialog")} aria-haspopup="dialog" aria-keyshortcuts="Control+K /">
          <Icon name="search" />
          <span className="icon-btn__label">بحث</span>
        </button>
        <button className="icon-btn" type="button" onClick={() => openDialog("settings-dialog")} aria-haspopup="dialog">
          <Icon name="sliders" />
          <span className="icon-btn__label">الإعدادات</span>
        </button>
        <button className="icon-btn icon-btn--index" type="button" onClick={() => openDialog("index-dialog")} aria-haspopup="dialog">
          <Icon name="index" />
          <span className="icon-btn__label">المحطات</span>
          <motion.span
            key={count}
            className="progress-pill"
            aria-hidden="true"
            initial={{ scale: count ? 1.35 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            {ar(count)}/{ar(TOTAL)}
          </motion.span>
          <span className="visually-hidden">، أكملت {ar(count)} من {ar(TOTAL)}</span>
        </button>
      </div>

      <div className="read-progress" aria-hidden="true">
        <motion.span className="read-progress__fill" style={{ scaleX: reading }} />
      </div>
    </motion.header>
  );
}

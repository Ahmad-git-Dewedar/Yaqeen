/*
 * Opening sequence, played once per visit: a star is inked, the name rises,
 * the ten stations count up, then the paper lifts away to reveal the hero.
 * Any click or key skips it; with motion off it never shows
 */
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { pauseScroll, resumeScroll } from "../hooks/useSmoothScroll.js";
import { ar } from "../lib/utils.js";

const KEY = "yaqeen:intro-seen";
const ease = [0.16, 1, 0.3, 1];

function alreadySeen() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* Plays again next time; harmless */
  }
}

export default function Loader({ level, onDone }) {
  const [show, setShow] = useState(() => level !== "none" && !alreadySeen());
  const count = useMotionValue(1);
  const [n, setN] = useState(1);

  useEffect(() => {
    if (!show) {
      onDone();
      return undefined;
    }
    markSeen();
    document.body.classList.add("is-locked");
    pauseScroll();

    const quick = level === "reduced";
    const counting = animate(count, 10, { duration: quick ? 0.4 : 1.15, ease: [0.5, 0, 0.2, 1], delay: quick ? 0 : 0.35 });
    const unsub = count.on("change", (v) => setN(Math.round(v)));
    // The hero starts animating as the paper begins to lift
    const close = () => {
      setShow(false);
      onDone();
    };
    const timer = setTimeout(close, quick ? 650 : 1850);
    const skip = close;
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      counting.stop();
      unsub();
      clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
    // Runs once; `show` only flips to false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const finish = () => {
    document.body.classList.remove("is-locked");
    resumeScroll();
  };

  return (
    <AnimatePresence onExitComplete={finish}>
      {show && (
        <motion.div
          className="loader"
          aria-hidden="true"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          <svg className="loader__star" viewBox="0 0 24 24">
            <motion.path
              d="M12 2.5 21.5 12 12 21.5 2.5 12Z M5.3 5.3H18.7V18.7H5.3Z"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: 0 }}
              transition={{ duration: 1.1, ease }}
            />
          </svg>

          <span className="loader__mask">
            <motion.span
              className="loader__name"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease, delay: 0.25 }}
            >
              يقين
            </motion.span>
          </span>

          <motion.p
            className="loader__cap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.55 }}
          >
            تبدأ الرحلة
          </motion.p>

          <div className="loader__foot">
            <span className="loader__count">{ar(n).padStart(2, "٠")}</span>
            <span className="loader__bar">
              <motion.span initial={{ scaleX: 0.1 }} animate={{ scaleX: n / 10 }} transition={{ duration: 0.2 }} />
            </span>
            <span className="loader__count">{ar(10)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

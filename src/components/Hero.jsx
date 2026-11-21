/*
 * Opening hero: a dark painted stage with a soft spotlight that follows the
 * pointer. The page stays locked here until "ابدأ الرحلة"; pressing it
 * unlocks scrolling and glides down to the first chapter
 */
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BY_ID } from "../data/chapters.js";
import { useProgress } from "../lib/progress.js";
import { scrollToElement, useGated } from "../hooks/useSmoothScroll.js";
import { Words } from "./ui.jsx";

const ease = [0.16, 1, 0.3, 1];
const rise = (delay) => ({
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay } },
});

export default function Hero({ ready, level }) {
  const ref = useRef(null);
  const { last } = useProgress();
  const resume = BY_ID.get(last);
  const gated = useGated();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const state = ready ? "shown" : "hidden";

  // The spotlight follows the pointer through two CSS variables
  const onPointerMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const begin = (event, target) => {
    event.preventDefault();
    const el = document.getElementById(target);
    // scrollToElement opens the gate first, then glides down
    if (el) scrollToElement(el, { instant: level === "none", slow: true });
  };

  // Trying to scroll while locked gives the start button a gentle nudge
  const startRef = useRef(null);
  useEffect(() => {
    if (!gated) return undefined;
    let last = 0;
    const nudge = () => {
      const now = Date.now();
      if (now - last < 900 || !startRef.current) return;
      last = now;
      startRef.current.classList.remove("is-nudged");
      void startRef.current.offsetWidth;
      startRef.current.classList.add("is-nudged");
    };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", " ", "End"].includes(e.key) && !e.target.closest?.("input, dialog")) nudge();
    };
    window.addEventListener("wheel", nudge, { passive: true });
    window.addEventListener("touchmove", nudge, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", nudge);
      window.removeEventListener("touchmove", nudge);
      window.removeEventListener("keydown", onKey);
    };
  }, [gated]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={ref} onPointerMove={onPointerMove}>
      <div className="hero__zoom">
        <motion.img
          className="hero__art art"
          src="/assets/img/path.webp"
          alt=""
          width="2000"
          height="1116"
          fetchpriority="high"
          decoding="async"
          style={{ scale: artScale }}
          initial={{ opacity: 0, filter: "brightness(0.4)" }}
          animate={ready ? { opacity: 1, filter: "brightness(1)" } : undefined}
          transition={{ duration: 1.2, ease }}
        />
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <motion.div className="hero__inner" style={{ y: copyY, opacity: fade }} initial="hidden" animate={state}>
        <motion.div variants={rise(0.1)}>
          <Words as="h1" className="hero__title" id="hero-title" text="يقين" play={ready} delay={0.1} />
        </motion.div>
        <motion.div variants={rise(0.2)}>
          <Words className="hero__slogan" text="تعلم العقيدة الإسلامية في رحلة ممتعة" play={ready} delay={0.3} />
        </motion.div>
        <motion.div className="hero__actions" variants={rise(0.45)}>
          <motion.a
            ref={startRef}
            className="btn btn--start"
            href="#intro"
            onClick={(e) => begin(e, "intro")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            ابدأ الرحلة
          </motion.a>
          {resume && resume.n > 1 && (
            <a className="btn btn--outline-light" href={`#${resume.id}`} onClick={(e) => begin(e, resume.id)}>
              تابع: {resume.title}
            </a>
          )}
        </motion.div>
      </motion.div>

    </section>
  );
}

/* Marquee band, counting stats and the back-to-top button */
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { scrollToElement } from "../hooks/useSmoothScroll.js";
import { ar, motionLevel } from "../lib/utils.js";

const BAND = ["تعلم دينك", "وازدد يقينك", "أركان الإيمان", "التوحيد", "القرآن والسنة", "الطمأنينة", "التوكل", "حسن الخلق"];

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * A band of key words drifting slowly; scrolling speeds it up and scrolling
 * back reverses it. Doubled so the loop is seamless
 */
export function Marquee() {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (motionLevel() !== "full") return;
    const b = boost.get();
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    const step = direction.current * -1.6 * (delta / 1000);
    base.set(base.get() + step + step * Math.abs(b));
  });

  const row = BAND.map((w) => <span key={w}>{w}</span>);
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee__track" style={{ x }}>
        <div className="marquee__row">{row}</div>
        <div className="marquee__row">{row}</div>
      </motion.div>
    </div>
  );
}

/** Back to the top, with a ring that fills as the page is read */
export function ToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShown(y > window.innerHeight * 1.2));

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          className="to-top"
          type="button"
          aria-label="العودة إلى البداية"
          onClick={() => scrollToElement(document.getElementById("top"))}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle className="to-top__track" cx="20" cy="20" r="17" />
            <motion.circle className="to-top__ring" cx="20" cy="20" r="17" style={{ pathLength: ring }} />
            <path className="to-top__arrow" d="M20 26V14m-5 5 5-5 5 5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** A number that counts up once it scrolls into view */
export function Counter({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, to, { duration: 1, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span className="stat__v" ref={ref}>
      <span aria-hidden="true">{ar(value)}</span>
      <span className="visually-hidden">{ar(to)}</span>
    </span>
  );
}

const STATS = [
  { n: 6, label: "أركان الإيمان", href: "#pillars" },
  { n: 3, label: "أقسام التوحيد", href: "#tawhid" },
  { n: 2, label: "المصدران الأساسيان", href: "#sources" },
  { n: 5, label: "آثار في حياة المسلم", href: "#impact" },
];

export function Stats() {
  return (
    <ul className="stats" data-reveal="" data-stagger="">
      {STATS.map((s) => (
        <li key={s.label}>
          <a className="stat" href={s.href}>
            <Counter to={s.n} />
            <span className="stat__l">{s.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

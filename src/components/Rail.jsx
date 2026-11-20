import { motion } from "framer-motion";
import { CHAPTERS } from "../data/chapters.js";
import { useProgress } from "../lib/progress.js";
import { ar } from "../lib/utils.js";

/** Chapter rail on wide screens, with a ring that glides to the current chapter */
export default function Rail({ current, overArt }) {
  const { done } = useProgress();
  return (
    <nav className="rail" aria-label="المحطات" data-over-art={overArt ? "" : undefined}>
      <ol className="rail__list">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <a
              className={`rail__link${done.includes(c.id) ? " is-done" : ""}`}
              href={`#${c.id}`}
              aria-current={c.id === current ? "true" : undefined}
            >
              {c.id === current && (
                <motion.span className="rail__ring" layoutId="rail-ring" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span aria-hidden="true">{ar(c.n)}</span>
              <span className="rail__label">{c.short}</span>
              <span className="visually-hidden">{c.title}{done.includes(c.id) ? " (مكتملة)" : ""}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

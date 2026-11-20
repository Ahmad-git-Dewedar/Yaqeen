/*
 * Page-level behaviour that watches the rendered chapters:
 *   useScrollSpy     which chapter is in the middle of the screen
 *   useChapterEnds   reaching a chapter's end marks it complete
 *   useOverArt       whether the header / rail sit over a dark painting
 *   useScrollReveal  reveal-on-scroll, painting reveals and parallax
 */
import { useEffect, useState } from "react";
import { CHAPTERS } from "../data/chapters.js";
import { isDone, markDone, setLast, useProgress } from "../lib/progress.js";
import { motionLevel } from "../lib/utils.js";

export function useScrollSpy() {
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    const visible = new Set();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        const top = [...visible].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
        setCurrent(top?.id ?? null);
        if (top) setLast(top.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-chapter]").forEach((el) => spy.observe(el));
    return () => spy.disconnect();
  }, []);
  return current;
}

export function useChapterEnds() {
  const { done } = useProgress();
  const empty = done.length === 0;

  useEffect(() => {
    let ends = null;
    const arm = () => {
      ends = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          ends.unobserve(e.target);
          markDone(e.target.closest("[data-chapter]").id);
        });
      });
      CHAPTERS.filter((c) => !c.manual && !isDone(c.id)).forEach((c) => {
        const end = document.getElementById(c.id)?.querySelector("[data-chapter-end]");
        if (end) ends.observe(end);
      });
    };
    // After a reset, start counting from the learner's next scroll so the
    // chapter on screen is not completed again instantly
    if (empty) window.addEventListener("scroll", arm, { once: true, passive: true });
    else arm();
    return () => {
      window.removeEventListener("scroll", arm);
      ends?.disconnect();
    };
  }, [empty]);
}

export function useOverArt() {
  const [state, setState] = useState({ header: true, rail: true });
  useEffect(() => {
    let queued = false;
    const covers = (y) =>
      [...document.querySelectorAll(".hero, .banner, .immersive, .quiz-stage, .closing")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.top <= y && r.bottom >= y;
      });
    const update = () => {
      queued = false;
      const header = covers(32);
      const rail = covers(window.innerHeight / 2);
      setState((s) => (s.header === header && s.rail === rail ? s : { header, rail }));
    };
    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("yaqeen:settings", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("yaqeen:settings", schedule);
    };
  }, []);
  return state;
}

/**
 * Mark each element with the data attribute `attr` once it scrolls into view;
 * `watch` picks the box to observe. A data attribute (not a class) survives
 * React re-rendering the element's className
 */
function revealOnEnter(elements, attr, options, watch = (el) => el) {
  if (motionLevel() === "none" || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.setAttribute(attr, ""));
    return null;
  }
  const targets = new Map(elements.map((el) => [watch(el), el]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = targets.get(entry.target);
      observer.unobserve(entry.target);
      // A lazy painting reveals once loaded, so it never unrolls empty
      if (el.tagName === "IMG" && !el.complete) {
        const show = () => el.setAttribute(attr, "");
        el.addEventListener("load", show, { once: true });
        el.addEventListener("error", show, { once: true });
        setTimeout(show, 3000);
      } else {
        el.setAttribute(attr, "");
      }
    }
  }, options);
  targets.forEach((_, target) => observer.observe(target));
  return observer;
}

export function useScrollReveal() {
  useEffect(() => {
    const all = (sel) => [...document.querySelectorAll(sel)];

    // Consecutive revealed siblings and list items get an index for a cascade
    all("[data-reveal]").forEach((el) => {
      let i = 0;
      let prev = el.previousElementSibling;
      while (prev?.hasAttribute("data-reveal") && i < 5) {
        i += 1;
        prev = prev.previousElementSibling;
      }
      el.style.setProperty("--i", i);
    });
    all("[data-stagger]").forEach((list) =>
      [...list.children].forEach((child, i) => child.style.setProperty("--i", Math.min(i, 10)))
    );

    const observers = [
      revealOnEnter(all("[data-reveal]"), "data-visible", { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }),
      revealOnEnter(all(".art:not(.hero__art)"), "data-shown", { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }, (el) => el.parentElement),
    ];

    // Full-bleed paintings drift a little slower than the page
    const bands = all("[data-parallax]");
    let queued = false;
    const update = () => {
      queued = false;
      const on = motionLevel() === "full";
      const vh = window.innerHeight;
      for (const band of bands) {
        if (!on) {
          band.style.removeProperty("--py");
          continue;
        }
        const r = band.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        band.style.setProperty("--py", `${(t * 4).toFixed(2)}%`);
      }
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    // Switching motion to "none" shows anything still waiting
    const onSettings = () => {
      queue();
      if (motionLevel() !== "none") return;
      all("[data-reveal]").forEach((el) => el.setAttribute("data-visible", ""));
      all(".art").forEach((el) => el.setAttribute("data-shown", ""));
    };

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("yaqeen:settings", onSettings);
    update();
    return () => {
      observers.forEach((o) => o?.disconnect());
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("yaqeen:settings", onSettings);
    };
  }, []);
}

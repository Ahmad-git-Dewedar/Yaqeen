/*
 * Scrolling: Lenis smooth scrolling at the "full" motion level, plus the
 * opening gate. On a fresh visit the page stays locked on the hero until the
 * visitor presses "ابدأ الرحلة"; dialogs and the intro pause scrolling too
 */
import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis = null;
let paused = false;

/* ---------------- Gate ---------------- */

// Locked on every visit that opens without a target chapter
let gated = !location.hash;
const gateListeners = new Set();

function applyGate() {
  document.documentElement.classList.toggle("is-gated", gated);
  if (gated) lenis?.stop();
  else if (!paused) lenis?.start();
}

if (gated) {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}
applyGate();

// Keyboard users who tab past the hero are let through
document.addEventListener("focusin", (e) => {
  if (gated && !e.target.closest?.(".hero, .site-header, dialog, .skip-link")) openGate();
});

export const isGated = () => gated;

/** Unlock scrolling for this visit (after the opening animation, or a jump) */
export function openGate() {
  if (!gated) return;
  gated = false;
  applyGate();
  gateListeners.forEach((fn) => fn());
}

export const useGated = () =>
  useSyncExternalStore(
    (fn) => {
      gateListeners.add(fn);
      return () => gateListeners.delete(fn);
    },
    isGated
  );

/* ---------------- Pausing ---------------- */

export function pauseScroll() {
  paused = true;
  lenis?.stop();
}

export function resumeScroll() {
  paused = false;
  if (!gated) lenis?.start();
}

/** Scroll to an element, smoothly when Lenis is running */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function scrollToElement(el, { center = false, instant = false, slow = false } = {}) {
  openGate();
  if (lenis) {
    lenis.resize(); // sizes measured while the gate was closed are stale
    // An explicit position: Lenis would otherwise stack the CSS scroll
    // margin and padding on top of each other
    const top = el.getBoundingClientRect().top + window.scrollY;
    const header = document.querySelector(".site-header")?.offsetHeight ?? 0;
    const y = Math.max(0, center ? top - (window.innerHeight - el.offsetHeight) / 2 : top - header);
    // Longer trips take a little longer, within a comfortable range
    const distance = Math.abs(y - window.scrollY);
    const duration = slow ? 1.5 : Math.min(1.4, Math.max(0.7, distance / 2500));
    lenis.scrollTo(y, { duration, easing: easeInOut, immediate: instant, force: true });
  } else {
    el.scrollIntoView({ block: center ? "center" : "start" });
  }
}

/** In-page links glide to their target and land just under the header */
function onAnchorClick(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const link = event.target.closest?.('a[href^="#"]');
  if (!link || link.closest("dialog")) return;
  const id = link.getAttribute("href").slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  event.preventDefault();
  scrollToElement(target);
  history.replaceState(null, "", `#${id}`);
}

export function useSmoothScroll(level) {
  useEffect(() => {
    if (level !== "full") return undefined;
    lenis = new Lenis({
      autoRaf: true,
      // Follows the wheel closely with a short glide, so it stays responsive
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      // Dialogs and other inner scrollers keep their own native scrolling
      prevent: (node) => node.closest?.("dialog") != null,
    });
    if (gated || paused) lenis.stop();
    document.addEventListener("click", onAnchorClick);
    return () => {
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
      lenis = null;
    };
  }, [level]);
}

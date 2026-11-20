/*
 * Native <dialog> helpers shared by the index, search and settings panels.
 * Esc and focus return come from <dialog> itself
 */
import { pauseScroll, resumeScroll, scrollToElement } from "../hooks/useSmoothScroll.js";

export function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog || dialog.open) return;
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  dialog.showModal();
  document.body.classList.add("is-locked");
  pauseScroll();
  dialog.dispatchEvent(new CustomEvent("dialog:open"));
}

export function closeDialog(id) {
  document.getElementById(id)?.close();
}

/** Props for a <dialog>: backdrop click closes, and the page unlocks on close */
export const dialogProps = {
  onClick(event) {
    const dialog = event.currentTarget;
    const link = event.target.closest('a[href^="#"]');
    if (link) {
      // Close first, then glide to the chapter once scrolling is unlocked
      event.preventDefault();
      dialog.close();
      resumeScroll();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) requestAnimationFrame(() => scrollToElement(target));
      return;
    }
    if (event.target === dialog || event.target.closest("[data-close-dialog]")) dialog.close();
  },
  onClose() {
    if (document.querySelector("dialog[open]")) return;
    document.body.classList.remove("is-locked");
    resumeScroll();
  },
};

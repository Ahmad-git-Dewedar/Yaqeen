/*
 * Preferences: defaults, validation and applying live in public/boot.js
 * (window.YaqeenPrefs) so the first paint is already right. This module lets
 * React read and change them
 */
import { useSyncExternalStore } from "react";

const prefs = window.YaqeenPrefs;

function subscribe(fn) {
  document.addEventListener("yaqeen:settings", fn);
  return () => document.removeEventListener("yaqeen:settings", fn);
}

export const usePrefs = () => useSyncExternalStore(subscribe, prefs.current);

export function updatePrefs(patch) {
  const next = prefs.save({ ...prefs.current(), ...patch });
  prefs.apply(next);
  document.dispatchEvent(new CustomEvent("yaqeen:settings", { detail: next }));
}

export const resetPrefs = () => updatePrefs(prefs.DEFAULTS);

/** The effective motion level after resolving "system" */
export const useMotionLevel = () => prefs.resolveMotion(usePrefs().motion);

export const resolveTheme = prefs.resolveTheme;
export const resolveMotion = prefs.resolveMotion;

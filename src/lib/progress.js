/*
 * Learning progress: finished chapters, where the learner left off, and quiz
 * results. Saved on this device. Components read it through useProgress()
 */
import { useSyncExternalStore } from "react";
import { store, emit } from "./utils.js";

const KEY = "progress";
const EMPTY = { done: [], last: null, quiz: null };

function load() {
  const saved = store.get(KEY, EMPTY);
  return {
    done: Array.isArray(saved?.done) ? saved.done.filter((id) => typeof id === "string") : [],
    last: typeof saved?.last === "string" ? saved.last : null,
    quiz: saved?.quiz && typeof saved.quiz.best === "number" ? saved.quiz : null,
  };
}

let state = load();
const listeners = new Set();

function commit(next, { quiet = false } = {}) {
  state = next;
  store.set(KEY, state);
  if (quiet) return;
  listeners.forEach((fn) => fn());
  emit("yaqeen:progress", state);
}

export const snapshot = () => state;
export const isDone = (id) => state.done.includes(id);

export function markDone(id) {
  if (!isDone(id)) commit({ ...state, done: [...state.done, id] });
}

/** Remember the current chapter without re-rendering anything */
export function setLast(id) {
  if (state.last !== id) commit({ ...state, last: id }, { quiet: true });
}

/** Record a finished quiz attempt and keep the best score */
export function recordQuiz({ score, total }) {
  const best = Math.max(score, state.quiz?.best ?? 0);
  commit({
    ...state,
    done: state.done.includes("quiz") ? state.done : [...state.done, "quiz"],
    quiz: { best, last: score, total, attempts: (state.quiz?.attempts ?? 0) + 1, at: new Date().toISOString() },
  });
}

export function reset() {
  commit({ ...EMPTY, done: [] });
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useProgress = () => useSyncExternalStore(subscribe, snapshot);

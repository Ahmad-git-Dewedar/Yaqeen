/*
 * Yaqeen — preference boot (classic script, runs before first paint).
 *
 * Reads saved settings and applies them to <html> so there is no flash of
 * the wrong theme or text size. It also exposes a tiny API on
 * window.YaqeenPrefs that js/settings.js builds on, so the defaults and
 * apply logic live in exactly one place.
 */
(function () {
  "use strict";

  var KEY = "yaqeen:settings";
  var root = document.documentElement;

  var OPTIONS = {
    theme: ["light", "dark", "system"],
    motion: ["system", "full", "reduced", "none"],
    scale: [0.9, 1, 1.12, 1.25],
    weight: [200, 300, 400],
    leading: ["comfortable", "airy"],
    imagery: [true, false]
  };

  var DEFAULTS = {
    theme: "light",
    motion: "system",
    scale: 1,
    weight: 200,
    leading: "comfortable",
    imagery: true
  };

  var LEADING = { comfortable: 1.95, airy: 2.25 };
  var THEME_COLOR = { light: "#efece6", dark: "#0e0e10" };

  var mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function sanitize(raw) {
    var clean = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      var value = raw && Object.prototype.hasOwnProperty.call(raw, key) ? raw[key] : undefined;
      clean[key] = OPTIONS[key].indexOf(value) !== -1 ? value : DEFAULTS[key];
    });
    return clean;
  }

  function read() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(KEY)));
    } catch (e) {
      return sanitize(null);
    }
  }

  function save(settings) {
    var clean = sanitize(settings);
    try {
      localStorage.setItem(KEY, JSON.stringify(clean));
    } catch (e) {
      /* Storage may be unavailable (private mode); settings still apply for this visit. */
    }
    return clean;
  }

  function resolveTheme(theme) {
    return theme === "system" ? (mqDark.matches ? "dark" : "light") : theme;
  }

  function resolveMotion(motion) {
    return motion === "system" ? (mqReduce.matches ? "reduced" : "full") : motion;
  }

  var current = read();

  function apply(settings) {
    current = sanitize(settings);
    var theme = resolveTheme(current.theme);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-motion", resolveMotion(current.motion));
    root.setAttribute("data-imagery", current.imagery ? "on" : "off");
    root.style.setProperty("--font-scale", String(current.scale));
    root.style.setProperty("--fw", String(current.weight));
    root.style.setProperty("--leading", String(LEADING[current.leading]));

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
    return current;
  }

  /* Follow the OS live while the user is on "system". */
  function onSystemChange() {
    apply(current);
    document.dispatchEvent(new CustomEvent("yaqeen:settings", { detail: current }));
  }
  mqDark.addEventListener("change", onSystemChange);
  mqReduce.addEventListener("change", onSystemChange);

  root.classList.add("js");
  apply(current);

  window.YaqeenPrefs = {
    DEFAULTS: DEFAULTS,
    OPTIONS: OPTIONS,
    read: read,
    save: save,
    apply: apply,
    current: function () { return current; },
    resolveTheme: resolveTheme,
    resolveMotion: resolveMotion
  };
})();

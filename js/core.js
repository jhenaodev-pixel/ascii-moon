/* ============================================================
   core.js · utilidades compartidas
   ============================================================ */

(function () {
  "use strict";

  const CL = (window.CL = window.CL || {});
  const TAU = Math.PI * 2;

  const clamp = (value, min = 0, max = 1) =>
    value < min ? min : value > max ? max : value;

  const lerp = (a, b, t) => a + (b - a) * t;

  function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  /* PRNG determinista: el arte es igual en cada visita */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (string, random) =>
    string[Math.floor(random() * string.length)];

  const hsl = (h, s, l, a = 1) =>
    `hsla(${((h % 360) + 360) % 360}, ${Math.round(s)}%, ${Math.round(
      l
    )}%, ${a})`;

  /* Paletas y alfabetos ASCII */
  const GLYPHS = {
    dim: ".,:;'",
    soft: ":;~-+=",
    mid: "+=*oxcvz",
    bright: "ox*csxwXW%8B",
    hot: "XWMB8%#&@",
    moon: ".,:;~=+*oO0cCxX8%#@",
  };

  const FONT_STACK =
    '"IBM Plex Mono", "Cascadia Mono", "Cascadia Code", Consolas, "Courier New", monospace';

  CL.TAU = TAU;
  CL.FONT = FONT_STACK;
  CL.GLYPHS = GLYPHS;
  CL.util = {
    clamp,
    lerp,
    smoothstep,
    mulberry32,
    pick,
    hsl,
  };
})();

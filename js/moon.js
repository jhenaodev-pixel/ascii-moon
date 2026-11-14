/* ============================================================
   moon.js · luna ASCII gigante, detallada y luminosa
   ============================================================ */

(function () {
  "use strict";

  const CL = window.CL;
  const { clamp, smoothstep, mulberry32, pick, hsl } = CL.util;

  const GRID = 58;
  const LIMIT = 1.06;

  const CRATERS = [
    { x: -0.52, y: 0.36, r: 0.17 },
    { x: -0.24, y: 0.61, r: 0.09 },
    { x: -0.71, y: 0.1, r: 0.12 },
    { x: -0.34, y: -0.2, r: 0.145 },
    { x: -0.61, y: -0.43, r: 0.105 },
    { x: -0.11, y: -0.54, r: 0.125 },
    { x: 0.19, y: 0.42, r: 0.08 },
    { x: 0.36, y: 0.16, r: 0.1 },
    { x: -0.84, y: -0.08, r: 0.07 },
    { x: -0.26, y: 0.27, r: 0.065 },
    { x: 0.04, y: 0.05, r: 0.085 },
    { x: 0.57, y: -0.36, r: 0.06 },
    { x: -0.06, y: 0.83, r: 0.045 },
    { x: 0.71, y: 0.2, r: 0.055 },
    { x: -0.48, y: 0.78, r: 0.05 },
    { x: 0.24, y: -0.8, r: 0.04 },
  ];

  const MARIA = [
    { x: -0.17, y: 0.36, rx: 0.33, ry: 0.22, strength: 0.25 },
    { x: -0.55, y: -0.12, rx: 0.25, ry: 0.3, strength: 0.19 },
    { x: 0.23, y: -0.18, rx: 0.3, ry: 0.2, strength: 0.16 },
    { x: 0.4, y: 0.52, rx: 0.2, ry: 0.16, strength: 0.13 },
    { x: -0.25, y: -0.05, rx: 0.18, ry: 0.22, strength: 0.12 },
  ];

  const COLORS = [
    { h: 43, s: 86, l: 76 },
    { h: 348, s: 72, l: 78 },
    { h: 188, s: 62, l: 76 },
    { h: 274, s: 48, l: 82 },
  ];

  class Moon {
    constructor(seed = 7301) {
      this.random = mulberry32(seed);
      this.cells = [];
      this.sparkles = [];
      this.cache = null;
      this.cacheKey = "";
      this.build();
    }

    build() {
      const r = this.random;
      const step = (LIMIT * 2) / GRID;

      this.cells.length = 0;
      this.sparkles.length = 0;

      /* pequeños racimos de color, como adornos sobre la superficie */
      const clusters = [];
      for (let i = 0; i < 26; i++) {
        clusters.push({
          x: (r() * 2 - 1) * 0.92,
          y: (r() * 2 - 1) * 0.92,
          rr: 0.035 + r() * 0.09,
          color: COLORS[Math.floor(r() * COLORS.length)],
        });
      }

      for (let row = 0; row < GRID; row++) {
        const v = LIMIT - (row + 0.5) * step;

        for (let col = 0; col < GRID; col++) {
          const u = -LIMIT + (col + 0.5) * step;
          const radius = Math.hypot(u, v);
          if (radius > 1) continue;

          const z = Math.sqrt(clamp(1 - radius * radius, 0, 1));
          const diffuse = Math.max(0, u * -0.52 + v * 0.45 + z * 0.73);
          const fillLight = Math.max(0, u * 0.16 - v * 0.08) * 0.14;

          let shade = clamp(0.14 + diffuse * 0.76 + z * 0.14 + fillLight);

          /* mares: manchas oscuras y suaves */
          for (const sea of MARIA) {
            const dx = (u - sea.x) / sea.rx;
            const dy = (v - sea.y) / sea.ry;
            const d = Math.hypot(dx, dy);
            if (d < 1) {
              shade *= 1 - sea.strength * (1 - smoothstep(0.35, 1, d));
            }
          }

          /* cráteres: fondo hundido, borde iluminado */
          let craterRim = 0;
          let craterFloor = 0;
          for (const crater of CRATERS) {
            const d = Math.hypot(u - crater.x, v - crater.y) / crater.r;
            if (d < 1) {
              const floor = 1 - smoothstep(0.16, 0.78, d);
              craterFloor = Math.max(craterFloor, floor);
              if (d > 0.62 && d < 1) {
                const rim = Math.sin(((d - 0.62) / 0.38) * Math.PI);
                craterRim = Math.max(craterRim, rim);
              }
            }
          }

          shade *= 1 - craterFloor * 0.5;
          shade += craterRim * 0.24;

          const limb = smoothstep(0.87, 1, radius);
          shade -= limb * 0.1;
          const rimLight = limb * clamp(diffuse * 1.3, 0, 1);
          shade += rimLight * 0.4;
          shade = clamp(shade, 0.04, 1);

          let hue = 219 + (r() - 0.5) * 16;
          let sat = 20 + r() * 14;
          let light = 24 + shade * 68;

          if (craterFloor > 0.16) {
            hue = 239 + r() * 10;
            sat = 30 + r() * 12;
            light = 25 + shade * 40;
          } else if (shade > 0.78) {
            hue = 206 + r() * 13;
            sat = 7 + r() * 10;
            light = 82 + r() * 12;
          } else if (shade < 0.2) {
            hue = 234 + r() * 9;
            sat = 30 + r() * 12;
            light = 22 + shade * 40;
          } else if (r() < 0.16) {
            /* vetas de color frío */
            hue += 8 + r() * 8;
            sat += 8;
          }

          let glyph;
          if (shade < 0.2) glyph = pick(".,:',", r);
          else if (shade < 0.34) glyph = pick(".,:;'", r);
          else if (shade < 0.48) glyph = pick(":;~-+", r);
          else if (shade < 0.62) glyph = pick("+=*ox", r);
          else if (shade < 0.76) glyph = pick("oxcXW", r);
          else if (shade < 0.88) glyph = pick("XWB8%#", r);
          else glyph = pick("8%#@&B", r);

          let spark = false;
          let flash = "#ffffff";
          let accent = false;
          const roll = r();

          /* racimos de color */
          let clusterColor = null;
          for (const cluster of clusters) {
            if (
              Math.hypot(u - cluster.x, v - cluster.y) < cluster.rr &&
              r() < 0.44
            ) {
              clusterColor = cluster.color;
              break;
            }
          }

          /* motas de color, como las luces del árbol */
          if (clusterColor || (shade > 0.24 && roll < 0.07)) {
            const palette = clusterColor || COLORS[Math.floor(r() * COLORS.length)];
            hue = palette.h + (r() - 0.5) * 8;
            sat = palette.s + r() * 10;
            light = palette.l + r() * 10;
            glyph = pick("*#%&8", r);
            accent = true;
            spark = r() < 0.6;
            flash = hsl(hue, 92, 93);
          } else if (shade > 0.58 && roll < 0.12) {
            spark = true;
            flash = hsl(210, 70, 96);
          }

          if (!accent && rimLight > 0.38 && shade > 0.5) {
            glyph = pick("#%@&8", r);
            light = Math.max(light, 78);
            if (r() < 0.25) {
              hue = 45;
              sat = 30;
              light = 88;
            }
          }

          this.cells.push({
            u,
            v,
            glyph,
            color: hsl(hue, sat, clamp(light, 12, 96)),
            spark,
            phase: r() * CL.TAU,
            flash,
            accent,
            weight: r() < 0.24 ? 400 : r() < 0.72 ? 500 : 600,
            sizeFactor: 0.82 + r() * 0.34,
            jx: (r() - 0.5) * 0.44,
            jy: (r() - 0.5) * 0.44,
          });

          if (spark) {
            this.sparkles.push({
              u,
              v,
              phase: r() * CL.TAU,
              flash,
            });
          }
        }
      }
    }

    invalidate() {
      this.cacheKey = "";
    }

    ensureCache(D, dpr) {
      const key = `${D.toFixed(1)}:${dpr.toFixed(2)}`;
      if (this.cache && this.cacheKey === key) return this.cache;

      const pad = 1.075;
      const offW = Math.max(1, D * pad);
      const ps = Math.min(dpr || 1, 2);
      const size = Math.max(1, Math.ceil(offW * ps));

      const canvas = this.cache
        ? this.cache.canvas
        : document.createElement("canvas");
      const bloom = this.cache
        ? this.cache.bloom
        : document.createElement("canvas");

      for (const c of [canvas, bloom]) {
        c.width = size;
        c.height = size;
      }

      const c = canvas.getContext("2d");
      c.setTransform(ps, 0, 0, ps, 0, 0);
      c.clearRect(0, 0, offW, offW);

      const cx = offW / 2;
      const cy = offW / 2;
      const radius = D / 2;
      const cell = (D / GRID) * 1.06;
      const fontSize = cell * 1.62;

      /* halo exterior */
      const halo = c.createRadialGradient(
        cx,
        cy,
        radius * 0.7,
        cx,
        cy,
        offW * 0.55
      );
      halo.addColorStop(0, "rgba(200, 222, 255, 0.2)");
      halo.addColorStop(0.4, "rgba(145, 175, 255, 0.08)");
      halo.addColorStop(1, "rgba(120, 150, 255, 0)");
      c.fillStyle = halo;
      c.fillRect(0, 0, offW, offW);

      /* disco opaco: oculta lo que pasa por detrás de la luna */
      const disc = c.createRadialGradient(
        cx - radius * 0.12,
        cy - radius * 0.16,
        radius * 0.08,
        cx,
        cy,
        radius * 1.01
      );
      disc.addColorStop(0, "#0b0a1a");
      disc.addColorStop(0.7, "#080713");
      disc.addColorStop(1, "#05040c");
      c.beginPath();
      c.arc(cx, cy, radius * 1.005, 0, CL.TAU);
      c.fillStyle = disc;
      c.fill();

      c.textAlign = "center";
      c.textBaseline = "middle";

      /* brillo suave en las celdas más vivas */
      c.save();
      c.globalCompositeOperation = "lighter";
      c.shadowColor = "rgba(200, 220, 255, 0.65)";
      c.shadowBlur = 5;
      c.font = `500 ${fontSize.toFixed(1)}px ${CL.FONT}`;
      for (const cellData of this.cells) {
        if (!cellData.spark && !cellData.accent) continue;
        const px = cx + cellData.u * radius;
        const py = cy - cellData.v * radius;
        c.globalAlpha = 0.34;
        c.fillStyle = cellData.color;
        c.fillText(cellData.glyph, px, py);
      }
      c.restore();

      for (const cellData of this.cells) {
        const px =
          cx + cellData.u * radius + cellData.jx * cell * 0.34;
        const py =
          cy - cellData.v * radius + cellData.jy * cell * 0.34;

        c.font = `${cellData.weight} ${(
          fontSize * cellData.sizeFactor
        ).toFixed(1)}px ${CL.FONT}`;
        c.fillStyle = cellData.color;
        c.fillText(cellData.glyph, px, py);
      }

      /* copia desenfocada para el bloom */
      const b = bloom.getContext("2d");
      b.setTransform(1, 0, 0, 1, 0, 0);
      b.clearRect(0, 0, size, size);
      b.filter = `blur(${Math.round(6 * ps)}px)`;
      b.drawImage(canvas, 0, 0);
      b.filter = "none";

      this.cache = {
        canvas,
        bloom,
        offW,
        radius,
        cell,
        fontSize,
        cx,
        cy,
      };
      this.cacheKey = key;
      return this.cache;
    }

    draw(ctx, layout, time) {
      const D = layout.moonD;
      if (!D || D < 2) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cache = this.ensureCache(D, dpr);
      const cx = layout.moonCx;
      const cy = layout.moonCy;

      /* halo exterior que respira */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.5);
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        D * 0.44,
        cx,
        cy,
        D * 0.9
      );
      glow.addColorStop(0, `rgba(130, 170, 255, ${0.05 + breathe * 0.03})`);
      glow.addColorStop(0.5, "rgba(120, 155, 255, 0.025)");
      glow.addColorStop(1, "rgba(100, 130, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - D, cy - D, D * 2, D * 2);

      /* anillo luminoso en el borde, también en la cara oscura */
      const ring = ctx.createRadialGradient(
        cx,
        cy,
        D * 0.45,
        cx,
        cy,
        D * 0.57
      );
      ring.addColorStop(0, "rgba(150, 185, 255, 0)");
      ring.addColorStop(0.34, `rgba(160, 195, 255, ${0.07 + breathe * 0.03})`);
      ring.addColorStop(0.55, "rgba(205, 225, 255, 0.16)");
      ring.addColorStop(0.72, "rgba(140, 175, 255, 0.05)");
      ring.addColorStop(1, "rgba(120, 150, 255, 0)");
      ctx.fillStyle = ring;
      ctx.fillRect(cx - D, cy - D, D * 2, D * 2);

      /* bloom de la luna */
      ctx.globalAlpha = 0.5;
      ctx.drawImage(
        cache.bloom,
        cx - cache.offW / 2,
        cy - cache.offW / 2,
        cache.offW,
        cache.offW
      );
      ctx.restore();

      /* cuerpo nítido */
      ctx.drawImage(
        cache.canvas,
        cx - cache.offW / 2,
        cy - cache.offW / 2,
        cache.offW,
        cache.offW
      );

      /* destellos vivos sobre la superficie */
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `500 ${cache.fontSize.toFixed(1)}px ${CL.FONT}`;

      for (const s of this.sparkles) {
        const wave = Math.sin(time * 1.9 + s.phase);
        if (wave < 0.84) continue;
        const alpha = smoothstep(0.84, 1, wave);
        const px = cx + s.u * cache.radius;
        const py = cy - s.v * cache.radius;

        ctx.globalAlpha = alpha * 0.92;
        ctx.fillStyle = s.flash;
        ctx.shadowColor = s.flash;
        ctx.shadowBlur = 7;
        ctx.fillText("*", px, py);
      }

      ctx.restore();
    }
  }

  CL.Moon = Moon;
})();

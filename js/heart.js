/* ============================================================
   heart.js · corazón ASCII de silueta clásica que orbita la luna
   ============================================================ */

(function () {
  "use strict";

  const CL = window.CL;
  const { clamp, mulberry32, pick, hsl } = CL.util;
  const G = CL.GLYPHS;

  const COLS = 46;
  const ROWS = 44;
  const ORBIT_START = Math.PI * 0.78;
  const ORBIT_SPEED = 0.12;

  /* curva clásica del corazón:
     x = 16·sen³(t)
     y = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t) */
  function heartPoint(t) {
    const s = Math.sin(t);
    return {
      x: 16 * s * s * s,
      y:
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t),
    };
  }

  function isInside(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      if (
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  class Heart {
    constructor(seed = 20261113) {
      this.random = mulberry32(seed);
      this.cells = [];
      this.orbitDots = [];
      this.outline = [];
      this.bounds = null;
      this.buildOutline();
      this.build();
      this.buildOrbitDots();
    }

    buildOutline() {
      this.outline.length = 0;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < 720; i++) {
        const point = heartPoint((i / 720) * CL.TAU);
        this.outline.push(point);
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }

      this.bounds = {
        minX,
        maxX,
        minY,
        maxY,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    build() {
      const r = this.random;
      const b = this.bounds;
      const insideGrid = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(false)
      );
      const raw = [];

      this.cells.length = 0;

      for (let row = 0; row < ROWS; row++) {
        const y = b.maxY - ((row + 0.5) / ROWS) * b.height;

        for (let col = 0; col < COLS; col++) {
          const x = b.minX + ((col + 0.5) / COLS) * b.width;

          if (!isInside(x, y, this.outline)) continue;

          insideGrid[row][col] = true;
          raw.push({ row, col, x, y });
        }
      }

      for (const cell of raw) {
        const { row, col, x, y } = cell;
        let rim = false;

        for (let dr = -1; dr <= 1 && !rim; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = row + dr;
            const cc = col + dc;
            if (
              rr < 0 ||
              rr >= ROWS ||
              cc < 0 ||
              cc >= COLS ||
              !insideGrid[rr][cc]
            ) {
              rim = true;
              break;
            }
          }
        }

        const nx = x / 16;
        const ny = y / 16;
        const field =
          Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        const depth = Math.pow(clamp(-field * 2.8, 0, 1), 0.42);
        const lighting = clamp(0.5 - nx * 0.14 + ny * 0.14);
        const spec =
          Math.exp(
            -(
              Math.pow((nx + 0.38) / 0.3, 2) +
              Math.pow((ny - 0.54) / 0.28, 2)
            ) * 2.2
          ) +
          0.4 *
            Math.exp(
              -(
                Math.pow((nx - 0.34) / 0.24, 2) +
                Math.pow((ny - 0.46) / 0.22, 2)
              ) * 2.6
            );

        let shade = clamp(
          0.2 + 0.5 * lighting + 0.2 * depth + spec * 0.32
        );

        let hue = 342 + Math.sin(nx * 2.4 + ny * 1.6) * 8 + (r() - 0.5) * 8;
        let sat = 84 + r() * 14;
        let light = 23 + Math.pow(shade, 1.22) * 57;
        light *= 0.94 + clamp((ny + 0.2) * 0.11, 0, 0.11);
        let glyph;
        let spark = false;
        let flash = "#fff3f8";
        let accent = false;

        const roll = r();

        if (!rim && roll < 0.045) {
          hue = 41 + r() * 9;
          sat = 95;
          light = 64 + r() * 16;
          glyph = pick("*#8%@&", r);
          spark = true;
          flash = hsl(48, 100, 94);
          accent = true;
        } else if (!rim && roll < 0.06) {
          hue = 350 + r() * 8;
          sat = 100;
          light = 93;
          glyph = pick("*%@", r);
          spark = true;
          flash = "#ffffff";
          accent = true;
        } else if (!rim && roll < 0.073) {
          hue = 4 + r() * 9;
          sat = 93;
          light = 62 + r() * 8;
          glyph = pick("%&8#", r);
          accent = true;
        } else if (nx > 0.22 && ny < 0.28) {
          hue -= 16;
        }

        if (rim) {
          hue = 347 + r() * 8;
          sat = 97;
          light = 80 + r() * 15;
          glyph = pick("#%@&*XB", r);
        } else if (!glyph) {
          if (shade < 0.24) glyph = pick(G.dim, r);
          else if (shade < 0.4) glyph = pick(G.soft, r);
          else if (shade < 0.56) glyph = pick(G.mid, r);
          else if (shade < 0.72) glyph = pick(G.bright, r);
          else glyph = pick(G.hot, r);
        }

        if (!rim && !accent && shade > 0.68 && r() < 0.03) {
          spark = true;
          flash = hsl(45, 100, 93);
        }

        this.cells.push({
          x,
          y,
          glyph,
          color: hsl(hue, sat, clamp(light, 18, 96)),
          rim,
          spark,
          phase: r() * CL.TAU,
          flash,
          jx: (r() - 0.5) * 0.26,
          jy: (r() - 0.5) * 0.26,
          depth,
        });
      }
    }

    buildOrbitDots() {
      const r = this.random;
      this.orbitDots.length = 0;
      for (let i = 0; i < 180; i++) {
        this.orbitDots.push({
          angle: (i / 180) * CL.TAU,
          phase: r() * CL.TAU,
          glyph: pick(".+*'", r),
          color: r() < 0.2 ? "#ffb7cc" : r() < 0.55 ? "#cfe0ff" : "#8ea9e8",
        });
      }
    }

    orbitState(layout, time) {
      const angle = ORBIT_START + time * ORBIT_SPEED;
      const cosT = Math.cos(layout.orbitTilt);
      const sinT = Math.sin(layout.orbitTilt);
      const lx = Math.cos(angle) * layout.orbitRx;
      const ly = Math.sin(angle) * layout.orbitRy;

      return {
        angle,
        x: layout.moonCx + lx * cosT - ly * sinT,
        y: layout.moonCy + lx * sinT + ly * cosT,
        depth: Math.sin(angle),
        front: Math.sin(angle) >= 0,
        scale: 1 + Math.sin(angle) * 0.09,
      };
    }

    positionOnOrbit(layout, angle) {
      const cosT = Math.cos(layout.orbitTilt);
      const sinT = Math.sin(layout.orbitTilt);
      const lx = Math.cos(angle) * layout.orbitRx;
      const ly = Math.sin(angle) * layout.orbitRy;
      return {
        x: layout.moonCx + lx * cosT - ly * sinT,
        y: layout.moonCy + lx * sinT + ly * cosT,
        depth: Math.sin(angle),
      };
    }

    drawOrbit(ctx, layout, time, front) {
      if (layout.orbitRx < 2 || layout.orbitRy < 2) return;

      /* el anillo nunca se dibuja sobre la cara de la luna */
      const moonR = layout.moonD * 0.5 + 7;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fontSize = clamp(layout.heartSize * 0.048, 5.5, 10);
      ctx.font = `400 ${fontSize.toFixed(1)}px ${CL.FONT}`;

      for (let i = 0; i < this.orbitDots.length; i++) {
        if (i % 9 === 7) continue;

        const dot = this.orbitDots[i];
        const depth = Math.sin(dot.angle);
        if (front ? depth < 0 : depth >= 0) continue;

        const pos = this.positionOnOrbit(layout, dot.angle);
        const dx = pos.x - layout.moonCx;
        const dy = pos.y - layout.moonCy;
        if (Math.hypot(dx, dy) < moonR) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.9 + dot.phase);
        ctx.globalAlpha = (front ? 0.13 : 0.07) + twinkle * 0.16;
        ctx.fillStyle = dot.color;
        ctx.fillText(dot.glyph, pos.x, pos.y);
      }

      /* polvo fino entre las letras, para que el trazo se lea continuo */
      ctx.fillStyle = front ? "rgba(200, 218, 255, 0.5)" : "rgba(150, 175, 245, 0.32)";
      for (let i = 0; i < 240; i++) {
        if (i % 2 !== 0) continue;
        const angle = (i / 240) * CL.TAU;
        if (front ? Math.sin(angle) < 0 : Math.sin(angle) >= 0) continue;
        const pos = this.positionOnOrbit(layout, angle);
        const dx = pos.x - layout.moonCx;
        const dy = pos.y - layout.moonCy;
        if (Math.hypot(dx, dy) < moonR) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 1.4 + angle * 5);
        ctx.globalAlpha = (front ? 0.07 : 0.035) + twinkle * 0.07;
        ctx.fillRect(pos.x - 0.7, pos.y - 0.7, 1.4, 1.4);
      }

      ctx.restore();
    }

    draw(ctx, layout, time, orbit) {
      const b = this.bounds;
      const size = layout.heartSize * orbit.scale;
      const scale = size / b.width;
      const pulse = 1 + Math.sin(time * 1.3 + 0.4) * 0.012;
      const sway = Math.sin(time * 0.32 + 0.8) * 0.026;
      const cx = orbit.x;
      const cy = orbit.y;
      const cellW = size / COLS;

      /* estela de polvo */
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const trailFont = clamp(size * 0.055, 5.5, 12);
      ctx.font = `400 ${trailFont.toFixed(1)}px ${CL.FONT}`;
      for (let i = 1; i <= 9; i++) {
        const pos = this.positionOnOrbit(layout, orbit.angle - i * 0.012);
        const twinkle = 0.5 + 0.5 * Math.sin(time * 1.8 + i * 1.3);
        ctx.globalAlpha = (1 - i / 10) * (0.18 + twinkle * 0.3);
        ctx.fillStyle = i % 3 === 0 ? "#ffd28a" : "#ff9db9";
        ctx.fillText(i < 4 ? "+" : ".", pos.x, pos.y);
      }
      ctx.restore();

      /* halo y contraste */
      ctx.save();
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        size * 0.02,
        cx,
        cy,
        size * 0.82
      );
      const strength = 0.12 + Math.max(0, orbit.depth) * 0.06;
      glow.addColorStop(0, `rgba(255, 48, 112, ${strength})`);
      glow.addColorStop(0.5, "rgba(255, 30, 100, 0.035)");
      glow.addColorStop(1, "rgba(255, 30, 100, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sway);
      ctx.scale(pulse, 1 + (pulse - 1) * 0.7);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const localX = (x) => (x - b.cx) * scale;
      const localY = (y) => -(y - b.cy) * scale;

      /* silueta: relleno oscuro para separar del fondo y borde neón tenue */
      ctx.beginPath();
      for (let i = 0; i < this.outline.length; i++) {
        const p = this.outline[i];
        const px = localX(p.x);
        const py = localY(p.y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      /* halo oscuro: separa el corazón de la textura de la luna */
      ctx.shadowColor = "rgba(2, 1, 6, 0.95)";
      ctx.shadowBlur = size * 0.2;
      ctx.fillStyle = "rgba(7, 3, 14, 0.72)";
      ctx.fill();
      ctx.shadowBlur = 0;

      /* interior */
      const fontSize = cellW * 1.55;
      ctx.font = `500 ${fontSize.toFixed(1)}px ${CL.FONT}`;

      for (const cell of this.cells) {
        const px = localX(cell.x) + cell.jx * cellW;
        const py = localY(cell.y) + cell.jy * cellW;
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.glyph, px, py);

        if (cell.spark) {
          const wave = Math.sin(time * 2.2 + cell.phase);
          if (wave > 0.84) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = cell.flash;
            ctx.shadowColor = cell.flash;
            ctx.shadowBlur = 6;
            ctx.fillText("*", px, py);
            ctx.restore();
          }
        }
      }

      /* el borde vuelve a dibujarse para que la silueta quede nítida */
      ctx.strokeStyle = "rgba(255, 105, 150, 0.5)";
      ctx.lineWidth = 1.15;
      ctx.shadowColor = "rgba(255, 65, 120, 0.85)";
      ctx.shadowBlur = 11;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  CL.Heart = Heart;
})();

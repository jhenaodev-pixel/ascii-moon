/* ============================================================
   starfield.js · cielo profundo, polvo de estrellas y fugaces
   ============================================================ */

(function () {
  "use strict";

  const CL = window.CL;
  const { clamp, mulberry32, pick } = CL.util;

  class Starfield {
    constructor(seed = 113) {
      this.random = mulberry32(seed);
      this.stars = [];
      this.band = [];
      this.shooting = [];
      this.nextShooting = 2.6;
      this.build();
    }

    build() {
      const r = this.random;
      const palette = [
        "#ffffff",
        "#e3ecff",
        "#c9dcff",
        "#ffe9f2",
        "#fff4d2",
        "#b5c9ff",
        "#d8ccff",
      ];

      this.stars.length = 0;
      this.band.length = 0;

      for (let i = 0; i < 900; i++) {
        const glyphStar = r() < 0.075;
        this.stars.push({
          x: r(),
          y: r(),
          size: glyphStar ? 4 + r() * 4.5 : 0.7 + r() * 1.9,
          phase: r() * CL.TAU,
          speed: 0.22 + r() * 1.2,
          bright: 0.28 + r() * 0.72,
          glyph: glyphStar ? pick("+*x.", r) : null,
          color: pick(palette, r),
        });
      }

      /* vía láctea: una banda diagonal de polvo casi invisible */
      for (let i = 0; i < 360; i++) {
        const x = r();
        const spread = (r() + r() + r() + r() - 2) * 0.085;
        this.band.push({
          x,
          y: clamp(0.92 - x * 0.7 + spread, 0.02, 0.98),
          size: 0.5 + r() * 1.2,
          phase: r() * CL.TAU,
          speed: 0.12 + r() * 0.5,
          bright: 0.14 + r() * 0.45,
          color: r() < 0.58 ? "#a9bbeb" : "#ffe5f0",
        });
      }
    }

    spawnShooting(width, height) {
      const angle = Math.PI * (0.8 + this.random() * 0.055);
      const speed = 380 + this.random() * 420;
      this.shooting.push({
        x: width * (0.35 + this.random() * 0.64),
        y: height * (0.02 + this.random() * 0.32),
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed * 0.55,
        life: 0,
        maxLife: 0.9 + this.random() * 0.8,
        len: 55 + this.random() * 150,
      });
    }

    update(dt, width, height) {
      this.nextShooting -= dt;
      if (this.nextShooting <= 0) {
        this.spawnShooting(width, height);
        this.nextShooting = 5 + this.random() * 9;
      }

      for (let i = this.shooting.length - 1; i >= 0; i--) {
        const s = this.shooting[i];
        s.life += dt;
        s.x += s.vx * dt;
        s.y -= Math.abs(s.vy) * dt;
        if (s.life > s.maxLife || s.x < -220 || s.y > height + 220) {
          this.shooting.splice(i, 1);
        }
      }
    }

    draw(ctx, width, height, time) {
      /* banda de polvo */
      ctx.save();
      for (const s of this.band) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
        ctx.globalAlpha = 0.05 + twinkle * 0.18 * s.bright;
        ctx.fillStyle = s.color;
        ctx.fillRect(
          s.x * width,
          s.y * height,
          Math.max(1, s.size),
          Math.max(1, s.size)
        );
      }
      ctx.restore();

      /* estrellas */
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let lastFont = 0;

      for (const s of this.stars) {
        const wave = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
        const twinkle = wave * wave;
        const x = s.x * width;
        const y = s.y * height;

        if (s.glyph) {
          const fontSize = Math.round(s.size * 2.15);
          if (fontSize !== lastFont) {
            ctx.font = `300 ${fontSize}px ${CL.FONT}`;
            lastFont = fontSize;
          }
          ctx.globalAlpha = 0.18 + twinkle * 0.68 * s.bright;
          ctx.fillStyle = s.color;
          ctx.fillText(s.glyph, x, y);
        } else {
          ctx.globalAlpha = 0.16 + twinkle * 0.8 * s.bright;
          ctx.fillStyle = s.color;
          const size = Math.max(1, s.size * (0.8 + twinkle * 0.5));
          ctx.fillRect(x, y, size, size);
        }
      }
      ctx.restore();

      /* estrellas fugaces */
      for (const s of this.shooting) {
        const p = s.life / s.maxLife;
        const fade = Math.sin(Math.PI * clamp(p, 0, 1));
        const dx = s.vx;
        const dy = -Math.abs(s.vy);
        const mag = Math.hypot(dx, dy) || 1;
        const tx = s.x - (dx / mag) * s.len;
        const ty = s.y - (dy / mag) * s.len;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
        grad.addColorStop(0, `rgba(255, 246, 251, ${0.9 * fade})`);
        grad.addColorStop(0.22, `rgba(255, 190, 220, ${0.5 * fade})`);
        grad.addColorStop(1, "rgba(255, 190, 220, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.shadowColor = "rgba(255, 205, 232, 0.9)";
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.3, 0, CL.TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  CL.Starfield = Starfield;
})();

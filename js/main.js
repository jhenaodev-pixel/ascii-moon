/* ============================================================
   main.js · composición, órbita, música y bucle
   ============================================================ */

(function () {
  "use strict";

  const CL = window.CL;

  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d", { alpha: false });
  const audio = document.getElementById("music");
  const hint = document.getElementById("sound-hint");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let layout = null;

  const starfield = new CL.Starfield();
  const heart = new CL.Heart();
  const moon = new CL.Moon();

  /* ---------------------------------------------------------- */
  /* composición                                                */
  /* ---------------------------------------------------------- */

  function computeLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w * 1.05;

    const moonD = portrait
      ? Math.min(w * 0.86, h * 0.52, 640)
      : Math.min(w * 0.58, h * 0.72, 760);

    const moonCx = w * 0.5;
    const moonCy = h * (portrait ? 0.455 : 0.485);

    const heartSize = Math.min(
      moonD * 0.38,
      w * 0.31,
      portrait ? 160 : 270
    );

    const orbitRx = Math.max(
      0,
      Math.min(moonD * 0.68, (w - heartSize) / 2 - 16)
    );
    const orbitRy = Math.max(
      0,
      Math.min(moonD * 0.48, (h - heartSize) / 2 - 70)
    );

    return {
      w,
      h,
      portrait,
      moonD,
      moonCx,
      moonCy,
      heartSize,
      orbitRx,
      orbitRy,
      orbitTilt: -0.17,
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    layout = computeLayout();
    moon.invalidate();
  }

  function paintBackground(time) {
    const w = width;
    const h = height;

    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, "#080613");
    base.addColorStop(0.48, "#05040d");
    base.addColorStop(1, "#020107");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    /* nebulosa fría alrededor de la luna */
    const cold = ctx.createRadialGradient(
      layout.moonCx,
      layout.moonCy,
      0,
      layout.moonCx,
      layout.moonCy,
      layout.moonD * 1.15
    );
    cold.addColorStop(0, "rgba(82, 110, 210, 0.075)");
    cold.addColorStop(0.45, "rgba(70, 90, 190, 0.03)");
    cold.addColorStop(1, "rgba(50, 60, 150, 0)");
    ctx.fillStyle = cold;
    ctx.fillRect(0, 0, w, h);

    /* brasa rosa en la zona baja, donde orbita el corazón */
    const warm = ctx.createRadialGradient(
      w * 0.34,
      h * 0.76,
      0,
      w * 0.34,
      h * 0.76,
      Math.max(w, h) * 0.46
    );
    warm.addColorStop(0, "rgba(255, 52, 116, 0.045)");
    warm.addColorStop(0.55, "rgba(190, 35, 100, 0.015)");
    warm.addColorStop(1, "rgba(120, 20, 80, 0)");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);

    /* velo violeta en la esquina superior */
    const veil = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.7);
    veil.addColorStop(0, "rgba(90, 45, 130, 0.045)");
    veil.addColorStop(0.5, "rgba(40, 20, 80, 0.012)");
    veil.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();

    /* un latido de luz muy tenue en el fondo */
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.9);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const faint = ctx.createRadialGradient(
      layout.moonCx,
      layout.moonCy,
      layout.moonD * 0.3,
      layout.moonCx,
      layout.moonCy,
      layout.moonD * 0.9
    );
    faint.addColorStop(0, `rgba(255, 110, 150, ${0.005 + pulse * 0.006})`);
    faint.addColorStop(1, "rgba(255, 80, 130, 0)");
    ctx.fillStyle = faint;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /* ---------------------------------------------------------- */
  /* bucle                                                      */
  /* ---------------------------------------------------------- */

  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;
  let lastFrame = 0;

  function render(now) {
    const time = now / 1000;
    const dt = Math.min(1 / TARGET_FPS, 0.05);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    paintBackground(time);
    starfield.update(dt, width, height);
    starfield.draw(ctx, width, height, time);

    const orbit = heart.orbitState(layout, time);

    /* mitad lejana de la órbita y corazón cuando pasa por detrás */
    heart.drawOrbit(ctx, layout, time, false);
    if (!orbit.front) heart.draw(ctx, layout, time, orbit);

    moon.draw(ctx, layout, time);

    /* mitad cercana de la órbita y corazón cuando pasa por delante */
    heart.drawOrbit(ctx, layout, time, true);
    if (orbit.front) heart.draw(ctx, layout, time, orbit);
  }

  function loop(now) {
    window.requestAnimationFrame(loop);

    if (!lastFrame) lastFrame = now;
    const elapsed = now - lastFrame;
    if (elapsed < FRAME_MS - 1.6) return;

    lastFrame = now - (elapsed % FRAME_MS);
    render(now);
  }

  /* ---------------------------------------------------------- */
  /* música local                                               */
  /* ---------------------------------------------------------- */

  function setupMusic() {
    if (!audio) return;

    let started = false;
    let unlocking = false;

    const targetVolume = 0.52;
    let fading = false;
    audio.volume = 0;

    const fadeIn = () => {
      if (fading) return;
      fading = true;
      /* temporizador, no rAF: suena aunque la pestaña esté en segundo plano */
      const start = Date.now();
      const id = window.setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / 1400);
        audio.volume = targetVolume * t;
        if (t >= 1) window.clearInterval(id);
      }, 60);

      window.setTimeout(() => {
        window.clearInterval(id);
        audio.volume = targetVolume;
      }, 1600);
    };

    const hideHint = () => hint.classList.remove("show");
    const showHint = () => {
      if (!started) hint.classList.add("show");
    };

    const play = () => {
      if (started) return;
      if (unlocking) return;
      unlocking = true;

      const promise = audio.play();
      if (promise && typeof promise.then === "function") {
        promise
          .then(() => {
            started = true;
            unlocking = false;
            hideHint();
            fadeIn();
          })
          .catch(() => {
            unlocking = false;
            showHint();
          });
      } else {
        started = true;
        unlocking = false;
        hideHint();
        fadeIn();
      }
    };

    const unlock = () => play();

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("pointerup", unlock, { passive: true });
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("touchend", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    audio.addEventListener("playing", () => {
      started = true;
      hideHint();
      if (audio.volume < 0.05) fadeIn();
    });

    /* intento de autoplay; si el navegador lo bloquea, aparece la pista */
    window.setTimeout(play, 400);
    window.setTimeout(() => {
      if (!started) showHint();
    }, 1200);
  }

  /* ---------------------------------------------------------- */
  /* arranque                                                   */
  /* ---------------------------------------------------------- */

  resize();
  window.requestAnimationFrame(loop);
  setupMusic();

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(resize, 200);
  });

  document.addEventListener("visibilitychange", () => {
    lastFrame = 0;
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moon.invalidate());
  }
})();

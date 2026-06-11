/* ============================================================
   smooth.js — site-wide eased momentum scrolling (Lenis)
   Synced to GSAP ScrollTrigger when present. Honors reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof Lenis === "undefined") return;

  var lenis = new Lenis({
    // lerp-only smoothing (momentum). Do NOT also pass duration/easing —
    // mixing the two modes makes settling inconsistent and snaps at pin edges.
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.3
  });
  window.__lenis = lenis;

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
})();

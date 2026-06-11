/* ============================================================
   luxe.js — gold cursor · stitch reveal
   Loads on every page. Reduced-motion safe.
   Page transitions are handled by Astro's <ClientRouter /> using the
   browser View Transitions API — the JS "curtain" was removed because it
   was running TWICE per navigation (once on leave, once on enter).
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1 · Gold cursor ----------
     Guarded so re-execution (data-astro-rerun + ClientRouter) doesn't
     mount duplicate cursor elements or stack global listeners. */
  if (fine && !reduce && !window.__brLuxeCursor) {
    window.__brLuxeCursor = true;
    document.documentElement.classList.add("luxe-cursor");
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    function mountCursor(){
      if (!document.body.contains(dot)) document.body.appendChild(dot);
      if (!document.body.contains(ring)) document.body.appendChild(ring);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountCursor);
    else mountCursor();
    // Re-mount after each ClientRouter swap (body is replaced)
    document.addEventListener("astro:page-load", mountCursor);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    var hotSel = "a, button, [data-goto], .lang-btn, .filter-chip, .product-card, .cat-card, .pin, summary, [role=button]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hotSel)) ring.classList.add("hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hotSel)) ring.classList.remove("hot");
    });
    window.addEventListener("mousedown", function () { ring.classList.add("down"); });
    window.addEventListener("mouseup", function () { ring.classList.remove("down"); });
    document.addEventListener("mouseleave", function () { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener("mouseenter", function () { dot.style.opacity = 1; ring.style.opacity = 1; });
  }

  /* ---------- 2 · Heading stitch reveal ----------
     Per-page bindings: runs on every (re-)execution so new DOM after a
     ClientRouter swap gets stitched. Safe because prep() is idempotent
     via dataset.stitched. */
  var headSel = ".chap-title, .flag-quote, .shop-h1, .shop-hero h1, .map-section h2, .info-block h3, .related h2, .contact-card h2, .partners h2";
  var stitchIO = null;
  function collectHeads() { return Array.prototype.slice.call(document.querySelectorAll(headSel)); }
  function prep(el) {
    if (el.dataset.stitched) return;
    el.dataset.stitched = "1";
    el.classList.add("stitch");
    el.classList.remove("reveal", "d1", "d2", "d3", "d4");
  }
  // Safety net: IntersectionObserver misfires inside GSAP-pinned/transformed
  // containers (like #metiers-pin), leaving "Six métiers, une exigence." and
  // similar headings clipped at inset(0 100% 0 0) — visually invisible.
  // Re-check on every scroll/resize and force .in for any stitched heading
  // that is currently within the viewport.
  function revealVisibleStitch() {
    collectHeads().forEach(function (e) {
      if (e.classList.contains("stitch") && !e.classList.contains("in")) {
        var r = e.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) e.classList.add("in");
      }
    });
  }

  // Hard fallback: after this delay, force-reveal any stitched heading that
  // is still clipped, regardless of position. Decorative effect should never
  // make content permanently invisible.
  function forceRevealAllStitch() {
    collectHeads().forEach(function (e) {
      if (e.classList.contains("stitch")) e.classList.add("in");
    });
  }

  function initStitch() {
    var els = collectHeads();
    els.forEach(prep);
    if (reduce) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    if (stitchIO) { try { stitchIO.disconnect(); } catch (e) {} }
    stitchIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); stitchIO.unobserve(en.target); }
      });
    }, { threshold: [0, 0.1, 0.3], rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) {
      if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add("in");
      else stitchIO.observe(e);
    });
    // Sweep at next frame (catches layout settling), then a few delayed sweeps.
    requestAnimationFrame(revealVisibleStitch);
    setTimeout(revealVisibleStitch, 300);
    setTimeout(revealVisibleStitch, 800);
    setTimeout(revealVisibleStitch, 1600);
    // Hard fallback — anything still clipped after 2.5s gets revealed unconditionally.
    setTimeout(forceRevealAllStitch, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initStitch);
  else initStitch();

  // Bind the scroll/resize/page-load safety nets once across all reruns.
  if (!window.__brStitchScrollBound) {
    window.__brStitchScrollBound = true;
    window.addEventListener("scroll", revealVisibleStitch, { passive: true });
    window.addEventListener("resize", revealVisibleStitch);
    document.addEventListener("astro:page-load", revealVisibleStitch);
  }
  // Guard the langchange listener too
  if (!window.__brLuxeLangBound) {
    window.__brLuxeLangBound = true;
    window.addEventListener("br:langchange", function () {
      collectHeads().forEach(function (e) { if (e.classList.contains("stitch")) e.classList.add("in"); });
    });
  }
})();

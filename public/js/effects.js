/* ============================================================
   effects.js — thread draw, gold particles, chrome, reveals
   ============================================================ */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- OVERTURE dismiss ----------
     Client asked for a snappier intro: total splash budget 1.5-2s.
     Crest animates in over 0.9s (see @keyframes overtureIn), line
     fades in at 0.3s+0.55s, then we start the fade-out. Fade lasts
     0.4s (see #overture transition), display:none clears the layer.
     Fallback timer still fires in case window.load never resolves
     (some proxies stall long-poll requests). */
  const overture = document.getElementById("overture");
  function dismissOverture() {
    if (!overture) return;
    overture.classList.add("done");
    setTimeout(() => overture && (overture.style.display = "none"), 450);
  }
  window.addEventListener("load", () => setTimeout(dismissOverture, 1200));
  setTimeout(dismissOverture, 2200);

  /* ---------- NAV: scrolled state + progress ---------- */
  const nav = document.getElementById("nav");
  const progressFill = document.getElementById("progressFill");
  function onScrollChrome() {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", y > 48);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    if (progressFill) progressFill.style.width = (p * 100).toFixed(2) + "%";
  }

  /* ---------- smooth goto ---------- */
  document.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", () => {
      const target = document.getElementById(el.getAttribute("data-goto"));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.4 });
      else window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ---------- STAT COUNT-UP on enter ----------
     .stat-num elements animate from 0 to their final numeric value
     when they first scroll into view. Ease-out cubic keeps the last
     third slow — brand-appropriate calm. i18n changes overwrite the
     text (via data-i18n) so we cache the target once and re-run
     if the value gets stomped. Reduced-motion visitors just see the
     final number immediately. */
  const countEls = Array.from(document.querySelectorAll(".stat-num"));
  function animateCount(el) {
    const raw = (el.textContent || "").trim();
    // Match the first digit run anywhere in the string, allowing thousands
    // separators (space, NBSP, narrow-NBSP, comma, Arabic thousand-mark) so
    // "Plus de 360 000" or "360,000+" both work. Whatever wraps the number
    // ("+40 سنة", "40+ years", "Plus de 40 ans") is preserved verbatim.
    const m = raw.match(/^(.*?)(\d[\d\s  ,٬]*\d|\d)(.*)$/s);
    if (!m) return; // no digit → nothing to animate ("Plus d'un million")
    const prefix = m[1], numStr = m[2], suffix = m[3];
    const target = parseInt(numStr.replace(/[^\d]/g, ''), 10);
    if (!isFinite(target) || target < 5) { el.textContent = raw; return; }
    if (prefersReduced) { el.textContent = raw; return; }
    // Mirror the separator style the target uses so intermediate frames read cleanly
    const sepMatch = numStr.match(/[\s  ,٬]/);
    const sep = sepMatch ? sepMatch[0] : '';
    const fmt = sep
      ? (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep)
      : (n) => String(n);
    const dur = target >= 100000 ? 1800 : target >= 1000 ? 1500 : 1400;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const val = Math.round(target * eased);
      el.textContent = prefix + fmt(val) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  countEls.forEach(el => countIO.observe(el));
  // If the language switches after the count already ran, [data-i18n] will
  // overwrite our animated text with the raw target — that's fine, the
  // final value is what we ended on anyway.

  /* ---------- GALLERY staggered reveal ----------
     Each .gal-item fades + rises in as it scrolls into view. Per-index
     transitionDelay creates the "cascade" effect the review brief asked
     for — images don't appear simultaneously. Reduced-motion visitors
     get the final state instantly via the CSS media guard. */
  const galleryGrid = document.getElementById("galGrid");
  if (galleryGrid) {
    const galItems = Array.from(galleryGrid.querySelectorAll(".gal-item"));
    const galIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const idx = galItems.indexOf(e.target);
        e.target.style.transitionDelay = Math.max(0, idx) * 80 + "ms";
        e.target.classList.add("gal-in");
        galIO.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    galItems.forEach(el => galIO.observe(el));
  }

  /* ---------- REVEAL on enter ---------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach(el => io.observe(el));
  // Safety net: never leave copy hidden if IO doesn't fire (some embeds suppress it)
  function revealInView() {
    const h = window.innerHeight;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (el.classList.contains("in")) { revealEls.splice(i, 1); continue; }
      if (el.getBoundingClientRect().top < h * 0.92) { el.classList.add("in"); revealEls.splice(i, 1); }
    }
  }
  window.addEventListener("load", () => setTimeout(revealInView, 300));
  setTimeout(revealInView, 1200);

  /* ============================================================
     THE THREAD — a gold line that draws as you scroll
     ============================================================ */
  const track = document.getElementById("threadTrack");
  let threadPath, threadLen, needleEl, bandW = 74, amp = 17, waves = 7;
  function waveX(t) { return bandW / 2 + amp * Math.sin(t * Math.PI * waves); }

  function buildThread() {
    if (!track) return;
    const H = window.innerHeight;
    track.style.cssText =
      "position:fixed;top:0;left:0;width:" + bandW + "px;height:100vh;z-index:60;pointer-events:none;";
    if (document.documentElement.dir === "rtl") {
      track.style.left = "auto"; track.style.right = "0";
    } else { track.style.right = "auto"; track.style.left = "0"; }

    // build path d
    let d = "";
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = waveX(t).toFixed(2), y = (t * H).toFixed(2);
      d += (i === 0 ? "M" : "L") + x + " " + y + " ";
    }
    track.innerHTML =
      '<svg width="' + bandW + '" height="' + H + '" viewBox="0 0 ' + bandW + ' ' + H + '" fill="none">' +
      '<defs><linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#876A33"/><stop offset="0.5" stop-color="#C9A45A"/><stop offset="1" stop-color="#A98847"/>' +
      '</linearGradient></defs>' +
      '<path class="thread-base" d="' + d + '"/>' +
      '<path class="thread-draw" id="threadDraw" d="' + d + '"/>' +
      '</svg>' +
      '<div id="threadNeedle" style="position:absolute;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle,#F3DFA8,#A98847);box-shadow:0 0 12px 3px rgba(201,164,90,.8);transform:translate(-50%,-50%);left:0;top:0;opacity:0;transition:opacity .4s ease;"></div>';

    threadPath = document.getElementById("threadDraw");
    needleEl = document.getElementById("threadNeedle");
    threadLen = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = threadLen;
    threadPath.style.strokeDashoffset = threadLen;
  }

  function drawThread() {
    if (!threadPath) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY || 0;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    // map overall page progress onto the on-screen band
    const reveal = Math.min(1, 0.06 + p * 1.02);
    threadPath.style.strokeDashoffset = threadLen * (1 - reveal);
    if (needleEl) {
      const H = window.innerHeight;
      needleEl.style.left = waveX(reveal) + "px";
      needleEl.style.top = (reveal * H) + "px";
      needleEl.style.opacity = p > 0.005 && p < 0.992 ? "1" : "0";
    }
  }

  /* ============================================================
     GOLD PARTICLES — ambient motes + cursor sparkle
     ============================================================ */
  const canvas = document.getElementById("particles");
  let ctx, W, H, motes = [], sparks = [], running = true;
  function sizeCanvas() {
    if (!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function initMotes() {
    motes = [];
    // Particle count reduced (was 46 cap, ~34 px/mote) — the rich count
    // melted low-end CPUs because the canvas was redrawn every RAF.
    // Halving the count is invisible to the eye but doubles the budget.
    const n = Math.min(22, Math.round(window.innerWidth / 70));
    for (let i = 0; i < n; i++) {
      motes.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -(Math.random() * 0.22 + 0.05),
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  function addSpark(x, y) {
    if (sparks.length > 90) return;
    for (let i = 0; i < 2; i++) {
      sparks.push({
        x, y, r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4 - 0.3,
        life: 1
      });
    }
  }
  let lastSpark = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastSpark > 34) { addSpark(e.clientX, e.clientY); lastSpark = now; }
  });

  // Pause the canvas when the tab is hidden — saves CPU/battery while
  // the user is on another tab.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) running = false;
    else if (ctx) { running = true; requestAnimationFrame(renderParticles); }
  });

  function renderParticles() {
    if (!ctx || !running) return;
    ctx.clearRect(0, 0, W, H);
    // motes
    for (const m of motes) {
      m.x += m.vx; m.y += m.vy; m.tw += 0.03;
      if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
      if (m.x < -5) m.x = W + 5; if (m.x > W + 5) m.x = -5;
      const tw = (Math.sin(m.tw) * 0.4 + 0.6);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,164,90," + (m.a * tw).toFixed(3) + ")";
      ctx.fill();
    }
    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.012; s.life -= 0.026;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(243,223,168," + (s.life * 0.85).toFixed(3) + ")";
      ctx.fill();
    }
    requestAnimationFrame(renderParticles);
  }

  /* ---------- master scroll loop ---------- */
  // Golden-thread idle fade: mark active on every scroll tick, drop after
  // ~420ms of scroll inactivity. Longer than a single frame so a fast
  // series of scroll events doesn't flicker on/off; short enough that the
  // thread reads as "part of the scroll gesture." Below 560px CSS hides
  // the track entirely, so this becomes a no-op there.
  let threadIdleTimer = null;
  function markThreadActive() {
    if (!track) return;
    track.classList.add("thread-active");
    if (threadIdleTimer) clearTimeout(threadIdleTimer);
    threadIdleTimer = setTimeout(() => { track.classList.remove("thread-active"); }, 420);
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    markThreadActive();
    requestAnimationFrame(() => { onScrollChrome(); drawThread(); revealInView(); ticking = false; });
  }

  function boot() {
    buildThread();
    onScrollChrome(); drawThread();
    if (canvas && !prefersReduced) {
      ctx = canvas.getContext("2d");
      sizeCanvas(); initMotes(); renderParticles();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      buildThread(); drawThread();
      if (ctx) { sizeCanvas(); initMotes(); }
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // rebuild thread side on language (RTL) change
  window.addEventListener("br:langchange", () => { buildThread(); drawThread(); });
})();

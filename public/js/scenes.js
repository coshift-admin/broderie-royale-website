/* ============================================================
   scenes.js — GSAP ScrollTrigger choreography
   ============================================================ */
(function () {
  "use strict";
  if (typeof gsap === "undefined") { console.warn("GSAP not loaded"); return; }
  gsap.registerPlugin(ScrollTrigger);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero crest stitch-in, then crown placed last ---------- */
  const crestBase = document.getElementById("heroCrestBase");
  const crown = document.getElementById("heroCrown");
  if (crestBase && !reduced) {
    gsap.set(crestBase, { clipPath: "circle(0% at 50% 58%)", scale: 0.92, opacity: 0.2 });
    gsap.to(crestBase, {
      clipPath: "circle(82% at 50% 58%)", scale: 1, opacity: 1,
      duration: 1.7, delay: 2.4, ease: "power2.out"
    });
  }
  if (crown && !reduced) {
    // crown begins above the crest, then settles onto the top — last piece placed
    gsap.set(crown, { y: -80, opacity: 0, scale: 0.84, transformOrigin: "50% 90%" });
    gsap.to(crown, { y: 0, opacity: 1, scale: 1, duration: 0.95, delay: 4.0, ease: "back.out(1.7)" });
  }

  /* ---------- Hero parallax / fade on scroll ---------- */
  if (!reduced) {
    gsap.to(".hero-inner", {
      yPercent: -18, opacity: 0, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.4 }
    });
    gsap.to("#heroBg", {
      scale: 1.18, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.4 }
    });
  }

  /* ---------- Generic parallax media ---------- */
  if (!reduced) {
    document.querySelectorAll("[data-parallax]").forEach(el => {
      const amt = parseFloat(el.getAttribute("data-parallax")) || 0.12;
      const img = el.querySelector("img, .slot, video, image-slot") || el;
      gsap.fromTo(img, { yPercent: -amt * 100 }, {
        yPercent: amt * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 }
      });
    });
  }

  /* ---------- Flag full-bleed parallax ---------- */
  if (!reduced) {
    const flagMedia = document.querySelector("[data-parallax-bg] img");
    if (flagMedia) {
      gsap.fromTo(flagMedia, { yPercent: -10, scale: 1.12 }, {
        yPercent: 10, scale: 1.12, ease: "none",
        scrollTrigger: { trigger: "#flag", start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true }
      });
    }
  }

  /* ---------- METIERS — GSAP-pinned card stack reveal ----------
     The .metiers-stack wrapper is 100vh tall; ScrollTrigger pins it
     and extends the scroll distance to (N - 1) extra viewports of
     scroll. All cards are absolutely-positioned at inset:0 — initial
     state: card 1 visible (yPercent:0), cards 2..N below the viewport
     (yPercent:100). The timeline scrubs each card up to yPercent:0
     in order, while the previous card scales/dims slightly as it gets
     covered. Pin guarantees scroll distance regardless of Lenis or
     ancestor styling that broke the pure-sticky version. */
  const metiersStack = document.getElementById("metiersStack");
  let metierTl = null;
  function buildMetiers() {
    if (!metiersStack) return;
    if (metierTl) {
      if (metierTl.scrollTrigger) metierTl.scrollTrigger.kill();
      metierTl.kill();
      metierTl = null;
    }
    const cards = Array.from(metiersStack.querySelectorAll(".metier-stack-card"));
    if (!cards.length) return;
    // Reduced motion path: no animation, all cards naturally stacked.
    if (reduced) {
      cards.forEach((c) => gsap.set(c, { yPercent: 0, clearProps: "transform" }));
      return;
    }
    // Initial state — only card 1 is in the viewport
    cards.forEach((card, i) => {
      gsap.set(card, { yPercent: i === 0 ? 0 : 100 });
      const inner = card.querySelector(".metier-stack-inner");
      if (inner) gsap.set(inner, { scale: 1, opacity: 1 });
    });
    const steps = cards.length - 1;
    metierTl = gsap.timeline({
      scrollTrigger: {
        trigger: metiersStack,
        start: "top top",
        end: () => "+=" + (steps * window.innerHeight),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    for (let i = 1; i < cards.length; i++) {
      const card = cards[i];
      const prevInner = cards[i - 1].querySelector(".metier-stack-inner");
      const at = i - 1;
      // Card slides up from below to cover the previous
      metierTl.to(card, { yPercent: 0, duration: 1, ease: "power2.inOut" }, at);
      // Previous card sinks slightly while being covered — depth cue
      if (prevInner) {
        metierTl.to(
          prevInner,
          { scale: 0.94, opacity: 0.55, duration: 1, ease: "power2.inOut" },
          at
        );
      }
    }
  }
  // build after images settle so sticky math has real layout numbers
  window.addEventListener("load", () => { buildMetiers(); ScrollTrigger.refresh(); });
  buildMetiers();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { buildMetiers(); ScrollTrigger.refresh(); });
  }

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { buildMetiers(); ScrollTrigger.refresh(); }, 200);
  });

  // language change can alter layout/fonts -> rebuild + refresh (twice, to catch font reflow)
  window.addEventListener("br:langchange", () => {
    setTimeout(() => { buildMetiers(); ScrollTrigger.refresh(); }, 140);
    setTimeout(() => { ScrollTrigger.refresh(); }, 600);
  });
})();

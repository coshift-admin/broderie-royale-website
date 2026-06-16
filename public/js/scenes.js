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

  /* ---------- METIERS — scale/dim outgoing cards as they're covered
     CSS handles the LAYOUT (position:sticky + z-index per card). JS
     adds polish only: each card except the last gets a ScrollTrigger
     that scales it down and dims it as the NEXT card scrolls up over
     it. The trigger is the next card; start/end are linear from when
     the next card enters the viewport to when it reaches the top.
     If GSAP fails to load, CSS sticky still gives the basic stacking
     effect — only the depth cue is lost. */
  const metiersStack = document.getElementById("metiersStack");
  const metierTriggers = [];
  function buildMetiers() {
    if (!metiersStack) return;
    metierTriggers.forEach((t) => t.kill());
    metierTriggers.length = 0;
    const cards = Array.from(metiersStack.querySelectorAll(".metier-stack-card"));
    if (!cards.length || reduced) return;
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      const inner = card.querySelector(".metier-stack-inner");
      if (!inner) return;
      const next = cards[i + 1];
      const st = ScrollTrigger.create({
        trigger: next,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          inner.style.transform = "scale(" + (1 - p * 0.06).toFixed(4) + ")";
          inner.style.opacity = (1 - p * 0.45).toFixed(3);
        },
      });
      metierTriggers.push(st);
    });
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

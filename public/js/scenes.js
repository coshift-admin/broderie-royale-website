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

  /* ---------- METIERS — sticky card stack reveal ----------
     Each .metier-stack-card is position:sticky/top:0/height:100vh in
     CSS, so they naturally stack as the visitor scrolls. The CSS does
     the heavy lifting; we just add a per-card scale-down + dim that
     tracks the next card's approach, giving the outgoing card a sense
     of being covered. Cheap because each ScrollTrigger is scrubbed on
     its own next-card element — no global rAF, GSAP throttles for us. */
  const metiersStack = document.getElementById("metiersStack");
  const metierTriggers = [];
  function buildMetiers() {
    if (!metiersStack) return;
    // Tear down any previous build (Arabic font load, SPA nav, resize)
    metierTriggers.forEach(t => t.kill());
    metierTriggers.length = 0;
    const cards = Array.from(metiersStack.querySelectorAll(".metier-stack-card"));
    if (!cards.length || reduced) return;
    cards.forEach((card, i) => {
      const inner = card.querySelector(".metier-stack-inner");
      if (!inner) return;
      // Last card has nothing covering it — leave it untouched.
      if (i === cards.length - 1) return;
      const next = cards[i + 1];
      const st = ScrollTrigger.create({
        trigger: next,
        start: "top bottom",   // next card's top crosses viewport bottom
        end: "top top",        // next card's top reaches viewport top
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // self.progress 0 -> next card just entering; 1 -> next pinned
          const p = self.progress;
          inner.style.transform = "scale(" + (1 - p * 0.06).toFixed(4) + ")";
          inner.style.opacity = (1 - p * 0.35).toFixed(3);
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

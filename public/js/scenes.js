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

  /* ---------- METIERS — horizontal pinned scroll ---------- */
  const pin = document.getElementById("metiers-pin");
  const trackEl = document.getElementById("metiersTrack");
  let metierST = null;
  function buildMetiers() {
    if (!pin || !trackEl) return;
    const head = pin.querySelector(".metiers-head");
    if (metierST) { metierST.kill(); metierST = null; gsap.set(trackEl, { x: 0 }); }
    if (head) head.style.opacity = 1;
    const distance = trackEl.scrollWidth - window.innerWidth;
    if (distance <= 0) return;
    const rtl = document.documentElement.dir === "rtl";
    const target = rtl ? distance : -distance;
    // Cards complete their travel at MOVE of the pinned scroll; the remaining
    // tail is a "settle" zone where they sit still before the pin releases —
    // this removes the jump when handing off to the flag section.
    const MOVE = 0.85;
    metierST = ScrollTrigger.create({
      trigger: pin, start: "top top",
      end: () => "+=" + Math.round(distance / MOVE),
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => {
        const t = self.progress < MOVE ? self.progress / MOVE : 1;
        gsap.set(trackEl, { x: Math.round(target * t) });
        if (head) head.style.opacity = self.progress < 0.05 ? (1 - self.progress / 0.05) : 0;
      }
    });
  }
  // build after images settle
  window.addEventListener("load", () => { buildMetiers(); ScrollTrigger.refresh(); });
  buildMetiers();
  // rebuild once webfonts are ready (Arabic Mashq/Amiri reflow shifts pin math)
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

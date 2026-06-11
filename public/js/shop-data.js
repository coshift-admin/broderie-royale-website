/* ============================================================
   shop-data.js — async loader. Replaces the old hardcoded
   PRODUCTS/CATEGORIES/WILAYAS arrays with live data from
   coshift_ecomm_api (+ coshift_ecomm_cms). Keeps the same global
   names so the rest of shop.js (cart, render functions) can use
   them unchanged.

   Boot model: every page that needs product data awaits
   `window.BR_DATA_READY` (a Promise). The promise resolves once
   the first products + categories fetch completes. Wilayas are
   loaded lazily on the checkout page only.

   data-astro-rerun: on ClientRouter navigation this script re-
   executes. We use a single-flight pattern (BR_DATA_LOADING) so
   we don't fire 4 parallel fetches when bouncing between pages.
   ============================================================ */

// Re-declared as `var` so re-execution under data-astro-rerun is a
// no-op redeclaration (not a TDZ crash like `const` would be).
var CATEGORIES = window.CATEGORIES || [];
var PRODUCTS = window.PRODUCTS || [];
var WILAYAS = window.WILAYAS || [];
var DELIVERY_FEE = 0; // computed live from wilaya/pickup at checkout

// Currency formatting kept here because the rest of shop.js calls these.
function curUnit(lang) { return lang === "ar" ? "دج" : "DA"; }
function formatPrice(n, lang) {
  lang = lang || document.documentElement.getAttribute("lang") || "fr";
  var s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return s + " " + curUnit(lang);
}
function getProduct(id) {
  // IDs may arrive as strings from URL params or localStorage.
  var n = typeof id === "number" ? id : parseInt(id, 10);
  return PRODUCTS.find(function (p) { return p.id === n; });
}

(function () {
  "use strict";

  // Adapt the API product shape to what shop.js expects (FR/AR/EN nested
  // objects, options array, etc.). For v1 the API returns one language at
  // a time, so we wrap each translatable field in a {fr,ar,en} object
  // keyed by the lang at fetch time.
  function adaptProduct(p, lang) {
    var name = { fr: p.name, ar: p.name, en: p.name };
    var desc = { fr: p.short_description || p.description || "", ar: p.short_description || p.description || "", en: p.short_description || p.description || "" };
    if (lang && lang !== "fr") {
      name[lang] = p.name;
      desc[lang] = p.short_description || p.description || "";
    }
    return {
      id: p.id,
      cat: p.category_name || "",
      cat_id: p.category_id,
      price: p.price,
      img: p.image_url,
      in_stock: p.in_stock,
      name: name,
      desc: desc,
      options: [],
    };
  }

  function adaptCategory(c) {
    return { id: c.id, name: c.name, nameKey: null };
  }

  async function loadCore() {
    var lang = document.documentElement.getAttribute("lang") || "fr";
    try {
      var [catRes, prodRes] = await Promise.all([
        window.BR_API.getCategories({ lang: lang }),
        window.BR_API.getProducts({ lang: lang, limit: 500 }),
      ]);
      CATEGORIES = (catRes.categories || []).map(adaptCategory);
      PRODUCTS = (prodRes.products || []).map(function (p) { return adaptProduct(p, lang); });
      window.CATEGORIES = CATEGORIES;
      window.PRODUCTS = PRODUCTS;
      window.dispatchEvent(new CustomEvent("br:data-loaded"));
      return true;
    } catch (err) {
      console.error("[BR] Failed to load products from Odoo:", err);
      window.dispatchEvent(new CustomEvent("br:data-error", { detail: err }));
      return false;
    }
  }

  // Single-flight. If a load is in progress, await it; if it already
  // completed in this session, resolve immediately.
  if (!window.BR_DATA_READY) {
    window.BR_DATA_READY = loadCore();
  }

  // Re-fetch on language change so product names switch language.
  if (!window.__brShopDataLangBound) {
    window.__brShopDataLangBound = true;
    window.addEventListener("br:langchange", function () {
      window.BR_DATA_READY = loadCore().then(function (ok) {
        if (ok) window.dispatchEvent(new CustomEvent("br:data-relang"));
      });
    });
  }

  // Lazy wilaya loader — called by shop.js's renderCommande.
  window.BR_loadWilayas = async function () {
    if (WILAYAS.length) return WILAYAS;
    var lang = document.documentElement.getAttribute("lang") || "fr";
    var res = await window.BR_API.getWilayas({ lang: lang });
    WILAYAS = (res.wilayas || []);
    window.WILAYAS = WILAYAS;
    return WILAYAS;
  };
})();

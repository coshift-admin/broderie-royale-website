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
  // Boutique products are grouped by template — cards, URLs, the cart and
  // getProduct ALL use the template id, so a plain id match is unambiguous.
  return PRODUCTS.find(function (p) { return p.id === n; });
}

(function () {
  "use strict";

  // Adapt the API product shape to what shop.js expects (FR/AR/EN nested
  // objects, options array, etc.). For v1 the API returns one language at
  // a time, so we wrap each translatable field in a {fr,ar,en} object
  // keyed by the lang at fetch time.
  // Wrap a translatable string in the {fr,ar,en} shell shop.js expects.
  function i18nShell(value, lang) {
    var o = { fr: value, ar: value, en: value };
    if (lang && lang !== "fr") o[lang] = value;
    return o;
  }

  // The API returns one row per VARIANT (product.product): "DRAPEAU PAYS"
  // comes back ~197 times (one per country), all sharing the same template
  // id, name and image. The storefront shows ONE card per PRODUCT
  // (product.template), so we collapse variants by tmpl_id here.
  //
  //   id       -> product.template id — used EVERYWHERE (cards, URLs, cart,
  //               getProduct). Unambiguous because we never mix variant ids in.
  //   order_id -> a real product.product id; checkout sends THIS as the order
  //               line (Odoo order lines need a variant, never a template).
  // The representative (order_id + its price) prefers an in-stock variant so
  // the price shown matches the variant we actually order.
  function groupByTemplate(apiProducts, lang) {
    var groups = new Map();
    (apiProducts || []).forEach(function (p) {
      // Fall back to the variant id if the API ever omits tmpl_id.
      var key = (p.tmpl_id != null) ? p.tmpl_id : p.id;
      var g = groups.get(key);
      if (!g) {
        groups.set(key, {
          id: key,
          order_id: p.id,
          cat: p.category_name || "",
          cat_id: p.category_id,
          price: p.price,
          img: p.image_url,
          in_stock: !!p.in_stock,
          _name: p.name,
          _desc: p.short_description || p.description || "",
        });
      } else if (p.in_stock && !g.in_stock) {
        // Upgrade the representative to an in-stock variant when we find one.
        g.in_stock = true;
        g.order_id = p.id;
        g.price = p.price;
      }
    });
    var out = [];
    groups.forEach(function (g) {
      out.push({
        id: g.id,
        order_id: g.order_id,
        cat: g.cat,
        cat_id: g.cat_id,
        price: g.price,
        img: g.img,
        in_stock: g.in_stock,
        name: i18nShell(g._name, lang),
        desc: i18nShell(g._desc, lang),
        options: [],
      });
    });
    return out;
  }

  function adaptCategory(c) {
    /* parent_id lets the boutique build a category TREE instead of a
       flat chip list. complete_name keeps the full breadcrumb (e.g.
       "Drapeaux / National") when we want to show it. product_count
       is the descendant-recursive count from the API so chips can
       display the right number even at branch nodes. */
    return {
      id: c.id,
      name: c.name,
      complete_name: c.complete_name || c.name,
      parent_id: c.parent_id || null,
      product_count: c.product_count || 0,
      nameKey: null,
    };
  }

  async function loadCore() {
    var lang = document.documentElement.getAttribute("lang") || "fr";
    // Skip re-fetch if we already have data for this language. Without
    // this guard, every br:langchange dispatch (including no-op ones at
    // boot when localStorage agrees with the SSG default) re-fetches
    // products + categories.
    if (window.__brDataLoadedLang === lang) return true;
    try {
      var [catRes, prodRes] = await Promise.all([
        window.BR_API.getCategories({ lang: lang }),
        window.BR_API.getProducts({ lang: lang, limit: 5000 }),
      ]);
      CATEGORIES = (catRes.categories || []).map(adaptCategory);
      PRODUCTS = groupByTemplate(prodRes.products || [], lang);
      window.CATEGORIES = CATEGORIES;
      window.PRODUCTS = PRODUCTS;
      window.__brDataLoadedLang = lang;
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

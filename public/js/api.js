/* ============================================================
   api.js — thin REST client for coshift_ecomm_api + coshift_ecomm_cms.
   All functions return parsed JSON or throw. The caller decides how to
   surface errors (the storefront generally renders a friendly message
   and keeps the rest of the page interactive).
   ============================================================ */
(function () {
  "use strict";

  function cfg() { return window.BR_CONFIG || { apiBase: "", apiKey: "" }; }

  // Storefront lang code (fr/ar/en). Falls back to "fr".
  function clientLang() {
    var l = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
    return (l === "ar" || l === "en") ? l : "fr";
  }

  function buildUrl(path, params) {
    var u = cfg().apiBase + path;
    var q = [];
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    });
    if (q.length) u += (u.indexOf("?") >= 0 ? "&" : "?") + q.join("&");
    return u;
  }

  async function rawFetchUncached(path, params, init) {
    var res = await fetch(buildUrl(path, params), Object.assign({
      headers: { "X-API-Key": cfg().apiKey, "Accept": "application/json" },
    }, init || {}));
    var text = await res.text();
    var data = text ? JSON.parse(text) : {};
    if (!res.ok || data.ok === false) {
      var msg = (data && data.error) || ("HTTP " + res.status);
      var err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // GET-side cache: dedupes concurrent callers (one fetch when 3 page
  // sections all ask for /products on load) and serves repeat reads
  // from memory for a short TTL. POSTs bypass via rawFetchUncached.
  var _inFlight = new Map();
  var _results = new Map();
  var GET_TTL_MS = 5 * 60 * 1000;

  async function rawFetch(path, params, init) {
    var method = (init && init.method ? init.method : "GET").toUpperCase();
    if (method !== "GET") return rawFetchUncached(path, params, init);
    var key = buildUrl(path, params);
    var cached = _results.get(key);
    if (cached && cached.expires > Date.now()) return cached.data;
    var inflight = _inFlight.get(key);
    if (inflight) return inflight;
    var p = rawFetchUncached(path, params, init).then(function (data) {
      _results.set(key, { data: data, expires: Date.now() + GET_TTL_MS });
      _inFlight.delete(key);
      return data;
    }, function (err) {
      _inFlight.delete(key);
      throw err;
    });
    _inFlight.set(key, p);
    return p;
  }

  // Invalidate the GET cache after a write (e.g. order POST may change
  // stock) or on demand. Cheap belt-and-braces — most callers won't need it.
  function invalidateCache() { _results.clear(); }

  window.BR_API = {
    // --- products / categories ---
    getProducts: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/products", {
        lang: opts.lang || clientLang(),
        category: opts.category,
        search: opts.search,
        limit: opts.limit,
        offset: opts.offset,
      });
    },
    getProduct: function (id, opts) {
      opts = opts || {};
      return rawFetch("/api/v1/products/" + encodeURIComponent(id), {
        lang: opts.lang || clientLang(),
      });
    },
    getCategories: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/categories", { lang: opts.lang || clientLang() });
    },

    // --- CMS: delivery + content ---
    getWilayas: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/wilayas", {
        lang: opts.lang || clientLang(),
        home_only: opts.homeOnly ? 1 : undefined,
      });
    },
    getPickupPoints: function (wilayaId, opts) {
      opts = opts || {};
      return rawFetch("/api/v1/pickup-points", {
        lang: opts.lang || clientLang(),
        wilaya_id: wilayaId,
      });
    },
    getPartners: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/partners", {
        lang: opts.lang || clientLang(),
      });
    },
    getTestimonials: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/testimonials", {
        lang: opts.lang || clientLang(),
        featured: opts.featured ? 1 : undefined,
        limit: opts.limit,
      });
    },
    getTeam: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/team", { lang: opts.lang || clientLang() });
    },
    getFaq: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/faq", { lang: opts.lang || clientLang() });
    },
    getReferences: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/references", { lang: opts.lang || clientLang() });
    },
    getGallery: function (opts) {
      opts = opts || {};
      return rawFetch("/api/v1/website/gallery", {
        lang: opts.lang || clientLang(),
        category: opts.category,
        limit: opts.limit,
      });
    },

    // --- orders ---
    createOrder: function (body) {
      return rawFetch("/api/v1/orders", null, {
        method: "POST",
        headers: {
          "X-API-Key": cfg().apiKey,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    },

    /**
     * Multipart POST for orders or leads. `payload` becomes the JSON
     * "data" form field; `files` (Array of File objects) become "files"
     * form fields. Letting the browser pick the Content-Type means it
     * generates the multipart boundary correctly.
     */
    createOrderWithFiles: function (payload, files) {
      var fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      (files || []).forEach(function (f) { fd.append("files", f, f.name); });
      return rawFetch("/api/v1/orders", null, {
        method: "POST",
        headers: { "X-API-Key": cfg().apiKey, "Accept": "application/json" },
        body: fd,
      });
    },

    // --- leads (contact + devis) ---
    submitLead: function (payload, files) {
      var fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      (files || []).forEach(function (f) { fd.append("files", f, f.name); });
      return rawFetch("/api/v1/website/leads", null, {
        method: "POST",
        headers: { "X-API-Key": cfg().apiKey, "Accept": "application/json" },
        body: fd,
      });
    },

    invalidateCache: invalidateCache,
  };
})();

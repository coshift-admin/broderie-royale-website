/* ============================================================
   shop.js — cart engine + page renderers (cash on delivery)
   Shares global I18N, PRODUCTS, CATEGORIES from sibling scripts.
   ============================================================ */
(function () {
  "use strict";
  const CART_KEY = "br_cart", ORDER_KEY = "br_last_order";
  const lang = () => document.documentElement.getAttribute("lang") || "fr";
  const t = (k) => { const e = (window.I18N || {})[k]; return e ? (e[lang()] || e.fr) : k; };
  const pname = (p) => p.name[lang()] || p.name.fr;
  const pdesc = (p) => p.desc[lang()] || p.desc.fr;
  const catName = (cid) => { const c = CATEGORIES.find(x => x.id === cid); return c ? t(c.nameKey) : cid; };

  /* ---------- cart store ---------- */
  function readCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
  function writeCart(c){ try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch(e){} renderBadge(); }
  function optsKey(o){ return o ? JSON.stringify(o) : ""; }
  function addToCart(id, qty, opts){
    const cart = readCart();
    const ex = cart.find(i => i.id === id && optsKey(i.opts) === optsKey(opts));
    if (ex) ex.qty += qty; else cart.push({ id, qty, opts: opts || null });
    writeCart(cart);
  }
  function setQty(idx, qty){ const c = readCart(); if (!c[idx]) return; c[idx].qty = Math.max(1, qty); writeCart(c); }
  function removeAt(idx){ const c = readCart(); c.splice(idx, 1); writeCart(c); }
  function cartCount(){ return readCart().reduce((s, i) => s + i.qty, 0); }
  function subtotal(){ return readCart().reduce((s, i) => { const p = getProduct(i.id); return s + (p ? p.price * i.qty : 0); }, 0); }

  function renderBadge(){
    const n = cartCount();
    document.querySelectorAll(".cart-count").forEach(el => {
      el.textContent = n;
      el.classList.toggle("has", n > 0);
    });
  }

  /* ---------- helpers ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function qs(name){ return new URLSearchParams(location.search).get(name); }
  // XSS-safe interpolation for innerHTML. Wrap EVERY product/order/i18n string
  // before string-concatenating it into an innerHTML template. Critical when
  // wiring to Odoo: admin-supplied product names/descriptions become attacker
  // payloads otherwise (see GHSA-… style HTML injection in e-commerce demos).
  function esc(s){
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  /* ============================================================
     BOUTIQUE
     ============================================================ */
  function renderBoutique(){
    const grid = document.getElementById("productGrid");
    const filters = document.getElementById("catFilters");
    if (!grid) return;
    let active = qs("cat") || "all";

    // filters
    filters.innerHTML = "";
    const mk = (id, label) => {
      const b = el("button", "filter-chip" + (active === id ? " active" : ""), label);
      b.addEventListener("click", () => { active = id; draw(); filters.querySelectorAll(".filter-chip").forEach(x => x.classList.remove("active")); b.classList.add("active"); });
      return b;
    };
    filters.appendChild(mk("all", t("bo.all")));
    // Categories come from /api/v1/categories now — name is already in the
    // user's current language (the API was called with ?lang=).
    CATEGORIES.forEach(c => filters.appendChild(mk(c.id, c.name)));

    function draw(){
      // active can be: "all", a number (category_id from chip click), or a
      // string slug (from URL like /boutique?cat=drapeaux on index page).
      // Match either category_id or case-insensitive name.
      const aLower = String(active || "").toLowerCase();
      const list = active === "all" ? PRODUCTS : PRODUCTS.filter(p =>
        p.cat_id === active || String(p.cat || "").toLowerCase() === aLower
      );
      grid.innerHTML = "";
      if (!list.length){ grid.appendChild(el("p", "shop-empty", t("bo.empty"))); return; }
      list.forEach(p => {
        const card = el("article", "product-card");
        card.innerHTML =
          '<a class="pc-media" href="/produit?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.img) + '" alt="" loading="lazy" /></a>' +
          '<div class="pc-body">' +
            '<span class="pc-cat">' + esc(catName(p.cat)) + '</span>' +
            '<a class="pc-name" href="/produit?id=' + encodeURIComponent(p.id) + '">' + esc(pname(p)) + '</a>' +
            '<div class="pc-foot">' +
              '<span class="pc-price">' + esc(formatPrice(p.price)) + '</span>' +
              '<button class="pc-add" data-id="' + esc(p.id) + '">' + esc(t("shop.add")) + '</button>' +
            '</div>' +
          '</div>';
        card.querySelector(".pc-add").addEventListener("click", (e) => {
          e.preventDefault();
          addToCart(p.id, 1, null);
          const b = e.currentTarget; b.textContent = t("shop.added"); b.classList.add("added");
          bumpBadge();
          setTimeout(() => { b.textContent = t("shop.add"); b.classList.remove("added"); }, 1400);
        });
        grid.appendChild(card);
      });
    }
    draw();
  }

  function bumpBadge(){
    document.querySelectorAll(".cart-icon").forEach(c => { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
  }

  /* ============================================================
     PRODUIT
     ============================================================ */
  function renderProduit(){
    const root = document.getElementById("productDetail");
    if (!root) return;
    const p = getProduct(qs("id"));
    if (!p){ root.innerHTML = '<p class="shop-empty">' + esc(t("pd.notfound")) + '</p>'; return; }
    document.title = p.name.fr + " — Broderie Royale";

    let optionsHtml = "";
    if (p.options){
      optionsHtml = '<div class="pd-options">' + p.options.map(o =>
        '<label class="pd-optrow"><span>' + esc(o.labels[lang()] || o.labels.fr) + '</span>' +
        '<select data-optkey="' + esc(o.key) + '">' + o.values.map(v => '<option>' + esc(v) + '</option>').join("") + '</select></label>'
      ).join("") + '</div>';
    }

    root.innerHTML =
      '<a class="pd-back" href="/boutique">' + esc(t("pd.back")) + '</a>' +
      '<div class="pd-grid">' +
        '<div class="pd-media"><img src="' + esc(p.img) + '" alt="" /></div>' +
        '<div class="pd-info">' +
          '<span class="pc-cat">' + esc(catName(p.cat)) + '</span>' +
          '<h1 class="pd-name">' + esc(pname(p)) + '</h1>' +
          '<div class="pd-price">' + esc(formatPrice(p.price)) + '</div>' +
          '<p class="pd-desc">' + esc(pdesc(p)) + '</p>' +
          optionsHtml +
          '<div class="pd-buyrow">' +
            '<div class="qty-stepper"><button data-q="-1">−</button><input id="pdQty" value="1" inputmode="numeric" /><button data-q="1">+</button></div>' +
            '<button class="btn-royal pd-add"><span>' + esc(t("pd.addcart")) + '</span><span class="ar"></span></button>' +
          '</div>' +
          '<div class="pd-cod"><div class="pd-cod-ic">⛟</div><div><strong>' + esc(t("pd.delivery")) + '</strong><span>' + esc(t("pd.deliverysub")) + '</span></div></div>' +
          '<div class="pd-ref">' + esc(t("pd.ref")) + ' · BR-' + esc(String(p.id).toUpperCase()) + '</div>' +
        '</div>' +
      '</div>';

    const qtyInput = root.querySelector("#pdQty");
    root.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
      let v = parseInt(qtyInput.value, 10) || 1; v += parseInt(b.dataset.q, 10); qtyInput.value = Math.max(1, v);
    }));
    qtyInput.addEventListener("input", () => { qtyInput.value = qtyInput.value.replace(/[^0-9]/g, ""); });

    root.querySelector(".pd-add").addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      let opts = null;
      const sels = root.querySelectorAll("[data-optkey]");
      if (sels.length){ opts = {}; sels.forEach(s => opts[s.dataset.optkey] = s.value); }
      addToCart(p.id, qty, opts);
      bumpBadge();
      const btn = root.querySelector(".pd-add span"); const old = btn.textContent;
      btn.textContent = t("shop.added"); setTimeout(() => btn.textContent = old, 1400);
    });

    // related
    const rel = document.getElementById("relatedGrid");
    if (rel){
      const others = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
      const pool = others.length ? others : PRODUCTS.filter(x => x.id !== p.id).slice(0, 3);
      rel.innerHTML = pool.map(x =>
        '<a class="rel-card" href="/produit?id=' + encodeURIComponent(x.id) + '"><img src="' + esc(x.img) + '" alt="" loading="lazy" />' +
        '<span class="rel-name">' + esc(pname(x)) + '</span><span class="rel-price">' + esc(formatPrice(x.price)) + '</span></a>'
      ).join("");
      const relHead = document.getElementById("relatedHead");
      if (relHead) relHead.textContent = t("pd.related");
    }
  }

  /* ============================================================
     PANIER
     ============================================================ */
  function renderPanier(){
    const wrap = document.getElementById("cartWrap");
    if (!wrap) return;
    const cart = readCart();
    if (!cart.length){
      wrap.innerHTML = '<div class="cart-empty"><p>' + esc(t("pa.empty")) + '</p><a class="btn-royal" href="/boutique"><span>' + esc(t("pa.continue")) + '</span><span class="ar"></span></a></div>';
      return;
    }
    const optsStr = (o) => o ? " · " + Object.values(o).map(esc).join(" · ") : "";
    let rows = cart.map((it, i) => {
      const p = getProduct(it.id); if (!p) return "";
      return '<div class="cart-row">' +
        '<a class="cr-media" href="/produit?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.img) + '" alt="" /></a>' +
        '<div class="cr-info"><span class="pc-cat">' + esc(catName(p.cat)) + '</span>' +
          '<a class="cr-name" href="/produit?id=' + encodeURIComponent(p.id) + '">' + esc(pname(p)) + '</a>' +
          '<span class="cr-opts">' + optsStr(it.opts).replace(/^ · /, "") + '</span></div>' +
        '<div class="qty-stepper sm" data-idx="' + i + '"><button data-q="-1">−</button><input value="' + esc(it.qty) + '" data-qinput /><button data-q="1">+</button></div>' +
        '<div class="cr-price">' + esc(formatPrice(p.price * it.qty)) + '</div>' +
        '<button class="cr-remove" data-rm="' + i + '" aria-label="remove">×</button>' +
      '</div>';
    }).join("");

    const sub = subtotal();
    wrap.innerHTML =
      '<div class="cart-grid">' +
        '<div class="cart-items">' + rows + '</div>' +
        '<aside class="cart-summary">' +
          '<h3>' + esc(t("pa.summary")) + '</h3>' +
          '<div class="sum-row"><span>' + esc(t("pa.subtotal")) + '</span><span>' + esc(formatPrice(sub)) + '</span></div>' +
          '<div class="sum-row"><span>' + esc(t("pa.delivery")) + '</span><span>' + esc(formatPrice(DELIVERY_FEE)) + '</span></div>' +
          '<div class="sum-row total"><span>' + esc(t("pa.total")) + '</span><span>' + esc(formatPrice(sub + DELIVERY_FEE)) + '</span></div>' +
          '<a class="btn-royal full" href="/commande"><span>' + esc(t("pa.checkout")) + '</span><span class="ar"></span></a>' +
          '<div class="cod-note">⛟ ' + esc(t("pa.payinfo")) + '</div>' +
          '<a class="cart-cont" href="/boutique">' + esc(t("pa.continue")) + '</a>' +
        '</aside>' +
      '</div>';

    wrap.querySelectorAll(".qty-stepper").forEach(st => {
      const idx = parseInt(st.dataset.idx, 10);
      const input = st.querySelector("[data-qinput]");
      st.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
        let v = (parseInt(input.value, 10) || 1) + parseInt(b.dataset.q, 10);
        setQty(idx, Math.max(1, v)); renderPanier();
      }));
    });
    wrap.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => { removeAt(parseInt(b.dataset.rm, 10)); renderPanier(); }));
  }

  /* ============================================================
     COMMANDE (checkout) — live wiring to Odoo
     ============================================================ */
  async function renderCommande(){
    const sumEl = document.getElementById("orderSummary");
    if (!sumEl) return;
    const cart = readCart();
    if (!cart.length){ location.href = "/boutique"; return; }

    // --- 1) populate wilaya dropdown from /api/v1/wilayas ----------
    const wilSel = document.getElementById("fWilaya");
    let wilayas = [];
    try { wilayas = await window.BR_loadWilayas(); }
    catch (err) {
      sumEl.innerHTML = '<div class="cart-empty"><p>' + esc(t("co.required") || "Impossible de charger les wilayas.") + '</p></div>';
      console.error("[BR] wilayas load failed", err);
      return;
    }
    if (wilSel && !wilSel.dataset.filled){
      wilSel.innerHTML =
        '<option value="">' + esc(t("co.wilayaph")) + '</option>' +
        wilayas.map(w => '<option value="' + esc(w.id) + '" data-home="' + (w.home_delivery_active ? 1 : 0) + '" data-price="' + esc(w.home_delivery_price) + '" data-pickup="' + (w.has_pickup_points ? 1 : 0) + '">' + esc(w.name) + '</option>').join("");
      wilSel.dataset.filled = "1";
    }

    // --- 2) delivery state (default home) --------------------------
    let deliveryState = { type: "home", wilayaId: null, pickupPointId: null, price: 0, pickupPoints: [] };

    function selectedWilaya() {
      return wilayas.find(w => w.id === deliveryState.wilayaId);
    }

    function renderSummary() {
      const sub = subtotal();
      const fee = deliveryState.price || 0;
      sumEl.innerHTML =
        cart.map(it => { const p = getProduct(it.id); if (!p) return "";
          const optsText = it.opts ? " · " + Object.values(it.opts).map(esc).join(" · ") : "";
          return '<div class="os-row"><img src="' + esc(p.img) + '" alt="" /><div class="os-meta"><span>' + esc(pname(p)) + '</span><small>' + esc(t("co.qty")) + ' ' + esc(it.qty) + optsText + '</small></div><span class="os-price">' + esc(formatPrice(p.price * it.qty)) + '</span></div>';
        }).join("") +
        '<div class="sum-row"><span>' + esc(t("pa.subtotal")) + '</span><span>' + esc(formatPrice(sub)) + '</span></div>' +
        '<div class="sum-row"><span>' + esc(t("pa.delivery")) + '</span><span>' + esc(formatPrice(fee)) + '</span></div>' +
        '<div class="sum-row total"><span>' + esc(t("pa.total")) + '</span><span>' + esc(formatPrice(sub + fee)) + '</span></div>';
    }
    renderSummary();

    // --- 3) delivery-type tabs (Home / Pickup) ---------------------
    const tabsWrap = document.getElementById("deliveryTabs");
    const pickupBlock = document.getElementById("pickupBlock");
    const homeAddrBlock = document.getElementById("homeAddrBlock");
    const ppSel = document.getElementById("fPickupPoint");

    function setDeliveryType(type) {
      deliveryState.type = type;
      deliveryState.pickupPointId = null;
      deliveryState.price = 0;
      if (tabsWrap) {
        tabsWrap.querySelectorAll(".delivery-tab").forEach(b => b.classList.toggle("active", b.dataset.type === type));
      }
      if (pickupBlock) pickupBlock.style.display = (type === "pickup") ? "" : "none";
      if (homeAddrBlock) homeAddrBlock.style.display = (type === "home") ? "" : "none";
      // Refresh the wilaya filter (home_only=1 hides wilayas where home delivery is disabled).
      updateWilayaPriceFromSelection();
      renderSummary();
    }

    function updateWilayaPriceFromSelection() {
      const w = selectedWilaya();
      if (!w) { deliveryState.price = 0; return; }
      if (deliveryState.type === "home") {
        deliveryState.price = w.home_delivery_active ? (w.home_delivery_price || 0) : 0;
      } else {
        const pp = deliveryState.pickupPoints.find(p => p.id === deliveryState.pickupPointId);
        deliveryState.price = pp ? (pp.pickup_price || 0) : 0;
      }
    }

    if (tabsWrap && !tabsWrap.dataset.bound) {
      tabsWrap.dataset.bound = "1";
      tabsWrap.addEventListener("click", (e) => {
        const b = e.target.closest(".delivery-tab"); if (!b) return;
        setDeliveryType(b.dataset.type);
      });
    }
    setDeliveryType("home");

    // --- 4) wilaya change → reload pickup points + update price ----
    if (wilSel && !wilSel.dataset.changeBound) {
      wilSel.dataset.changeBound = "1";
      wilSel.addEventListener("change", async () => {
        const id = parseInt(wilSel.value, 10) || null;
        deliveryState.wilayaId = id;
        deliveryState.pickupPointId = null;
        if (ppSel) ppSel.innerHTML = '<option value="">—</option>';
        deliveryState.pickupPoints = [];
        if (id) {
          try {
            const res = await window.BR_API.getPickupPoints(id);
            deliveryState.pickupPoints = res.pickup_points || [];
            if (ppSel) {
              ppSel.innerHTML =
                '<option value="">' + esc(t("co.pickup_ph") || "Choisissez un point relais") + '</option>' +
                deliveryState.pickupPoints.map(p =>
                  '<option value="' + esc(p.id) + '" data-price="' + esc(p.pickup_price) + '">' + esc(p.name) + ' — ' + esc(formatPrice(p.pickup_price)) + '</option>'
                ).join("");
            }
          } catch (err) { console.error("[BR] pickup points load failed", err); }
        }
        updateWilayaPriceFromSelection();
        renderSummary();
      });
    }
    if (ppSel && !ppSel.dataset.changeBound) {
      ppSel.dataset.changeBound = "1";
      ppSel.addEventListener("change", () => {
        deliveryState.pickupPointId = parseInt(ppSel.value, 10) || null;
        updateWilayaPriceFromSelection();
        renderSummary();
      });
    }

    // --- 4b) file-upload picker (logos, layouts) -------------------
    // Only mark `bound` AFTER a successful attach, so if BR_FilePicker
    // happens not to be loaded yet (race) we re-try on the next render.
    const pickerEl = document.getElementById("commandeFilePicker");
    let filePicker = null;
    if (pickerEl) {
      if (pickerEl.__brPicker) {
        filePicker = pickerEl.__brPicker;
      } else if (window.BR_FilePicker) {
        filePicker = window.BR_FilePicker.attach({ root: pickerEl });
        pickerEl.__brPicker = filePicker;
      } else {
        console.warn("[BR] BR_FilePicker not loaded yet — picker skipped");
      }
    }

    // --- 5) submit → POST /api/v1/orders ---------------------------
    const form = document.getElementById("checkoutForm");
    if (form && !form.dataset.bound){
      form.dataset.bound = "1";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errEl = document.getElementById("formError");
        const name = form.fName.value.trim();
        const phone = form.fPhone.value.trim();
        const address = form.fAddress.value.trim();
        const wilayaId = parseInt(wilSel ? wilSel.value : "", 10) || null;
        // Validation
        const missing = [];
        if (!name) missing.push(form.fName);
        if (!phone) missing.push(form.fPhone);
        if (!wilayaId) missing.push(form.fWilaya);
        if (deliveryState.type === "home" && !address) missing.push(form.fAddress);
        if (deliveryState.type === "pickup" && !deliveryState.pickupPointId) {
          if (ppSel) missing.push(ppSel);
        }
        form.querySelectorAll(".invalid").forEach(f => f.classList.remove("invalid"));
        missing.forEach(f => f.classList.add("invalid"));
        if (missing.length) {
          errEl.textContent = t("co.required");
          errEl.classList.add("show");
          return;
        }
        errEl.classList.remove("show");

        const payload = {
          customer: {
            name: name,
            phone: phone,
            address: address,
            wilaya: (selectedWilaya() || {}).name || "",
            // notes deliberately not sent — Odoo's sale.order note already
            // carries the structured delivery info from the controller.
          },
          payment_method: "cod",
          delivery: {
            type: deliveryState.type,
            wilaya_id: wilayaId,
            pickup_point_id: deliveryState.pickupPointId || undefined,
          },
          items: readCart().map(it => ({ product_id: parseInt(it.id, 10), quantity: it.qty })),
        };

        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        try {
          // If the customer attached files, send multipart; otherwise stick
          // to the lighter JSON POST.
          const files = filePicker ? filePicker.files() : [];
          const res = files.length
            ? await window.BR_API.createOrderWithFiles(payload, files)
            : await window.BR_API.createOrder(payload);
          // Save the server-returned ref for the confirmation page.
          const order = {
            ref: res.order_ref,
            order_id: res.order_id,
            subtotal: res.total,
            delivery: res.delivery_price,
            total: res.customer_total,
            currency: res.currency,
            date: Date.now(),
          };
          try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (err) {}
          writeCart([]);
          location.href = "/confirmation";
        } catch (err) {
          console.error("[BR] order POST failed", err);
          errEl.textContent = err.message || t("co.required");
          errEl.classList.add("show");
          if (btn) btn.disabled = false;
        }
      });
      form.querySelectorAll("[required]").forEach(f => f.addEventListener("input", () => f.classList.remove("invalid")));
    }
  }

  /* ============================================================
     CONFIRMATION
     ============================================================ */
  function renderConfirmation(){
    const root = document.getElementById("confirmRoot");
    if (!root) return;
    let order; try { order = JSON.parse(localStorage.getItem(ORDER_KEY)); } catch(e){}
    if (!order){ root.innerHTML = '<p class="shop-empty">' + esc(t("pa.empty")) + '</p>'; return; }
    root.querySelector("#cfRef") && (root.querySelector("#cfRef").textContent = order.ref);
    root.querySelector("#cfTotal") && (root.querySelector("#cfTotal").textContent = formatPrice(order.total));
  }

  /* ============================================================
     boot + re-render on language change
     ============================================================ */
  function route(){
    const page = document.body.getAttribute("data-page");
    renderBadge();
    if (page === "boutique") renderBoutique();
    else if (page === "produit") renderProduit();
    else if (page === "panier") renderPanier();
    else if (page === "commande") renderCommande();
    else if (page === "confirmation") renderConfirmation();
  }

  function clearLoadingSlots() {
    document.querySelectorAll("[data-loading-slot]").forEach(function (el) { el.remove(); });
  }

  // The boutique/produit/panier renderers all read PRODUCTS, which is empty
  // until shop-data.js's first fetch completes. Wait for that, then route.
  // The badge can render immediately — it only needs the cart in localStorage.
  function bootRoute() {
    renderBadge();
    if (window.BR_DATA_READY && typeof window.BR_DATA_READY.then === "function") {
      window.BR_DATA_READY.then(function () {
        clearLoadingSlots();
        route();
      }, function () {
        // Fail-safe: even if the API call rejects, hide the spinner and let
        // the page render its empty/error state instead of spinning forever.
        clearLoadingSlots();
        route();
      });
    } else {
      clearLoadingSlots();
      route();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootRoute);
  else bootRoute();
  // br:langchange triggers shop-data.js to refetch in the new lang; once
  // that completes it fires br:data-relang. We re-render then so product
  // names switch language live.
  window.addEventListener("br:data-relang", route);
})();

/* ============================================================
   sheet-mirror.js — miroir des commandes boutique vers Google Sheets.

   Le storefront est 100 % statique (nginx, aucun backend), donc aucune
   clé Google ne peut vivre ici. L'écriture passe par un Apps Script Web
   App (voir scripts/apps-script/Code.gs) qui tourne, lui, avec les
   droits du propriétaire de la feuille.

   Garanties :
   - Ne casse JAMAIS la commande. Odoo reste la source de vérité ; tout
     ici est enveloppé et silencieux. Une panne Google n'a aucun effet
     visible pour le client.
   - Ne perd pas de commande. Chaque commande part d'abord dans une file
     localStorage ; elle n'en sort qu'une fois le serveur confirmé. Les
     échecs (réseau coupé, antivirus, onglet fermé trop vite) sont
     rejoués à la visite suivante.
   - Ne duplique pas. La référence Odoo sert de clé ; l'Apps Script
     ignore une référence déjà écrite, donc un rejeu est sans danger.
   - Se désactive proprement : sans `sheetUrl` configurée, tout est
     no-op. Le site peut donc être déployé avant la feuille.
   ============================================================ */
(function () {
  "use strict";

  // Les scripts du site sont inclus une seule fois (pas de data-astro-rerun),
  // mais on reste idempotent au cas où.
  if (window.BR_SheetMirror) return;

  var QUEUE_KEY = "br_sheet_queue_v1";
  var MAX_QUEUE = 50;              // commandes en attente conservées
  var MAX_TRIES = 6;               // tentatives avant abandon
  var MAX_AGE_MS = 7 * 24 * 3600 * 1000;  // 7 jours

  function cfg() {
    var c = window.BR_CONFIG || {};
    return { url: c.sheetUrl || "", token: c.sheetToken || "" };
  }

  function enabled() { return !!cfg().url; }

  /* ---------- file d'attente (localStorage) ---------- */

  function readQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (err) { return []; }
  }

  function writeQueue(list) {
    try {
      // Garde les plus récentes si la file déborde : une commande très
      // ancienne jamais passée ne vaut pas la peine de bloquer les neuves.
      if (list.length > MAX_QUEUE) list = list.slice(list.length - MAX_QUEUE);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
    } catch (err) { /* quota plein / mode privé — on abandonne en silence */ }
  }

  /* ---------- transport ---------- */

  /**
   * Un seul POST. Résout true si le serveur a confirmé l'écriture (ou
   * signalé un doublon), false si l'issue est inconnue — auquel cas on
   * rejouera, la déduplication côté Apps Script rendant cela sans risque.
   */
  function send(entry) {
    var c = cfg();
    return fetch(c.url, {
      method: "POST",
      // text/plain garde la requête « simple » au sens CORS : pas de
      // preflight OPTIONS, auquel Apps Script ne sait pas répondre.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: c.token, order: entry.order }),
      // Laisse la requête vivre si la page navigue juste après (le
      // checkout redirige vers /confirmation dans la foulée).
      keepalive: true,
      redirect: "follow",
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text); } catch (err) { /* réponse opaque */ }
        if (data && data.ok) return true;
        if (data && data.error === "unauthorized") {
          // Jeton erroné : rejouer ne servira à rien, on le signale.
          console.error("[BR] sheet-mirror: jeton refusé");
          return "drop";
        }
        return false;
      });
    }).catch(function () { return false; });
  }

  /* ---------- vidage de la file ---------- */

  var flushing = false;
  var MAX_CHAIN = 3;   // garde-fou si localStorage refuse d'écrire

  /**
   * Rejoue la file, de la plus ancienne à la plus récente.
   *
   * Le résultat est FUSIONNÉ avec la file telle qu'elle est à la fin, pas
   * écrit par-dessus : une commande validée pendant le rejeu (le client
   * valide à l'instant où une ancienne repart) doit survivre.
   */
  function flush(depth) {
    depth = depth || 0;
    if (flushing || !enabled()) return Promise.resolve();
    if (navigator.onLine === false) return Promise.resolve();
    var queue = readQueue();
    if (!queue.length) return Promise.resolve();

    flushing = true;
    var now = Date.now();
    var settled = {};   // id → écrite, doublon, ou abandonnée : à retirer
    var bumped = {};    // id → nouveau compteur de tentatives

    // Séquentiel : évite de faire concourir plusieurs écritures sur le
    // verrou de l'Apps Script.
    var chain = queue.reduce(function (previous, entry) {
      return previous.then(function () {
        if (entry.tries >= MAX_TRIES || (now - entry.first) > MAX_AGE_MS) {
          console.warn("[BR] sheet-mirror: abandon de", entry.ref);
          settled[entry.id] = true;
          return;
        }
        return send(entry).then(function (result) {
          if (result === true || result === "drop") settled[entry.id] = true;
          else bumped[entry.id] = entry.tries + 1;
        });
      });
    }, Promise.resolve());

    return chain.then(function () {
      var fresh = false;
      var merged = readQueue().filter(function (q) {
        if (settled[q.id]) return false;
        if (bumped[q.id] !== undefined) {
          q.tries = bumped[q.id];
          q.last = now;
          return true;
        }
        fresh = true;   // arrivée pendant ce rejeu : encore jamais tentée
        return true;
      });
      writeQueue(merged);
      flushing = false;
      // Traiter tout de suite ce qui est arrivé en cours de route plutôt
      // que d'attendre la visite suivante. Chaque passage incrémente
      // `tries` ou retire l'entrée, donc la chaîne se termine ; la borne
      // MAX_CHAIN couvre le cas où localStorage refuse d'enregistrer.
      if (fresh && depth < MAX_CHAIN) return flush(depth + 1);
    }).catch(function (err) {
      flushing = false;
      console.error("[BR] sheet-mirror: flush", err);
    });
  }

  /* ---------- API publique ---------- */

  /**
   * Enregistre une commande validée. `order` porte les champs métier
   * (commande, client, telephone, wilaya, produit, amount, total…) ;
   * l'Apps Script choisit lesquels écrire d'après les en-têtes de la
   * feuille, donc envoyer plus que nécessaire est volontaire et sûr.
   *
   * Ne lève jamais, ne bloque jamais : à appeler sans await.
   */
  function record(order) {
    try {
      if (!enabled() || !order) return;
      var ref = String(order.commande || "");
      var queue = readQueue();
      // Déjà en file (double soumission, re-render) — rien à faire.
      if (ref && queue.some(function (q) { return q.ref === ref; })) return;
      // `id` identifie l'entrée pendant un rejeu, même sans référence Odoo.
      var id = ref || ("_" + Date.now() + Math.random().toString(36).slice(2));
      queue.push({ id: id, ref: ref, order: order, tries: 0, first: Date.now(), last: 0 });
      writeQueue(queue);
      flush();
    } catch (err) {
      console.error("[BR] sheet-mirror: record", err);
    }
  }

  window.BR_SheetMirror = {
    record: record,
    flush: flush,
    // Introspection pour le débogage en console.
    pending: function () { return readQueue(); },
  };

  /* ---------- déclencheurs de rattrapage ---------- */

  // Au chargement : rejoue ce qui n'est pas passé la fois d'avant. Différé
  // pour ne pas concurrencer le chargement des produits.
  if (!window.__brSheetMirrorBooted) {
    window.__brSheetMirrorBooted = true;
    setTimeout(function () { flush(); }, 3000);
    window.addEventListener("online", function () { flush(); });
  }
})();

/**
 * Broderie Royale — miroir des commandes boutique vers Google Sheets.
 * =====================================================================
 * Déployé comme Web App (Execute as: Me / Access: Anyone). Le storefront
 * statique poste une ligne par commande validée. Aucune clé ne circule
 * côté navigateur : ce script tourne avec les droits du propriétaire de
 * la feuille.
 *
 * Deploy :  Extensions > Apps Script > coller > Déployer > Web app
 *           Execute as    : Me
 *           Who has access: Anyone
 *
 * Le script est PILOTÉ PAR LES EN-TÊTES : il lit la ligne 1 et place
 * chaque champ dans la colonne qui porte le bon nom. Ajouter, retirer ou
 * réordonner une colonne dans la feuille ne demande AUCUNE modification
 * de code — ni ici, ni sur le site.
 */

// ── Réglages ────────────────────────────────────────────────────────
// Doit être identique à `sheetToken` dans public/js/config.js du site.
var SHARED_TOKEN = '051f45813f493da29fd4d5e6d89cdf57d775e78e';

// ID du classeur — le segment entre /d/ et /edit dans son URL.
// OBLIGATOIRE pour un projet autonome (créé depuis script.google.com).
// Laisser vide si le script est lié à la feuille (Extensions > Apps Script),
// auquel cas le classeur hôte est utilisé.
var SHEET_ID = '1eJWFJo_3Ql6x6bOG_meO3zYnWvTxcG5G7zzw68JTqA4';

// Nom de l'onglet cible. Vide = premier onglet du classeur.
var SHEET_NAME = '';

// En-têtes écrits automatiquement si la feuille est entièrement vide.
var DEFAULT_HEADERS = ['client', 'produit', 'amount', 'total', 'telephone', 'wilaya'];

// Nombre de références conservées pour la déduplication.
var SEEN_LIMIT = 400;
var SEEN_KEY = 'BR_SEEN_REFS';

var VERSION = '1.0.0';

// ── Correspondance en-tête → champ ──────────────────────────────────
// Clé = champ envoyé par le site. Valeurs = orthographes d'en-tête
// acceptées (normalisées : minuscules, sans accents ni ponctuation).
// Pour supporter un nouvel intitulé de colonne, ajouter un alias ici.
var ALIASES = {
  date:      ['date', 'jour', 'datecommande', 'التاريخ'],
  commande:  ['commande', 'ncommande', 'numerocommande', 'ref', 'reference',
              'numero', 'order', 'orderref', 'bon', 'facture', 'الطلبية'],
  client:    ['client', 'nom', 'nomclient', 'customer', 'name', 'acheteur',
              'الزبون', 'الاسم'],
  telephone: ['telephone', 'tel', 'phone', 'mobile', 'gsm', 'numerotelephone',
              'contact', 'الهاتف'],
  wilaya:    ['wilaya', 'willaya', 'region', 'ville', 'الولاية'],
  adresse:   ['adresse', 'address', 'addresse', 'lieu', 'العنوان'],
  produit:   ['produit', 'produits', 'product', 'products', 'article',
              'articles', 'designation', 'details', 'detail', 'المنتج'],
  amount:    ['amount', 'montant', 'soustotal', 'subtotal', 'ht',
              'montantproduits', 'prix', 'المبلغ'],
  livraison: ['livraison', 'delivery', 'frais', 'fraislivraison', 'transport',
              'التوصيل'],
  total:     ['total', 'totalttc', 'ttc', 'montanttotal', 'totalgeneral',
              'netapayer', 'المجموع'],
  paiement:  ['paiement', 'payment', 'modepaiement', 'mode', 'الدفع']
};

// ── Utilitaires ─────────────────────────────────────────────────────

/** minuscules, sans accents, sans ponctuation ni espaces. */
function normalize(value) {
  return String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]/g, '');
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function targetSheet() {
  var ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (SHEET_NAME) {
    var named = ss.getSheetByName(SHEET_NAME);
    if (named) return named;
  }
  return ss.getSheets()[0];
}

/** Lit la ligne 1, en créant les en-têtes par défaut si la feuille est vide. */
function readHeaders(sheet) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var hasAny = headers.some(function (h) { return String(h).trim() !== ''; });
  if (!hasAny) {
    sheet.getRange(1, 1, 1, DEFAULT_HEADERS.length).setValues([DEFAULT_HEADERS]);
    sheet.getRange(1, 1, 1, DEFAULT_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return DEFAULT_HEADERS.slice();
  }
  return headers;
}

/** index de colonne (0-based) → nom de champ, d'après les en-têtes. */
function buildColumnMap(headers) {
  var lookup = {};
  Object.keys(ALIASES).forEach(function (field) {
    ALIASES[field].forEach(function (alias) { lookup[normalize(alias)] = field; });
  });
  var map = {};
  headers.forEach(function (header, index) {
    var key = normalize(header);
    if (key && lookup[key]) map[index] = lookup[key];
  });
  return map;
}

// ── Déduplication (invisible dans la feuille) ───────────────────────

function alreadySeen(ref) {
  if (!ref) return false;
  var raw = PropertiesService.getScriptProperties().getProperty(SEEN_KEY) || '';
  return raw.split('|').indexOf(String(ref)) !== -1;
}

function rememberRef(ref) {
  if (!ref) return;
  var props = PropertiesService.getScriptProperties();
  var list = (props.getProperty(SEEN_KEY) || '').split('|').filter(String);
  list.push(String(ref));
  if (list.length > SEEN_LIMIT) list = list.slice(list.length - SEEN_LIMIT);
  props.setProperty(SEEN_KEY, list.join('|'));
}

// ── Points d'entrée ─────────────────────────────────────────────────

/** Contrôle de santé — ouvrir l'URL dans un navigateur ou via curl. */
function doGet() {
  try {
    var sheet = targetSheet();
    var headers = readHeaders(sheet);
    var map = buildColumnMap(headers);
    return jsonOut({
      ok: true,
      version: VERSION,
      sheet: sheet.getName(),
      headers: headers,
      mapped: Object.keys(map).map(function (i) { return headers[i]; }),
      ignored: headers.filter(function (h, i) { return h && !map[i]; }),
      rows: Math.max(sheet.getLastRow() - 1, 0)
    });
  } catch (err) {
    console.error('doGet', err);
    return jsonOut({ ok: false, error: String(err) });
  }
}

/** Une commande = une ligne. Idempotent sur le champ `commande`. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!SHARED_TOKEN || body.token !== SHARED_TOKEN) {
      console.error('doPost: jeton invalide');
      return jsonOut({ ok: false, error: 'unauthorized' });
    }

    var order = body.order || {};
    var ref = order.commande || '';

    // 30 s : deux commandes simultanées ne doivent pas viser la même ligne.
    if (!lock.tryLock(30000)) {
      return jsonOut({ ok: false, error: 'busy' });
    }
    locked = true;

    if (alreadySeen(ref)) {
      return jsonOut({ ok: true, duplicate: true, ref: ref });
    }

    var sheet = targetSheet();
    var headers = readHeaders(sheet);
    var columnMap = buildColumnMap(headers);

    // L'horodatage vient du serveur : fuseau de la feuille, et non
    // falsifiable depuis le navigateur.
    order.date = new Date();

    var row = headers.map(function (ignoredHeader, index) {
      var field = columnMap[index];
      if (!field) return '';
      var value = order[field];
      return (value === undefined || value === null) ? '' : value;
    });

    sheet.appendRow(row);
    rememberRef(ref);

    return jsonOut({ ok: true, ref: ref, row: sheet.getLastRow() });
  } catch (err) {
    console.error('doPost', err);
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (ignored) {} }
  }
}

/* Tests du miroir Google Sheets — côté Apps Script.
 *
 * scripts/apps-script/Code.gs tourne normalement chez Google. On le charge
 * ici avec des doublures des services Google (SpreadsheetApp,
 * PropertiesService, LockService, ContentService) pour vérifier la logique
 * sans rien déployer.
 *
 *   npm test
 */
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(
  path.join(__dirname, "..", "apps-script", "Code.gs"), "utf8");

// Doit correspondre à SHARED_TOKEN dans Code.gs.
const TOKEN = (SRC.match(/SHARED_TOKEN\s*=\s*'([^']*)'/) || [])[1];

function makeSheet(headers, name) {
  const rows = headers ? [headers.slice()] : [];
  return {
    _rows: rows,
    getName: () => name || "Feuille 1",
    getLastColumn: () => (rows[0] ? rows[0].length : 0),
    getLastRow: () => rows.length,
    setFrozenRows: () => {},
    appendRow: (r) => rows.push(r),
    getRange: (r, c, nR, nC) => ({
      getValues: () => {
        const out = [];
        for (let i = 0; i < nR; i++) {
          const row = rows[r - 1 + i] || [];
          const line = [];
          for (let j = 0; j < nC; j++) {
            const v = row[c - 1 + j];
            line.push(v === undefined ? "" : v);
          }
          out.push(line);
        }
        return out;
      },
      setValues: (vals) => {
        vals.forEach((line, i) => {
          while (rows.length <= r - 1 + i) rows.push([]);
          line.forEach((v, j) => { rows[r - 1 + i][c - 1 + j] = v; });
        });
      },
      setFontWeight: () => {},
    }),
  };
}

function load(sheet, seen) {
  const props = {};
  const book = {
    getSheets: () => [sheet],
    getSheetByName: (n) => (n === sheet.getName() ? sheet : null),
  };
  const stubs = {
    SpreadsheetApp: {
      // Projet autonome : ouverture par ID.
      openById: (id) => { if (seen) seen.push(["openById", id]); return book; },
      // Projet lié à la feuille : classeur hôte.
      getActiveSpreadsheet: () => { if (seen) seen.push(["active"]); return book; },
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (k in props ? props[k] : null),
        setProperty: (k, v) => { props[k] = v; },
      }),
    },
    LockService: {
      getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }),
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (s) => ({ getContent: () => s, setMimeType() { return this; } }),
    },
    // Les rejets attendus journalisent via console.error : on les tait pour
    // garder une sortie de test lisible.
    console: { error: () => {}, warn: () => {}, log: () => {} },
  };
  const factory = new Function(
    ...Object.keys(stubs),
    SRC + "\nreturn { doGet: doGet, doPost: doPost };");
  return factory(...Object.values(stubs));
}

function post(api, order, token) {
  const out = api.doPost({
    postData: {
      contents: JSON.stringify({ token: token === undefined ? TOKEN : token, order }),
    },
  });
  return JSON.parse(out.getContent());
}

const ORDER = {
  commande: "S00123", client: "Ahmed Benali", telephone: "0770112233",
  wilaya: "Alger", adresse: "Cité 500 lgts, Bab Ezzouar",
  produit: "DRAPEAU ALGERIE x2 | ECUSSON x1",
  amount: 4500, livraison: 600, total: 5100, paiement: "COD",
};

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + label); }
  else { fail++; console.log("  FAIL  " + label + (detail !== undefined ? "  -> " + JSON.stringify(detail) : "")); }
}

console.log("\n=== Apps Script (scripts/apps-script/Code.gs) ===");
check("SHARED_TOKEN present dans Code.gs", !!TOKEN);

/* --- T0: how the workbook is reached ------------------------------ */
console.log("\nT0  acces au classeur (projet autonome vs projet lie)");
{
  const SHEET_ID = (SRC.match(/SHEET_ID\s*=\s*'([^']*)'/) || [])[1];
  const seen = [];
  const sheet = makeSheet(["client", "total"]);
  post(load(sheet, seen), ORDER);
  if (SHEET_ID) {
    check("SHEET_ID renseigne -> openById", seen[0] && seen[0][0] === "openById", seen);
    check("openById recoit le bon ID", seen[0] && seen[0][1] === SHEET_ID, seen);
  } else {
    check("SHEET_ID vide -> classeur hote", seen[0] && seen[0][0] === "active", seen);
  }
  check("la commande est ecrite dans les deux cas", sheet._rows.length === 2, sheet._rows);
}

/* --- T1: the sheet as the client built it ------------------------- */
console.log("\nT1  en-tetes du client : client/produit/amount/total/telephone/wilaya");
{
  const sheet = makeSheet(["client", "produit", "amount", "total", "telephone", "wilaya"]);
  const res = post(load(sheet), ORDER);
  const row = sheet._rows[1];
  check("ok", res.ok === true, res);
  check("une seule ligne ajoutee", sheet._rows.length === 2, sheet._rows);
  check("client", row[0] === "Ahmed Benali", row);
  check("produit", row[1] === "DRAPEAU ALGERIE x2 | ECUSSON x1", row);
  check("amount numerique (sommable)", row[2] === 4500, row);
  check("total numerique (sommable)", row[3] === 5100, row);
  check("telephone", row[4] === "0770112233", row);
  check("wilaya", row[5] === "Alger", row);
  check("adresse/livraison NON ecrites (pas de colonne)", row.length === 6, row);
}

/* --- T2: columns reordered and extended -------------------------- */
console.log("\nT2  colonnes reordonnees + Date / N° Commande / Adresse ajoutees");
{
  const sheet = makeSheet(["Date", "N° Commande", "Client", "Téléphone",
                           "Wilaya", "Adresse", "Produit", "Montant",
                           "Livraison", "Total"]);
  const res = post(load(sheet), ORDER);
  const row = sheet._rows[1];
  check("ok", res.ok === true, res);
  check("date posee par le serveur", row[0] instanceof Date, row[0]);
  check("N° Commande", row[1] === "S00123", row);
  check("Client", row[2] === "Ahmed Benali", row);
  check("Téléphone (accent) mappe", row[3] === "0770112233", row);
  check("Wilaya", row[4] === "Alger", row);
  check("Adresse", row[5] === "Cité 500 lgts, Bab Ezzouar", row);
  check("Montant -> amount", row[7] === 4500, row);
  check("Livraison", row[8] === 600, row);
  check("Total", row[9] === 5100, row);
}

/* --- T3: idempotence --------------------------------------------- */
console.log("\nT3  meme reference envoyee 3 fois (double-clic / rejeu)");
{
  const sheet = makeSheet(["client", "produit", "amount", "total", "telephone", "wilaya"]);
  const api = load(sheet);
  const a = post(api, ORDER), b = post(api, ORDER), c = post(api, ORDER);
  check("1er accepte", a.ok === true && !a.duplicate, a);
  check("2e signale doublon", b.ok === true && b.duplicate === true, b);
  check("3e signale doublon", c.ok === true && c.duplicate === true, c);
  check("une seule ligne au total", sheet._rows.length === 2, sheet._rows);
}

/* --- T4: auth ----------------------------------------------------- */
console.log("\nT4  jeton invalide ou absent");
{
  const sheet = makeSheet(["client", "produit", "amount", "total", "telephone", "wilaya"]);
  const api = load(sheet);
  const bad = post(api, ORDER, "mauvais-jeton");
  const none = post(api, ORDER, "");
  check("jeton errone refuse", bad.ok === false && bad.error === "unauthorized", bad);
  check("jeton vide refuse", none.ok === false, none);
  check("aucune ligne ecrite", sheet._rows.length === 1, sheet._rows);
}

/* --- T5: empty sheet self-initialises ---------------------------- */
console.log("\nT5  feuille entierement vide");
{
  const sheet = makeSheet(null);
  const res = post(load(sheet), ORDER);
  check("ok", res.ok === true, res);
  check("en-tetes crees", JSON.stringify(sheet._rows[0]) ===
    JSON.stringify(["client", "produit", "amount", "total", "telephone", "wilaya"]),
    sheet._rows[0]);
  check("commande ecrite", sheet._rows[1] && sheet._rows[1][0] === "Ahmed Benali", sheet._rows[1]);
}

/* --- T6: arabic headers ------------------------------------------ */
console.log("\nT6  en-tetes en arabe");
{
  const sheet = makeSheet(["الزبون", "المنتج", "المبلغ", "المجموع", "الهاتف", "الولاية"]);
  const res = post(load(sheet), ORDER);
  const row = sheet._rows[1];
  check("ok", res.ok === true, res);
  check("client", row[0] === "Ahmed Benali", row);
  check("total", row[3] === 5100, row);
  check("telephone", row[4] === "0770112233", row);
}

/* --- T7: unknown header untouched -------------------------------- */
console.log("\nT7  colonne inconnue (ex. 'Remarques' tenue a la main)");
{
  const sheet = makeSheet(["client", "Remarques", "total"]);
  const res = post(load(sheet), ORDER);
  const row = sheet._rows[1];
  check("ok", res.ok === true, res);
  check("client", row[0] === "Ahmed Benali", row);
  check("colonne inconnue laissee vide", row[1] === "", row);
  check("total", row[2] === 5100, row);
}

/* --- T8: malformed input ----------------------------------------- */
console.log("\nT8  corps de requete casse / vide");
{
  const sheet = makeSheet(["client", "total"]);
  const api = load(sheet);
  const r1 = JSON.parse(api.doPost({ postData: { contents: "pas du json" } }).getContent());
  const r2 = JSON.parse(api.doPost({}).getContent());
  check("json casse -> ok:false sans crash", r1.ok === false, r1);
  check("requete vide -> ok:false sans crash", r2.ok === false, r2);
  check("aucune ligne ecrite", sheet._rows.length === 1, sheet._rows);
}

/* --- T9: health check -------------------------------------------- */
console.log("\nT9  doGet (controle de sante)");
{
  const sheet = makeSheet(["client", "produit", "amount", "total", "telephone", "wilaya"]);
  const res = JSON.parse(load(sheet).doGet().getContent());
  check("ok", res.ok === true, res);
  check("6 colonnes reconnues", res.mapped.length === 6, res.mapped);
  check("aucune colonne ignoree", res.ignored.length === 0, res.ignored);
  check("0 ligne de donnees", res.rows === 0, res);
}

console.log("\n  " + pass + " PASS   " + fail + " FAIL\n");
process.exit(fail ? 1 : 0);

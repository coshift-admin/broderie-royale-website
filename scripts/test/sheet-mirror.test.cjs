/* Tests du miroir Google Sheets — côté navigateur.
 *
 * public/js/sheet-mirror.js est chargé avec des doublures de localStorage,
 * navigator et fetch, pour prouver les garanties annoncées : ne casse jamais
 * la commande, ne perd pas de commande, ne duplique pas.
 *
 *   npm test
 */
const fs = require("fs");
const path = require("path");

const MIRROR = path.join(__dirname, "..", "..", "public", "js", "sheet-mirror.js");
const SRC = fs.readFileSync(MIRROR, "utf8");
const URL_OK = "https://script.google.com/macros/s/AKfy_test/exec";

function instantiate(env, store) {
  const factory = new Function(
    "window", "localStorage", "navigator", "fetch", "console", "setTimeout",
    SRC + "\nreturn window.BR_SheetMirror;");
  return factory(env.window, store, env.navigator, env.fetch, env.console,
    env.setTimeout);
}

function makeEnv(opts) {
  opts = opts || {};
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      if (opts.storageBroken) throw new Error("QuotaExceededError");
      store[k] = String(v);
    },
  };
  const calls = [];
  const env = {
    calls,
    store,
    localStorage,
    responses: opts.responses ? opts.responses.slice() : [],
    window: { addEventListener: () => {} },
    navigator: { onLine: opts.offline ? false : true },
    console: { error: () => {}, warn: () => {}, log: () => {} },
    setTimeout: () => {},   // neutralise le flush différé du boot
  };
  env.window.BR_CONFIG = {
    sheetUrl: opts.noUrl ? "" : URL_OK,
    sheetToken: "tok-123",
  };
  env.fetch = function (url, init) {
    calls.push({ url, init });
    const next = env.responses.length ? env.responses.shift() : { ok: true };
    if (next.throws) return Promise.reject(new TypeError("Failed to fetch"));
    return Promise.resolve({ text: () => Promise.resolve(JSON.stringify(next)) });
  };
  env.mirror = instantiate(env, localStorage);
  return env;
}

const drain = () => new Promise((r) => setTimeout(r, 0));

const ORDER = {
  commande: "S00500", client: "Yacine", telephone: "0661002030",
  wilaya: "Oran", produit: "DRAPEAU x1", amount: 2000, total: 2600,
};

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + label); }
  else { fail++; console.log("  FAIL  " + label + (detail !== undefined ? "  -> " + JSON.stringify(detail) : "")); }
}

(async function run() {
  console.log("\n=== Navigateur (public/js/sheet-mirror.js) ===");

  console.log("\nT1  desactive quand sheetUrl est vide");
  {
    const e = makeEnv({ noUrl: true });
    e.mirror.record(ORDER);
    await drain();
    check("aucun appel reseau", e.calls.length === 0, e.calls.length);
    check("rien mis en file", e.mirror.pending().length === 0, e.mirror.pending());
  }

  console.log("\nT2  cas nominal : une commande, un POST, file videe");
  {
    const e = makeEnv({ responses: [{ ok: true, row: 2 }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("un seul POST", e.calls.length === 1, e.calls.length);
    check("file videe", e.mirror.pending().length === 0, e.mirror.pending());
    const init = e.calls[0].init;
    const body = JSON.parse(init.body);
    check("methode POST", init.method === "POST", init.method);
    check("Content-Type text/plain (evite le preflight CORS)",
      /^text\/plain/.test(init.headers["Content-Type"]), init.headers);
    check("keepalive actif (survit a la redirection)", init.keepalive === true, init.keepalive);
    check("jeton transmis", body.token === "tok-123", body.token);
    check("reference transmise", body.order.commande === "S00500", body.order);
  }

  console.log("\nT3  echec serveur -> reste en file, compteur incremente");
  {
    const e = makeEnv({ responses: [{ ok: false, error: "busy" }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    const q = e.mirror.pending();
    check("conservee en file", q.length === 1, q);
    check("tries = 1", q[0] && q[0].tries === 1, q[0]);
    check("reference memorisee", q[0] && q[0].ref === "S00500", q[0]);
  }

  console.log("\nT4  reseau coupe / antivirus -> conservee puis rejouee");
  {
    const e = makeEnv({ responses: [{ throws: true }, { ok: true }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("1er essai echoue, commande gardee", e.mirror.pending().length === 1, e.mirror.pending());
    await e.mirror.flush();
    await drain();
    check("2e essai passe, file videe", e.mirror.pending().length === 0, e.mirror.pending());
    check("2 appels au total", e.calls.length === 2, e.calls.length);
  }

  console.log("\nT5  doublon annonce par le serveur -> retiree de la file");
  {
    const e = makeEnv({ responses: [{ ok: true, duplicate: true }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("file videe (pas de rejeu infini)", e.mirror.pending().length === 0, e.mirror.pending());
  }

  console.log("\nT6  meme reference enregistree 2 fois -> une seule entree");
  {
    const e = makeEnv({ responses: [{ ok: false }, { ok: false }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("une seule entree en file", e.mirror.pending().length === 1, e.mirror.pending());
  }

  console.log("\nT7  jeton refuse -> abandon (pas de boucle infinie)");
  {
    const e = makeEnv({ responses: [{ ok: false, error: "unauthorized" }] });
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("retiree de la file", e.mirror.pending().length === 0, e.mirror.pending());
  }

  console.log("\nT8  echecs repetes -> abandon, la file ne grossit pas");
  {
    const e = makeEnv({ responses: Array(8).fill({ ok: false }) });
    e.mirror.record(ORDER);
    for (let i = 0; i < 8; i++) { await e.mirror.flush(); await drain(); }
    check("abandonnee apres MAX_TRIES", e.mirror.pending().length === 0, e.mirror.pending());
    check("appels plafonnes a 6", e.calls.length === 6, e.calls.length);
  }

  console.log("\nT9  hors ligne -> aucun appel, commande gardee");
  {
    const e = makeEnv({ offline: true });
    e.mirror.record(ORDER);
    await drain(); await drain();
    check("aucun appel reseau", e.calls.length === 0, e.calls.length);
    check("gardee en file", e.mirror.pending().length === 1, e.mirror.pending());
  }

  console.log("\nT10  localStorage casse (navigation privee / quota plein)");
  {
    const e = makeEnv({ storageBroken: true });
    let threw = false;
    try { e.mirror.record(ORDER); await e.mirror.flush(); } catch (err) { threw = true; }
    await drain();
    check("record() et flush() ne levent jamais", threw === false);
  }

  console.log("\nT11  record(null) / sans argument");
  {
    const e = makeEnv({});
    let threw = false;
    try { e.mirror.record(null); e.mirror.record(); } catch (err) { threw = true; }
    await drain();
    check("aucune exception", threw === false);
    check("aucun appel reseau", e.calls.length === 0, e.calls.length);
  }

  console.log("\nT12  plafond de la file (MAX_QUEUE)");
  {
    const e = makeEnv({ responses: Array(200).fill({ ok: false }) });
    for (let i = 0; i < 70; i++) {
      e.mirror.record(Object.assign({}, ORDER, { commande: "S" + i }));
    }
    await drain(); await drain();
    const q = e.mirror.pending();
    check("file plafonnee a 50", q.length <= 50, q.length);
    check("garde les plus recentes", q[q.length - 1].ref === "S69", q[q.length - 1]);
  }

  console.log("\nT13  REGRESSION : commande validee PENDANT un rejeu en cours");
  {
    // Le rejeu lit la file au debut et la reecrit a la fin. Sans fusion, la
    // commande arrivee entre les deux serait effacee — c'est le bug que ce
    // test verrouille.
    const e = makeEnv({});
    let release;
    const inFlight = new Promise((r) => { release = r; });
    let n = 0;
    e.fetch = function (url, init) {
      e.calls.push({ url, init });
      n++;
      if (n === 1) {
        return inFlight.then(() => ({ text: () => Promise.resolve('{"ok":false}') }));
      }
      return Promise.resolve({ text: () => Promise.resolve('{"ok":true}') });
    };
    delete e.window.BR_SheetMirror;
    const mirror = instantiate(e, e.localStorage);

    mirror.record(Object.assign({}, ORDER, { commande: "ANCIENNE" }));
    await drain();                        // le POST d'ANCIENNE est en vol
    mirror.record(Object.assign({}, ORDER, { commande: "NOUVELLE" }));
    check("NOUVELLE est en file pendant le rejeu",
      mirror.pending().some((q) => q.ref === "NOUVELLE"), mirror.pending());

    release();                            // le serveur repond enfin (echec)
    await drain(); await drain(); await drain();

    const refs = mirror.pending().map((q) => q.ref);
    const sent = e.calls.map((c) => JSON.parse(c.init.body).order.commande);
    check("NOUVELLE envoyee au serveur (pas ecrasee)", sent.includes("NOUVELLE"), sent);
    check("ANCIENNE rejouee apres son echec",
      sent.filter((r) => r === "ANCIENNE").length === 2, sent);
    check("file vide : les deux sont ecrites", refs.length === 0, refs);
  }

  console.log("\n  " + pass + " PASS   " + fail + " FAIL\n");
  process.exit(fail ? 1 : 0);
})();

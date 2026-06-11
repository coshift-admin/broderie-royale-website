# Broderie Royale — Astro port

Side-by-side Astro version of the static `broderie_royale/` site. Goal: best
possible performance while preserving the cinematic look-and-feel verbatim,
while talking live to the Odoo backend (modules `coshift_ecomm_api` +
`coshift_ecomm_cms`) for products, categories, orders, delivery, partners,
testimonials, team, FAQ, and references.

## Run

```powershell
cd D:\Odoo\odoo-dev\websites\broderie_royale_astro
npm install
npm run dev
```

Then open http://localhost:4321.

## Build

```powershell
npm run build
npm run preview
```

Production output goes to `dist/` — a fully static site you can deploy
anywhere (Nginx, Cloudflare Pages, Netlify, an Odoo nginx route, etc.).

## Architecture

- **`src/pages/*.astro`** — one file per route. Only the unique `<main>`
  content lives per page.
- **`src/layouts/BaseLayout.astro`** — the shared shell: `<head>`, nav,
  footer, all `<script>` tags, CSP / security meta.
- **`public/`** — CSS, fonts, brand assets, JS modules.
- **`public/js/config.js`** — `BR_CONFIG` with `apiBase` + `apiKey` for the
  Odoo backend. Edit before deploying.
- **`public/js/api.js`** — thin REST client wrapping the
  `coshift_ecomm_api` + `coshift_ecomm_cms` endpoints.

## Production checklist

Before pointing real traffic at this site, do all of the following.
Failing any of them is a real (not theoretical) risk.

### Astro side

1. **Rotate `BR_CONFIG.apiKey`** in `public/js/config.js` to match the
   Odoo `coshift_ecomm_api.key` value you set in step 2 below. (Yes, the
   key is in client JS — see the next section about the BFF pattern for
   why that's only an OK situation when paired with origin enforcement.)
2. **Replace `apiBase: "http://localhost:8069"`** in `config.js` with the
   public HTTPS Odoo domain.
3. **Update the CSP `connect-src` and `img-src`** in `BaseLayout.astro` to
   match the production Odoo origin. Remove `http://localhost:8069`.
4. **At the production reverse proxy / CDN** (Nginx, Cloudflare, etc.) set:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Frame-Options: SAMEORIGIN`
   - `Content-Security-Policy` (response header, repeats the `<meta>`
     directives plus `frame-ancestors 'self'` — which only works as a
     response header, not in `<meta>`)
   - Brotli / gzip on `dist/`

### Odoo side

See `coshift_ecomm_api/README.md` § Security model. In short:

- Rotate `coshift_ecomm_api.key`. The seed value
  (`unset-please-rotate-before-launch`) triggers a 503 on every API call,
  so you can't accidentally deploy with it. Generate fresh:
  `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Set `coshift_ecomm_api.cors_origin` to the production storefront origin(s).
- Set `coshift_ecomm_api.public_base_url` (or `web.base.url`) to the
  production HTTPS Odoo domain — otherwise the image URLs in API responses
  point at localhost.
- Add Nginx `limit_req_zone` in front of `/api/v1/orders` and other write
  endpoints. The in-controller per-IP rate limit is defence-in-depth; the
  primary control is the proxy.

### The BFF pattern (recommended for any production launch)

Right now the storefront ships `BR_CONFIG.apiKey` directly to the browser.
Combined with the Origin allowlist enforced server-side, this is *OK* for
read endpoints (worst case: catalog scraping, which is mostly public
anyway). It is *not* ideal for the order endpoint.

The clean fix: introduce a tiny **BFF** (backend-for-frontend) between the
browser and Odoo:

```
browser  →  https://broderieroyale.com/api/order   (BFF)  →  Odoo /api/v1/orders
```

The BFF holds the real `coshift_ecomm_api.key` as a server-side env var.
The browser never sees it. Origins is double-checked there. Spam is
blocked there.

Practical options for the BFF:
- A handful of Astro server endpoints under `src/pages/api/` (switch
  `astro.config.mjs` to `output: 'hybrid'` and add a Node / Cloudflare /
  Vercel adapter).
- A Cloudflare Worker (zero-infra, ~5 lines of code per endpoint).
- A tiny Express / Hono server alongside Odoo.

When you're ready, ping me and we'll do it.

## Pages

| Route | Notes |
|---|---|
| `/` | The 7-chapter cinematic scroll (story site) |
| `/boutique` | Product grid, live from Odoo |
| `/produit?id=<id>` | Product detail |
| `/panier` | Cart (localStorage-backed) |
| `/commande` | Checkout (COD, wilayas + pickup points from Odoo) |
| `/confirmation` | Order placed |
| `/contact` | Contact + 3-step devis form (currently UI only — see "Leads endpoint" TODO) |
| `/devis` | Meta-refresh → `/contact#devis` |
| `/galerie` | Gallery |
| `/motifs` | Designer's pattern picker (standalone tool) |
| `/404` | Not found |

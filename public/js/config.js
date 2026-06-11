/* ============================================================
   config.js — storefront → Odoo settings.
   Loaded before api.js, shop-data.js, and shop.js. Edit these two
   values for production (and update BaseLayout's CSP connect-src +
   img-src to match the new Odoo origin).
   ============================================================ */
window.BR_CONFIG = window.BR_CONFIG || {
  // Where the coshift_ecomm_api + coshift_ecomm_cms endpoints live.
  apiBase: "http://localhost:8069",
  // Shared key (ir.config_parameter coshift_ecomm_api.key). Treat this as
  // a public key — anyone with the storefront URL can read it. Use Odoo's
  // CORS allowlist + the read-only-ness of the GET endpoints as your real
  // boundary.
  apiKey: "unset-please-rotate-before-launch",
};

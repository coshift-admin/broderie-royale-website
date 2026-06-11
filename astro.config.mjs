import { defineConfig } from 'astro/config';

// Clean extensionless URLs: /boutique, /produit, etc.
// Each page builds to dist/<name>/index.html. The dev server and most static
// hosts canonicalize /boutique → /boutique/ automatically.
export default defineConfig({
  build: {
    format: 'directory',
  },
  server: {
    port: 4321,
  },
  vite: {
    // Force-rebuild Vite's pre-bundled deps on every dev-server start.
    // Without this, editing many files mid-session can leave the .vite/deps
    // cache out of sync with the loaded page, and the browser gets a stream
    // of "504 Outdated Optimize Dep" errors that kill the inline scripts.
    optimizeDeps: { force: true },
    server: {
      // Tell the browser never to cache dev-server responses — the cache
      // layer is where the stale-chunk problem actually lives.
      headers: { 'Cache-Control': 'no-store' },
    },
  },
});

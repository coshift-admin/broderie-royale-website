# syntax=docker/dockerfile:1.7
#
# Broderie Royale storefront — multi-stage build.
#
# Stage 1 (`build`):  Node Alpine, runs `npm ci` and `npm run build`.
#                     Output is the static `dist/` folder.
#
# Stage 2 (`runtime`): Nginx Alpine, serves `dist/` with brand-tuned
#                     config (gzip, cache headers, the right SPA
#                     trailing-slash + 404 behaviour).
#
# Build:   docker build -t broderie-royale-web .
# Run:     docker run --rm -p 8080:80 broderie-royale-web
#

# ============== STAGE 1: build the static site ==============
FROM node:22-alpine AS build
WORKDIR /app

# package files first → npm layer caches when source changes but deps don't.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Source files
COPY . .

# Astro build → /app/dist/
RUN npm run build


# ============== STAGE 2: serve via nginx =====================
FROM nginx:1.27-alpine AS runtime

# Drop the default nginx site, install our config.
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/broderie.conf

# Entrypoint script substitutes runtime API config into config.js,
# letting one image work in dev / staging / prod without rebuilding.
COPY docker/entrypoint.sh /docker-entrypoint.d/40-rewrite-config.sh
RUN chmod +x /docker-entrypoint.d/40-rewrite-config.sh

# Copy the built static site
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck — nginx is up if /index.html serves 200
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O- http://localhost/ >/dev/null 2>&1 || exit 1

EXPOSE 80
# nginx:alpine's own entrypoint runs /docker-entrypoint.d/*.sh, so our
# substitution script fires before nginx starts.

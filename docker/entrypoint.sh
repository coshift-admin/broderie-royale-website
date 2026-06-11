#!/bin/sh
#
# Runtime config injection. Substitutes API base / key into the served
# config.js so a single image works in any environment.
#
# Variables read from the container env:
#   BR_API_BASE   e.g. https://odoo.broderieroyale.com
#   BR_API_KEY    the rotated Odoo coshift_ecomm_api.key value
#
# If neither is set, we leave config.js exactly as it was built — useful
# when the image is pre-baked for a specific deployment.

set -eu

CONFIG_FILE="/usr/share/nginx/html/js/config.js"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "[entrypoint] config.js not present at $CONFIG_FILE — skipping"
  exit 0
fi

if [ -n "${BR_API_BASE:-}" ]; then
  echo "[entrypoint] setting apiBase to ${BR_API_BASE}"
  # Use a sed delimiter that won't collide with URL slashes. Match the
  # JS-object property form `apiBase: "..."` (no quotes on the key).
  ESC=$(printf '%s' "$BR_API_BASE" | sed 's/[|&]/\\&/g')
  sed -i "s|apiBase: *\"[^\"]*\"|apiBase: \"${ESC}\"|" "$CONFIG_FILE"
fi

if [ -n "${BR_API_KEY:-}" ]; then
  echo "[entrypoint] setting apiKey (length ${#BR_API_KEY})"
  ESC=$(printf '%s' "$BR_API_KEY" | sed 's/[|&]/\\&/g')
  sed -i "s|apiKey: *\"[^\"]*\"|apiKey: \"${ESC}\"|" "$CONFIG_FILE"
fi

echo "[entrypoint] config.js after substitution:"
cat "$CONFIG_FILE"

#!/bin/sh
#
# Runtime config injection. Substitutes API base / key into the served
# config.js so a single image works in any environment.
#
# Variables read from the container env:
#   BR_API_BASE     e.g. https://odoo.broderieroyale.com
#   BR_API_KEY      the rotated Odoo coshift_ecomm_api.key value
#   BR_SHEET_URL    Apps Script Web App /exec URL (order mirror; optional)
#   BR_SHEET_TOKEN  shared token matching the Apps Script SHARED_TOKEN
#
# Any variable left unset keeps the value baked into config.js at build
# time — so the image works pre-baked, and the Sheet mirror can be wired
# (or rotated) later without rebuilding.

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

if [ -n "${BR_SHEET_URL:-}" ]; then
  echo "[entrypoint] setting sheetUrl to ${BR_SHEET_URL}"
  ESC=$(printf '%s' "$BR_SHEET_URL" | sed 's/[|&]/\\&/g')
  sed -i "s|sheetUrl: *\"[^\"]*\"|sheetUrl: \"${ESC}\"|" "$CONFIG_FILE"
fi

if [ -n "${BR_SHEET_TOKEN:-}" ]; then
  echo "[entrypoint] setting sheetToken (length ${#BR_SHEET_TOKEN})"
  ESC=$(printf '%s' "$BR_SHEET_TOKEN" | sed 's/[|&]/\\&/g')
  sed -i "s|sheetToken: *\"[^\"]*\"|sheetToken: \"${ESC}\"|" "$CONFIG_FILE"
fi

echo "[entrypoint] config.js after substitution:"
cat "$CONFIG_FILE"

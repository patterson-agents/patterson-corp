#!/bin/sh
# Verify that assets/theme.css is exactly what build-theme.ts generates from assets/tokens.json.
#
# Run locally or in CI:
#     ./scripts/verify-theme.sh          (also safe under `sh`, `bash` or `dash` — POSIX only)
#
# Exit codes: 0 in sync · 1 drift detected (a unified diff is printed) · 2 build error.
#
# Fix drift by editing assets/tokens.json (never theme.css by hand) and re-running
#     node scripts/build-theme.ts

set -eu

here="$(cd "$(dirname "$0")" && pwd)"
skill_root="$(dirname "$here")"
tokens="$skill_root/assets/tokens.json"
theme="$skill_root/assets/theme.css"

node="${NODE:-node}"
command -v "$node" >/dev/null 2>&1 || { echo "verify-theme: $node not found" >&2; exit 2; }

# build-theme.ts relies on Node's native TypeScript type stripping (on by default in Node 22.18+).
node_major="$("$node" -p 'process.versions.node.split(".")[0]')"
node_minor="$("$node" -p 'process.versions.node.split(".")[1]')"
if [ "$node_major" -lt 22 ] || { [ "$node_major" -eq 22 ] && [ "$node_minor" -lt 18 ]; }; then
  echo "verify-theme: node >= 22.18 required for TypeScript type stripping (found $("$node" -v))" >&2
  exit 2
fi

for f in "$tokens" "$theme" "$here/build-theme.ts"; do
  [ -f "$f" ] || { echo "verify-theme: missing $f" >&2; exit 2; }
done

tmp="$(mktemp -t patterson-theme.XXXXXX.css)"
trap 'rm -f "$tmp"' EXIT

if ! "$node" "$here/build-theme.ts" --tokens "$tokens" --stdout >"$tmp"; then
  echo "verify-theme: build-theme.ts failed" >&2
  exit 2
fi

if cmp -s "$tmp" "$theme"; then
  echo "verify-theme: OK - theme.css is byte-identical to the output of build-theme.ts"
  exit 0
fi

echo "verify-theme: DRIFT - theme.css does not match tokens.json" >&2
echo "--- committed: assets/theme.css" >&2
echo "+++ generated: build-theme.ts < assets/tokens.json" >&2
diff -u "$theme" "$tmp" >&2 || true
exit 1

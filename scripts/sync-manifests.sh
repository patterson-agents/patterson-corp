#!/bin/sh
# Cross-vendor manifest projection.
#
# Copies the canonical Claude Code marketplace manifest
# (.claude-plugin/marketplace.json) to the GitHub Copilot manifest location
# (.github/plugin/marketplace.json). The projection is a byte-for-byte copy,
# never a transformation -- see docs/decisions/0002-cross-vendor-manifest-projection.md.
#
# Usage:
#   sync-manifests.sh           copy the manifest, then verify the copy
#   sync-manifests.sh --check   verify only; never writes anything
#
# Exit codes:
#   0   manifests match (after the copy, or already matching under --check)
#   1   divergence detected under --check (the two files differ, or the
#       projected file is missing)
#   2   the source manifest (.claude-plugin/marketplace.json) is missing
set -eu

script_dir=$(cd "$(dirname "$0")" && pwd)
repo_root=$(cd "$script_dir/.." && pwd)

src="$repo_root/.claude-plugin/marketplace.json"
dst_dir="$repo_root/.github/plugin"
dst="$dst_dir/marketplace.json"

mode=${1:-}

if [ ! -f "$src" ]; then
  echo "sync-manifests: source manifest not found: $src" >&2
  exit 2
fi

if [ "$mode" = "--check" ]; then
  if [ ! -f "$dst" ]; then
    echo "sync-manifests: divergence detected" >&2
    echo "  source:    $src" >&2
    echo "  projected: $dst (missing)" >&2
    exit 1
  fi
  if ! diff_output=$(cmp "$src" "$dst" 2>&1); then
    echo "sync-manifests: divergence detected" >&2
    echo "  source:    $src" >&2
    echo "  projected: $dst" >&2
    echo "  $diff_output" >&2
    exit 1
  fi
  echo "sync-manifests: $src and $dst are byte-identical"
  exit 0
fi

mkdir -p "$dst_dir"
cp "$src" "$dst"

if ! diff_output=$(cmp "$src" "$dst" 2>&1); then
  echo "sync-manifests: copy verification failed" >&2
  echo "  source:    $src" >&2
  echo "  projected: $dst" >&2
  echo "  $diff_output" >&2
  exit 1
fi

echo "sync-manifests: projected $src -> $dst"
exit 0

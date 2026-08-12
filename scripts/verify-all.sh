#!/bin/sh
# verify-all.sh -- the single gate-battery entry point for patterson-corp.
#
# Runs every skill/hook test suite, the design-tokens theme round-trip, the
# skill-name-equals-directory invariant, the forbidden-string greps, the no-binaries and
# size-budget validators, and a handful of "never commit this" greps (.py files, node:20,
# an expanded ${CLAUDE_PLUGIN_ROOT}). Both CI (.github/workflows/ci.yml) and
# .githooks/pre-commit / .pre-commit-config.yaml call this script; it is the one place the
# repository's invariants are defined.
#
# POSIX sh only. Usage: sh scripts/verify-all.sh   (from anywhere; resolves its own path)
# Exit: 0 only if every component below passes.
set -u

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$HERE/.." && pwd)
cd "$ROOT" || exit 2

overall=0
pass() { echo "PASS $1"; }
fail() { echo "FAIL $1"; overall=1; }

echo "== patterson-corp verify-all =="
echo "root: $ROOT"

# ---------------------------------------------------------------------------
# 1. Every skill/hook/validator test suite, discovered dynamically.
#    Repository-wide (not just plugins/) so this script's own scripts/tests/run-tests.sh,
#    and any suite a sibling workstream adds anywhere, are included without editing this
#    file. Only .git is excluded.
# ---------------------------------------------------------------------------
suite_count=0
suite_fail=0
for suite in $(find . -path ./.git -prune -o -name node_modules -prune -o -path ./site/dist -prune -o -path ./.astro -prune -o -name 'run-tests.sh' -print | sort); do
  suite_count=$((suite_count + 1))
  echo "--- suite: $suite ---"
  if sh "$suite"; then
    :
  else
    suite_fail=$((suite_fail + 1))
  fi
done
if [ "$suite_count" -eq 0 ]; then
  fail "test suites (none found -- expected at least one run-tests.sh)"
elif [ "$suite_fail" -eq 0 ]; then
  pass "test suites ($suite_count suite(s), all green)"
else
  fail "test suites ($suite_fail of $suite_count suite(s) failed)"
fi

# ---------------------------------------------------------------------------
# 2. Design-tokens theme round-trip: verify-theme.sh already performs exactly
#    `node build-theme.ts --stdout` compared against assets/theme.css via `cmp`, and prints
#    a diff on drift. Run it directly rather than re-implementing the same comparison.
# ---------------------------------------------------------------------------
THEME_VERIFY="plugins/patterson-brand/skills/design-tokens/scripts/verify-theme.sh"
if [ -f "$THEME_VERIFY" ]; then
  if sh "$THEME_VERIFY"; then
    pass "theme round-trip ($THEME_VERIFY)"
  else
    fail "theme round-trip ($THEME_VERIFY)"
  fi
else
  fail "theme round-trip ($THEME_VERIFY not found)"
fi

# ---------------------------------------------------------------------------
# 3. Skill name == directory name, scanned under plugins/ ONLY. The OpenSpec tooling
#    skills under .claude/skills/ are not product skills and must never be scanned here.
# ---------------------------------------------------------------------------
skill_mismatch=0
skill_count=0
for skill_md in plugins/*/skills/*/SKILL.md; do
  [ -f "$skill_md" ] || continue
  skill_count=$((skill_count + 1))
  dir_name=$(basename "$(dirname "$skill_md")")
  frontmatter_name=$(sed -n '1,20p' "$skill_md" | grep -m1 '^name:' | sed 's/^name:[[:space:]]*//')
  if [ "$dir_name" != "$frontmatter_name" ]; then
    echo "  mismatch: $skill_md (dir=$dir_name, name=$frontmatter_name)"
    skill_mismatch=$((skill_mismatch + 1))
  fi
done
if [ "$skill_mismatch" -eq 0 ]; then
  pass "skill name == directory ($skill_count skill(s) under plugins/)"
else
  fail "skill name == directory ($skill_mismatch mismatch(es))"
fi

# ---------------------------------------------------------------------------
# 4. Forbidden strings. Case-sensitive: two literal brand-extraction defects (a wrong font
#    name, two wrong hex colors) plus the name of a superseded Adobe Fonts kit, and a
#    case-insensitive check for a CSS `text-transform` set to all-caps.
#
#    Every pattern below is written with a bracket character class around its last letter
#    (e.g. "Figtre[e]") purely so THIS FILE does not contain the literal forbidden string
#    and therefore never flags itself -- this check scans all tracked non-.md files,
#    including its own source. The class still matches the real string in target files.
#
#    *.md files are allowlisted wholesale: they are prose that legitimately documents
#    these strings as defects to avoid (brand-identity/typography.md,
#    conflicts-and-gaps.md, this repo's own openspec/ change proposals). Three non-md files
#    document the same superseded-kit history inline as a comment or JSON string
#    (build-theme.ts, theme.css, tokens.json, verified by hand) -- only the kit-name
#    pattern is exempted for those three paths; a new wrong-font or wrong-hex-color literal
#    landing in them still fails, same as anywhere else.
# ---------------------------------------------------------------------------
FONT_AND_COLOR_PATTERN='Figtre[e]|d98a0[0]|c0392[b]'
KIT_NAME_PATTERN='rul6mj[k]'
UPPERCASE_PATTERN='text-transform:[[:space:]]*uppercas[e]'
UPPERCASE_SUFFIX="e" # reassembled only for the human-readable message below

KIT_NAME_ALLOWLISTED_FILES="
./plugins/patterson-brand/skills/design-tokens/scripts/build-theme.ts
./plugins/patterson-brand/skills/design-tokens/assets/theme.css
./plugins/patterson-brand/skills/design-tokens/assets/tokens.json
"
is_kit_name_allowlisted() {
  printf '%s\n' "$KIT_NAME_ALLOWLISTED_FILES" | grep -qxF "$1"
}

forbidden_hits=0
for f in $(git ls-files | grep -v '\.md$' | grep -v '\.lock$' | grep -v 'bun\.lock'); do
  fpath="./$f"
  if is_kit_name_allowlisted "$fpath"; then
    pattern="$FONT_AND_COLOR_PATTERN"
  else
    pattern="${FONT_AND_COLOR_PATTERN}|${KIT_NAME_PATTERN}"
  fi
  matches=$(grep -noE "$pattern" "$f" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    n=$(printf '%s\n' "$matches" | grep -c .)
    forbidden_hits=$((forbidden_hits + n))
    printf '%s\n' "$matches" | sed "s#^#  forbidden string in $f: line #"
  fi
  if grep -qiE "$UPPERCASE_PATTERN" "$f" 2>/dev/null; then
    forbidden_hits=$((forbidden_hits + 1))
    echo "  forbidden text-transform:uppercas${UPPERCASE_SUFFIX} in $f"
  fi
done
if [ "$forbidden_hits" -eq 0 ]; then
  pass "forbidden strings (none outside the documented exceptions)"
else
  fail "forbidden strings ($forbidden_hits hit(s))"
fi

# ---------------------------------------------------------------------------
# 5. No tracked binaries, no size-budget overrun. The validators themselves have their own
#    TDD suite (scripts/tests/run-tests.sh, already run in step 1); here they run against
#    the whole repository, which is their real job.
# ---------------------------------------------------------------------------
if node "$ROOT/scripts/check-no-binaries.ts" "$ROOT"; then
  pass "no-binaries (scripts/check-no-binaries.ts)"
else
  fail "no-binaries (scripts/check-no-binaries.ts)"
fi

if node "$ROOT/scripts/check-size.ts" "$ROOT"; then
  pass "size budget (scripts/check-size.ts)"
else
  fail "size budget (scripts/check-size.ts)"
fi

# ---------------------------------------------------------------------------
# 6. No Python. This platform is zero-dependency TypeScript + POSIX sh only.
# ---------------------------------------------------------------------------
py_files=$(git ls-files | grep -E '\.(py|pyw|pyi)$' || true)
if [ -z "$py_files" ]; then
  pass "no .py files tracked"
else
  echo "$py_files" | sed 's/^/  /'
  fail "no .py files tracked"
fi

# ---------------------------------------------------------------------------
# 7. No node:20 in yml/json/md -- scoped to the repository's shipped surface (plugins/,
#    .github/, .githooks/, .devcontainer/, scripts/, docs/, root policy files, and any
#    root-level *.yml/*.yaml/*.json config file such as .pre-commit-config.yaml). The
#    ':(glob)*.ext' pathspecs match only files directly at the repo root -- '*' does not
#    cross '/' in glob-magic mode -- so they add exactly that root-level surface without
#    re-widening into openspec/ or any nested directory not already covered above.
#    openspec/ is excluded deliberately: its change proposals are read-only planning prose
#    that *describes* this very rule ("SHALL NOT reference node:20") and therefore contains
#    the literal string as a quotation, not a violation.
# ---------------------------------------------------------------------------
node20_hits=$(git ls-files \
    -- 'plugins' '.github' '.githooks' '.devcontainer' 'scripts' 'docs' '*.md' \
       ':(glob)*.yml' ':(glob)*.yaml' ':(glob)*.json' \
    | grep -v '^openspec/' \
    | grep -E '\.(yml|yaml|json|md)$' \
    | while IFS= read -r f; do grep -l 'node:20' "$f" 2>/dev/null; done || true)
if [ -z "$node20_hits" ]; then
  pass "no node:20 (shipped surface)"
else
  echo "$node20_hits" | sed 's/^/  /'
  fail "no node:20 (shipped surface)"
fi

# ---------------------------------------------------------------------------
# 8. No expanded ${CLAUDE_PLUGIN_ROOT}. An absolute filesystem path immediately followed by
#    /plugins|/skills|/hooks means some tool wrote a resolved path back into a tracked file
#    instead of leaving the token literal. openspec/ is excluded for the same reason as #7.
# ---------------------------------------------------------------------------
expanded_hits=$(git grep -nE '(/home/|/workspaces/)[^"'"'"' ]*/(plugins|skills|hooks)/' -- . ':!openspec' 2>/dev/null || true)
if [ -z "$expanded_hits" ]; then
  pass "no expanded \${CLAUDE_PLUGIN_ROOT}"
else
  echo "$expanded_hits" | sed 's/^/  /'
  fail "no expanded \${CLAUDE_PLUGIN_ROOT}"
fi

echo "================================"
if [ "$overall" -eq 0 ]; then
  echo "VERIFY-ALL: PASS"
else
  echo "VERIFY-ALL: FAIL"
fi
exit "$overall"

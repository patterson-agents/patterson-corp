#!/bin/sh
# Test harness for check-security-config.ts. POSIX sh, no dependencies.
# Usage: ./run-tests.sh    (run from anywhere)
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$DIR/../scripts/check-security-config.ts"
ASSETS="$DIR/../assets"
fail=0

expect_exit() {
  _want=$1; _path=$2; _label=$3
  node "$CHECK" "$_path" >/dev/null 2>&1
  _got=$?
  if [ "$_got" -ne "$_want" ]; then
    echo "FAIL $_label: expected exit $_want, got $_got"; fail=1
  else
    echo "ok   $_label (exit $_got)"
  fi
}

expect_rule() {
  _rule=$1; _path=$2
  if node "$CHECK" "$_path" 2>/dev/null | grep -q "|$_rule|"; then
    echo "ok   rule $_rule reported"
  else
    echo "FAIL rule $_rule NOT reported for $_path"; fail=1
  fi
}

expect_no_rule() {
  _rule=$1; _path=$2
  if node "$CHECK" "$_path" 2>/dev/null | grep -q "|$_rule|"; then
    echo "FAIL rule $_rule wrongly reported for $_path"; fail=1
  else
    echo "ok   rule $_rule correctly absent"
  fi
}

# Assert every emitted line matches LEVEL|file|line|rule|message with a known LEVEL.
expect_line_format() {
  _path=$1; _label=$2
  if node "$CHECK" "$_path" 2>/dev/null |
     grep -v '^\(ERROR\|WARN\|INFO\)|[^|]*|[0-9][0-9]*|[^|]*|' | grep -q .; then
    echo "FAIL $_label: a line did not match LEVEL|file|line|rule|message"; fail=1
  else
    echo "ok   $_label"
  fi
}

expect_file() {
  _p=$1; _label=$2
  if [ -f "$_p" ]; then echo "ok   $_label"; else echo "FAIL $_label: missing $_p"; fail=1; fi
}

expect_contains() {
  _p=$1; _pat=$2; _label=$3
  if grep -q "$_pat" "$_p" 2>/dev/null; then
    echo "ok   $_label"
  else
    echo "FAIL $_label: '$_pat' not found in $_p"; fail=1
  fi
}

expect_absent() {
  _p=$1; _pat=$2; _label=$3
  if grep -q "$_pat" "$_p" 2>/dev/null; then
    echo "FAIL $_label: '$_pat' wrongly present in $_p"; fail=1
  else
    echo "ok   $_label"
  fi
}

# ---------------------------------------------------------------- exit contract
expect_exit 0 "$DIR/compliant"          "fully configured repo passes"
expect_exit 1 "$DIR/violating"          "repo with no code scanning fails"
expect_exit 1 "$DIR/partial"            "repo with partial configuration fails"
expect_exit 2 "$DIR/does-not-exist"     "missing path is 'could not evaluate'"

expect_line_format "$DIR/violating"     "output lines are LEVEL|file|line|rule|message"

# ---------------------------------------------------------------- rule coverage
expect_rule "code-scanning/missing"           "$DIR/violating"
expect_rule "dependabot/no-github-actions"    "$DIR/violating"
expect_rule "secret-scanning/missing"         "$DIR/violating"
expect_rule "security-policy/missing"         "$DIR/violating"
expect_rule "dependabot/npm-without-manifest" "$DIR/violating"

expect_rule "dependabot/missing"              "$DIR/partial"
expect_rule "secret-scanning/no-exclusions"   "$DIR/partial"
expect_rule "code-scanning/no-language"       "$DIR/partial"

# Always advisory, on every run: server-side state and DAST coverage.
expect_rule "push-protection/unverifiable"    "$DIR/compliant"
expect_rule "coverage/dast-open"              "$DIR/compliant"

expect_no_rule "code-scanning/missing"        "$DIR/compliant"
expect_no_rule "dependabot/missing"           "$DIR/compliant"
expect_no_rule "dependabot/no-github-actions" "$DIR/compliant"
expect_no_rule "secret-scanning/missing"      "$DIR/compliant"
expect_no_rule "secret-scanning/no-exclusions" "$DIR/compliant"
expect_no_rule "security-policy/missing"      "$DIR/compliant"
expect_no_rule "code-scanning/missing"        "$DIR/partial"

# ---------------------------------------------------------------- asset templates
expect_file "$ASSETS/codeql.yml"          "asset codeql.yml exists"
expect_file "$ASSETS/dependabot.yml"      "asset dependabot.yml exists"
expect_file "$ASSETS/secret_scanning.yml" "asset secret_scanning.yml exists"
expect_file "$ASSETS/security.yml"        "asset security.yml exists"

for f in "$ASSETS"/*.yml; do
  expect_absent "$f" "node:20" "$(basename "$f") does not pin node:20"
done

expect_contains "$ASSETS/codeql.yml" "javascript-typescript" \
  "codeql.yml analyses javascript-typescript"
expect_contains "$ASSETS/codeql.yml" "files analysed" \
  "codeql.yml carries the extractor 'files analysed' caveat"

expect_contains "$ASSETS/dependabot.yml" "github-actions" \
  "dependabot.yml covers the github-actions ecosystem"
expect_absent "$ASSETS/dependabot.yml" 'package-ecosystem: *"*npm' \
  "dependabot.yml declares no npm ecosystem"

expect_contains "$ASSETS/secret_scanning.yml" "plugins/patterson-engineering/hooks/tests" \
  "secret_scanning.yml excludes the hook test fixtures"

expect_contains "$ASSETS/security.yml" "gitleaks" "security.yml runs GitLeaks"
expect_contains "$ASSETS/security.yml" "trivy"    "security.yml runs Trivy"
expect_contains "$ASSETS/security.yml" "is not DAST" \
  "security.yml disclaims DAST coverage in a comment"
expect_absent   "$ASSETS/security.yml" "^ *[a-z_-]*dast[a-z_-]*:" \
  "security.yml declares no DAST job or step"

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

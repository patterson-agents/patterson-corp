#!/bin/sh
# Test harness for check-pipeline.ts. POSIX sh, no dependencies.
# Usage: ./run-tests.sh    (run from anywhere)
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$DIR/../scripts/check-pipeline.ts"
fail=0

expect_exit() {
  _want=$1; _path=$2; _label=$3
  node "$CHECK" "$_path" >/tmp/pe_out.$$ 2>/dev/null
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

expect_exit 0 "$DIR/compliant/azure-pipelines.yml" "compliant pipeline passes"
expect_exit 1 "$DIR/violating/github-workflow.yml" "violating pipeline fails"
expect_exit 2 "$DIR/does-not-exist.yml"            "missing path is 'could not evaluate'"

expect_rule "required-scan/sast"              "$DIR/violating/github-workflow.yml"
expect_rule "required-scan/dast"              "$DIR/violating/github-workflow.yml"
expect_rule "required-scan/container-scanning" "$DIR/violating/github-workflow.yml"
expect_rule "service-connection/not-federated" "$DIR/violating/github-workflow.yml"
expect_rule "secrets/inline"                  "$DIR/violating/github-workflow.yml"
expect_rule "build/one-build-many-artifacts"  "$DIR/violating/github-workflow.yml"

expect_no_rule "required-scan/sast"           "$DIR/compliant/azure-pipelines.yml"
expect_no_rule "secrets/inline"               "$DIR/compliant/azure-pipelines.yml"

rm -f /tmp/pe_out.$$
[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

#!/bin/sh
# Test harness for check-storage.ts. POSIX sh, no dependencies.
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$DIR/../scripts/check-storage.ts"
fail=0
expect_exit() { _w=$1; _p=$2; _l=$3; node "$CHECK" "$_p" >/dev/null 2>&1; _g=$?
  if [ "$_g" -ne "$_w" ]; then echo "FAIL $_l: expected $_w got $_g"; fail=1; else echo "ok   $_l (exit $_g)"; fi; }
expect_rule() { _r=$1; _p=$2
  if node "$CHECK" "$_p" 2>/dev/null | grep -q "|$_r|"; then echo "ok   rule $_r reported";
  else echo "FAIL rule $_r NOT reported for $_p"; fail=1; fi; }
expect_no_rule() { _r=$1; _p=$2
  if node "$CHECK" "$_p" 2>/dev/null | grep -q "|$_r|"; then echo "FAIL rule $_r wrongly reported for $_p"; fail=1;
  else echo "ok   rule $_r correctly absent"; fi; }

expect_exit 0 "$DIR/compliant/storage.tf"            "compliant storage passes"
expect_exit 1 "$DIR/violating/storage.tf"            "violating storage fails"
expect_exit 1 "$DIR/violating/bad-classification.tf" "invalid classification fails"
expect_exit 2 "$DIR/nope.tf"                         "missing path is 'could not evaluate'"

expect_rule "network/public-access"        "$DIR/violating/storage.tf"
expect_rule "identity/shared-keys"         "$DIR/violating/storage.tf"
expect_rule "encryption/https-only"        "$DIR/violating/storage.tf"
expect_rule "encryption/tls"               "$DIR/violating/storage.tf"
expect_rule "classification/missing-tag"   "$DIR/violating/storage.tf"
expect_rule "identity/sas-no-expiry"       "$DIR/violating/storage.tf"
expect_rule "classification/invalid-value" "$DIR/violating/bad-classification.tf"

expect_no_rule "classification/missing-tag"     "$DIR/compliant/storage.tf"
expect_no_rule "network/public-access"          "$DIR/compliant/storage.tf"
expect_no_rule "classification/private-endpoint" "$DIR/compliant/storage.tf"

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

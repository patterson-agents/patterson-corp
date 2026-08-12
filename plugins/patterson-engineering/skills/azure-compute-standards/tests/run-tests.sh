#!/bin/sh
# Test harness for check-compute.ts. POSIX sh, no dependencies.
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$DIR/../scripts/check-compute.ts"
fail=0
expect_exit() { _w=$1; _p=$2; _l=$3; node "$CHECK" "$_p" >/dev/null 2>&1; _g=$?
  if [ "$_g" -ne "$_w" ]; then echo "FAIL $_l: expected $_w got $_g"; fail=1; else echo "ok   $_l (exit $_g)"; fi; }
expect_rule() { _r=$1; _p=$2
  if node "$CHECK" "$_p" 2>/dev/null | grep -q "|$_r|"; then echo "ok   rule $_r reported";
  else echo "FAIL rule $_r NOT reported for $_p"; fail=1; fi; }
expect_no_rule() { _r=$1; _p=$2
  if node "$CHECK" "$_p" 2>/dev/null | grep -q "|$_r|"; then echo "FAIL rule $_r wrongly reported for $_p"; fail=1;
  else echo "ok   rule $_r correctly absent"; fi; }

expect_exit 0 "$DIR/compliant/vm.tf"          "compliant VM passes"
expect_exit 1 "$DIR/violating/bad.tf"         "violating terraform fails"
expect_exit 1 "$DIR/violating/deployment.yaml" "violating k8s manifest fails"
expect_exit 2 "$DIR/nope.tf"                  "missing path is 'could not evaluate'"

expect_rule "network/public-ip"            "$DIR/violating/bad.tf"
expect_rule "network/missing-nsg"          "$DIR/violating/bad.tf"
expect_rule "compute/aci"                  "$DIR/violating/bad.tf"
expect_rule "appservice/wildcard-cors"     "$DIR/violating/bad.tf"
expect_rule "tls/below-1-2"                "$DIR/violating/bad.tf"
expect_rule "appservice/ftp"               "$DIR/violating/bad.tf"
expect_rule "vm/secure-boot"               "$DIR/violating/bad.tf"
expect_rule "aks/nodeport"                 "$DIR/violating/deployment.yaml"
expect_rule "aks/privileged"               "$DIR/violating/deployment.yaml"
expect_rule "aks/cap-sys-admin"            "$DIR/violating/deployment.yaml"
expect_rule "aks/readonly-rootfs"          "$DIR/violating/deployment.yaml"
expect_rule "aks/default-namespace"        "$DIR/violating/deployment.yaml"
expect_rule "aks/automount-token"          "$DIR/violating/deployment.yaml"

expect_no_rule "network/public-ip"   "$DIR/compliant/vm.tf"
expect_no_rule "network/missing-nsg" "$DIR/compliant/vm.tf"
expect_no_rule "vm/vtpm"             "$DIR/compliant/vm.tf"

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

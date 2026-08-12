#!/bin/sh
# Test harness for check-tooling.ts. POSIX sh, no dependencies.
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$DIR/../scripts/check-tooling.ts"
fail=0
expect_exit() { _w=$1; _p=$2; _l=$3; node "$CHECK" "$_p" >/dev/null 2>&1; _g=$?
  if [ "$_g" -ne "$_w" ]; then echo "FAIL $_l: expected $_w got $_g"; fail=1; else echo "ok   $_l (exit $_g)"; fi; }
expect_match() { _pat=$1; _p=$2; _l=$3
  if node "$CHECK" "$_p" 2>/dev/null | grep -q "$_pat"; then echo "ok   $_l";
  else echo "FAIL $_l (pattern '$_pat' not found for $_p)"; fail=1; fi; }

expect_exit 0 "$DIR/compliant/ci.yml"               "approved-only CI passes"
expect_exit 0 "$DIR/compliant/approval-required.yml" "approval-required tools are WARN not ERROR"
expect_exit 1 "$DIR/violating/ci.yml"               "unlisted tooling fails"
expect_exit 0 "trivy"                               "tool-name lookup: trivy"
expect_exit 1 "snyk"                                "tool-name lookup: snyk"
expect_exit 1 "some-tool-nobody-has-heard-of"       "tool-name lookup: unknown"
expect_exit 2 "./this/path/does/not/exist"          "missing path is 'could not evaluate'"

expect_match "^OK|.*approved-software/trivy.*Owner: AppSec"       "trivy"      "trivy is approved, owned by AppSec"
expect_match "^OK|.*approved-software/terraform.*Infra CloudOps"  "terraform"  "terraform is approved, owned by Infra CloudOps"
expect_match "^OK|.*PUBLIC REPOS REQUIRE APPROVAL"                "github"     "github carries the public-repo caveat"
expect_match "^WARN|.*APPROVAL REQUIRED"                          "checkmarx"  "checkmarx requires approval"
expect_match "^WARN|.*APPROVAL REQUIRED"                          "pagerduty"  "pagerduty requires approval"
expect_match "approved-software/unlisted"                         "snyk"       "snyk reported as unlisted"
expect_match "approved-software/unknown"    "some-tool-nobody-has-heard-of"    "unknown tool reported as unknown"

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

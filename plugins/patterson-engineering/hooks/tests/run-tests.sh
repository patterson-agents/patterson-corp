#!/bin/sh
# Test harness for the PreToolUse guard hook. POSIX sh, no dependencies.
set -u
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD="$DIR/../scripts/pretooluse-guard.ts"
fail=0

# run <payload-file> -> prints stdout
run() {
  PATTERSON_ENGINEERING_HOOKS="${HOOKS_ENV:-}" \
  PATTERSON_ENGINEERING_BASE_IMAGE_ENFORCE="${IMAGE_ENFORCE:-}" \
  node "$GUARD" < "$DIR/$1" 2>/dev/null
}

expect_deny() {
  if run "$1" | grep -q '"permissionDecision": *"deny"'; then echo "ok   $2 -> deny"
  else echo "FAIL $2 -> expected deny"; fail=1; fi
}
expect_allow() {
  if run "$1" | grep -q '"permissionDecision"'; then echo "FAIL $2 -> unexpected deny"; fail=1
  else echo "ok   $2 -> allow"; fi
}

expect_deny  payload-secret.json           "AWS key in source file"
expect_deny  payload-connstring.json       "Azure Storage connection string"
# Base-image checking is ADVISORY by default: the Azure Compute Standards require
# "approved base images" but never enumerate an approved container registry or image
# list, so blocking would enforce a rule Patterson has not written. Opt in with
# PATTERSON_ENGINEERING_BASE_IMAGE_ENFORCE=on.
expect_allow payload-dockerfile-bad.json   "unapproved base image -> advisory by default"
expect_allow payload-dockerfile-good.json  "mcr.microsoft.com base image"

IMAGE_ENFORCE=on
expect_deny  payload-dockerfile-bad.json   "ENFORCE=on: unapproved base image blocked"
expect_allow payload-dockerfile-good.json  "ENFORCE=on: approved base image still allowed"
IMAGE_ENFORCE=
expect_allow payload-dockerfile-stage.json "multi-stage FROM alias"
expect_allow payload-placeholder.json      "placeholder secret in docs"
expect_allow payload-test-fixture.json     "secret-like string under tests/"
expect_allow payload-advisory.json         "public IP terraform (advisory only)"

# Off-switch: nothing may be denied.
HOOKS_ENV=off
expect_allow payload-secret.json         "OFF SWITCH: secret not blocked"
expect_allow payload-dockerfile-bad.json "OFF SWITCH: base image not blocked"
HOOKS_ENV=

# ---------------------------------------------------------------------------
# house-standards-guard.ts: the June 2026 supply-chain denylist. Same payload
# shape, same off switch.
# ---------------------------------------------------------------------------
HOUSE="$DIR/../scripts/house-standards-guard.ts"

run_house() {
  PATTERSON_ENGINEERING_HOOKS="${HOOKS_ENV:-}" \
  node "$HOUSE" < "$DIR/$1" 2>/dev/null
}

house_deny() {
  if run_house "$1" | grep -q '"permissionDecision": *"deny"'; then echo "ok   $2 -> deny"
  else echo "FAIL $2 -> expected deny"; fail=1; fi
}
house_allow() {
  if run_house "$1" | grep -q '"permissionDecision"'; then echo "FAIL $2 -> unexpected deny"; fail=1
  else echo "ok   $2 -> allow"; fi
}

# Toolchain choice is not enforced: Python, npm/pnpm/yarn and foreign lockfiles are all
# allowed. The guard's only remaining job is the supply-chain denylist.
house_allow payload-bash-python.json        "python3 in command position"
house_allow payload-bash-pip-chained.json   "pip behind cd/env-assignment/sudo"
house_allow payload-bash-npm.json           "npm install"
house_allow payload-bash-bun.json           "bun add / bun run"
house_allow payload-bash-query.json         "command -v python, which npm, npm-ish URL"
house_allow payload-write-py.json           "writing a .py file"
house_allow payload-write-lockfile.json     "writing pnpm-lock.yaml"

house_deny  payload-bash-denylist.json      "denylisted package even via bun"
house_allow payload-write-denylist-docs.json "denylist named in a .md doc"
house_deny  payload-write-denylist-code.json "denylisted dependency in package.json"

# Off-switch: nothing may be denied by the house guard either.
HOOKS_ENV=off
house_allow payload-bash-denylist.json "OFF SWITCH: denylisted package not blocked"
HOOKS_ENV=

# ---------------------------------------------------------------------------
# no-tmp-guard.ts: nothing is created or stored under a system temp directory;
# project-local .tmp/, .claude/, .config/ instead. Same payload shape, same
# off switch.
# ---------------------------------------------------------------------------
NOTMP="$DIR/../scripts/no-tmp-guard.ts"

run_notmp() {
  PATTERSON_ENGINEERING_HOOKS="${HOOKS_ENV:-}" \
  node "$NOTMP" < "$DIR/$1" 2>/dev/null
}

notmp_deny() {
  if run_notmp "$1" | grep -q '"permissionDecision": *"deny"'; then echo "ok   $2 -> deny"
  else echo "FAIL $2 -> expected deny"; fail=1; fi
}
notmp_allow() {
  if run_notmp "$1" | grep -q '"permissionDecision"'; then echo "FAIL $2 -> unexpected deny"; fail=1
  else echo "ok   $2 -> allow"; fi
}

notmp_deny  payload-bash-tmp.json    "bash command referencing a system temp path"
notmp_allow payload-bash-dottmp.json "bash command using project-local .tmp/"
notmp_deny  payload-write-tmp.json   "writing a file under a system temp path"
notmp_allow payload-write-dottmp.json "writing under a project-local .tmp/"

# Off-switch: nothing may be denied by the no-tmp guard either.
HOOKS_ENV=off
notmp_allow payload-bash-tmp.json  "OFF SWITCH: system temp path not blocked"
HOOKS_ENV=

# ---------------------------------------------------------------------------
# secrets-scan-guard.ts: TruffleHog + Trivy over the pending content. The
# scanners are external binaries and the guard is FAIL-OPEN when they are
# absent, so the deny expectations only run when at least one is installed
# (CI runners without the scanners exercise the fail-open path instead).
# ---------------------------------------------------------------------------
SCAN="$DIR/../scripts/secrets-scan-guard.ts"

run_scan() {
  PATTERSON_ENGINEERING_HOOKS="${HOOKS_ENV:-}" \
  node "$SCAN" < "$DIR/$1" 2>/dev/null
}

scan_deny() {
  if run_scan "$1" | grep -q '"permissionDecision": *"deny"'; then echo "ok   $2 -> deny"
  else echo "FAIL $2 -> expected deny"; fail=1; fi
}
scan_allow() {
  if run_scan "$1" | grep -q '"permissionDecision"'; then echo "FAIL $2 -> unexpected deny"; fail=1
  else echo "ok   $2 -> allow"; fi
}

if command -v trivy >/dev/null 2>&1 || command -v trufflehog >/dev/null 2>&1; then
  scan_deny  payload-secret.json           "scanner flags AWS key in source file"
  scan_allow payload-secrets-clean.json    "clean content passes the scanners"
  scan_allow payload-secrets-fixture.json  "synthetic secret under tests/ exempt"
  HOOKS_ENV=off
  scan_allow payload-secret.json           "OFF SWITCH: scanner finding not blocked"
  HOOKS_ENV=
else
  # Fail-open contract: with no scanner installed, nothing may be denied.
  scan_allow payload-secret.json           "no scanners installed -> fail-open allow"
  echo "note  trufflehog/trivy not installed; deny-path assertions skipped"
fi

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

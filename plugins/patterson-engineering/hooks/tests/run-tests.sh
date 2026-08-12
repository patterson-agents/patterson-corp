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
# house-standards-guard.ts: no Python, bun-only package management, and the
# June 2026 supply-chain denylist. Same payload shape, same off switch.
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

house_deny  payload-bash-python.json        "python3 in command position"
house_deny  payload-bash-pip-chained.json   "pip behind cd/env-assignment/sudo"
house_deny  payload-bash-npm.json           "npm install"
house_allow payload-bash-bun.json           "bun add / bun run"
house_allow payload-bash-query.json         "command -v python, which npm, npm-ish URL"
house_deny  payload-bash-denylist.json      "denylisted package even via bun"
house_deny  payload-write-py.json           "writing a .py file"
house_deny  payload-write-lockfile.json     "writing pnpm-lock.yaml"
house_allow payload-write-denylist-docs.json "denylist named in a .md doc"
house_deny  payload-write-denylist-code.json "denylisted dependency in package.json"

# Off-switch: nothing may be denied by the house guard either.
HOOKS_ENV=off
house_allow payload-bash-python.json  "OFF SWITCH: python not blocked"
house_allow payload-write-py.json     "OFF SWITCH: .py write not blocked"
HOOKS_ENV=

[ "$fail" -eq 0 ] && echo "ALL TESTS PASSED" || echo "TESTS FAILED"
exit "$fail"

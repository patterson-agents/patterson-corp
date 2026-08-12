## Why

Daniel directed that Patterson's house standards be **hard enforced** for AI coding agents
(Claude Code and GitHub Copilot) across the organization, not merely documented. Today the
platform documents the standards (CONTRIBUTING.md, `.github/copilot-instructions.md`, the
patterson-engineering skills) and ships one narrow PreToolUse guard (secrets, Dockerfile base
images), but the highest-frequency house rules — no Python, bun as the only package manager,
and the June 2026 AUR supply-chain denylist — have no in-session enforcement at all, and
`openspec/specs/settings/managed-layering/spec.md` explicitly holds `managed-settings.d/` to an
advisory-only posture "until enforcement is separately approved". That approval has now been
given. This change is the corp-side implementation: a second PreToolUse guard covering the
Bash, Write, and Edit tools, and the flip of the enterprise settings layer from advisory to
enforcing.

## What Changes

- **New hook script** `plugins/patterson-engineering/hooks/scripts/house-standards-guard.ts`,
  registered in `hooks.json` for `Bash` and alongside the existing guard for `Write|Edit`.
  Hard-blocks, with the existing `PATTERSON_ENGINEERING_HOOKS=off` escape hatch and the same
  fail-open error posture:
  - Python toolchain invocations in Bash commands (`python`, `pip`, `pipx`, `uv`, `poetry`,
    `conda`, `virtualenv`) and Write/Edit of `.py`/`.pyw`/`.pyi` files.
  - Non-bun package managers in Bash commands (`npm`, `pnpm`, `yarn`, `npx`) and Write/Edit of
    foreign lockfiles (`package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`,
    `pnpm-lock.yaml`).
  - The supply-chain denylist (the four June 2026 AUR-attack packages and the `herbsobering`
    publisher) anywhere in a Bash command or in non-exempt file content.
- **Test suite extension**: `plugins/patterson-engineering/hooks/tests/run-tests.sh` gains
  fixtures and assertions for the new guard, written before the implementation.
- **Enterprise layer enforcement**: `managed-settings.d/10-enterprise.json` gains
  `permissions.deny` rules mirroring the Bash and lockfile blocks. This flips the
  `settings/managed-layering` capability's "Advisory-only posture" requirement, which existed
  precisely to await this approval.
- **Documentation**: `docs/architecture/layered-settings.md`'s advisory banner is updated;
  `AGENTS.md`'s "Nothing there is enforced" line is corrected; a new
  `docs/architecture/org-enforcement.md` records the three-tier enforcement model (in-session
  hooks, managed settings, CI/branch protection) and the activation runbook for the parts that
  live outside this repository.
- **Version bump**: `patterson-engineering` `0.2.0` -> `0.3.0` in both `plugin.json` and
  `.claude-plugin/marketplace.json`, with `scripts/sync-manifests.sh` re-run.

## Capabilities

### New Capabilities

- `engineering-skills/house-standards-guard`: the behavior contract for the new PreToolUse
  guard — what it blocks, what it must never block, the off switch, and the fail-open rule.

### Modified Capabilities

- `settings/managed-layering`: the "Advisory-only posture" requirement is replaced by an
  "Enterprise enforcement posture" requirement permitting `permissions.deny` in
  `10-enterprise.json` under the now-granted approval, while still forbidding
  `strictKnownMarketplaces` (marketplace lockdown remains unapproved).

## Non-goals

- **No emoji or brand-voice blocking.** Those rules stay advisory/instructional; a content
  block would be a false-positive machine.
- **No `strictKnownMarketplaces` and no `blockedMarketplaces`.** Marketplace lockdown is a
  separate decision with its own blast radius; the modified requirement keeps it forbidden.
- **No shell parsing beyond token-level segmentation.** The guard splits commands on shell
  separators and checks command-position tokens; it does not evaluate quoted subshell strings
  (`bash -c '...'`). CI and managed settings are the backstop layers, and the limitation is
  documented in the guard's header.
- **No changes to the existing `pretooluse-guard.ts`** beyond registering the new script next
  to it. Secrets and base-image behavior are untouched.
- **No changes outside this repository.** The workspace `.claude/` wiring, the org `.github`
  repository's reusable standards-gate workflow, and `.vscode` settings are sibling
  workstreams this proposal documents in `org-enforcement.md` but does not implement here.
- **No deployment.** Placing `managed-settings.d/` output at `/etc/claude-code/` on developer
  machines, creating the GitHub org ruleset, and pasting the org Copilot instructions into
  organization settings are activation steps for the platform owner, recorded in the runbook.

## Impact

- `plugins/patterson-engineering/hooks/`: new script, extended `hooks.json`, extended test
  suite with new payload fixtures.
- `managed-settings.d/10-enterprise.json`: gains `permissions.deny`.
- `docs/architecture/layered-settings.md`, `AGENTS.md`, `docs/architecture/org-enforcement.md`
  (new).
- `plugins/patterson-engineering/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `.github/plugin/marketplace.json` (via
  `sync-manifests.sh`).
- Consumers: any repo enabling `patterson-engineering@patterson-corp` picks up the new guard
  on its next plugin update once this lands on `main`.

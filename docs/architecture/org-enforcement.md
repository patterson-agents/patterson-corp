# Organization-wide standards enforcement

How Patterson's house standards are hard-enforced for AI coding agents (Claude Code, GitHub
Copilot) and where each enforcement tier actually binds. Authored under the
`add-house-standards-enforcement` OpenSpec change.

## The rules being enforced

| Rule | Source |
| --- | --- |
| No Python toolchain (interpreters, pip/pipx/uv/poetry/conda/virtualenv, `.py` files) | House toolchain policy; `verify-all.sh` step 6 |
| bun is the only package manager (no npm/pnpm/yarn/npx; no foreign lockfiles) | House toolchain policy |
| Supply-chain denylist: the four June 2026 AUR-attack npm packages and their publisher | Socket lockdown policy |
| No hardcoded secrets | CI/CD Pipeline Standards (existing `pretooluse-guard.ts`) |
| Approved Dockerfile base images | Azure Compute Standards (existing guard, advisory by default) |

## Three tiers, weakest to strongest

Hard enforcement is not one mechanism. Each tier below binds a different failure mode; all
three together are the actual guarantee.

### Tier 1 — in-session plugin hooks (this repository)

`plugins/patterson-engineering/hooks/` ships two `PreToolUse` guards:

- `pretooluse-guard.ts` (`Write|Edit`): secrets, Dockerfile base images.
- `house-standards-guard.ts` (`Bash|Write|Edit`): Python toolchain, non-bun package
  managers, foreign lockfiles, the supply-chain denylist.

Any repository or machine that enables `patterson-engineering@patterson-corp` gets both.
`PATTERSON_ENGINEERING_HOOKS=off` disables blocking (would-block notes still print); both
guards fail open on internal error. This tier is strong friction with a clear message, not a
security boundary — a user can disable the plugin.

### Tier 2 — managed settings (unbypassable inside Claude Code)

`managed-settings.d/10-enterprise.json` carries `permissions.deny` rules mirroring the
guard's Bash and lockfile blocks. Managed settings cannot be overridden by user or project
settings — but only once deployed. **Activation (platform owner, per machine or via MDM):**
merge the `managed-settings.d/` layers in filename order and place the result at the
platform's managed settings path (Linux: `/etc/claude-code/managed-settings.json`; macOS:
`/Library/Application Support/ClaudeCode/managed-settings.json`). Until that deployment, this
tier enforces nothing. See `docs/architecture/layered-settings.md` for merge semantics.

### Tier 3 — CI and branch protection (binds even a hostile machine)

The org `.github` repository (`patterson-agents/.github`) ships a reusable
`standards-gate.yml` workflow (no Python files, no foreign lockfiles, no denylisted
packages in manifests) that any repository calls with one `uses:` line. **Activation
(org owner):** create a GitHub organization ruleset requiring the standards-gate check on
default branches, so a repository cannot merge around it. Until the ruleset exists, the gate
runs only where a repository opts in.

## Copilot-side instructions

Copilot has no hook mechanism; its enforcement is Tier 3 plus instructions:

- **Repository level**: each repo's `.github/copilot-instructions.md` (this repository already
  has one). Path-scoped `.github/instructions/*.instructions.md` files are also supported.
- **Organization level**: GitHub only supports org-wide custom instructions via
  **organization settings -> Copilot -> Custom instructions** (they apply to Copilot Chat,
  code review, and the cloud coding agent on github.com; they are not read from the
  `.github` repository). The canonical text to paste lives in the org `.github` repository
  at `copilot-org-instructions.md`. **Activation (org owner):** paste it into that settings
  page and keep the two in sync when it changes.
- **VS Code**: the workspace `.vscode/settings.json` enables instruction files and requires
  manual approval for python/npm/pnpm/yarn terminal commands via
  `chat.tools.terminal.autoApprove`. That is friction, not enforcement.

## Activation checklist (the parts no repository file can do)

0. **Inventory first.** Run the gate's three greps against every org repository before the
   ruleset goes mandatory — tracked Python files (`git ls-files | grep -E '\.(py|pyw|pyi)$'`),
   foreign lockfiles, and denylisted names in manifests. The org is mid Python-to-TypeScript
   migration, so several repositories will hard-fail the gate; make the ruleset mandatory only
   after the inventory is clean or each failure is triaged. Skipping this step turns rollout
   into an org-wide CI outage.
1. Deploy merged managed settings to developer machines (Tier 2 goes live).
2. Create the org ruleset requiring the standards-gate check (Tier 3 becomes mandatory).
3. Paste `copilot-org-instructions.md` into organization Copilot settings.
4. Push this repository and bump consumers so the new plugin hooks propagate — until then,
   the marketplace still serves `patterson-engineering` without the house guard.

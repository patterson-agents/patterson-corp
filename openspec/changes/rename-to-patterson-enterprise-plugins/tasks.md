## 1. Governance and record

- [x] 1.1 Author the `marketplaces/enterprise-identity` capability spec (this change's delta)
- [x] 1.2 Record `docs/decisions/0006-marketplace-rename-to-enterprise-plugins.md`, Accepted, with the
      old/new identity mapping, the breaking-change analysis, and the historical-record preservation
      policy
- [x] 1.3 Add the ADR to the `docs/index.html` decision index

## 2. Manifests and configuration

- [x] 2.1 Set `.claude-plugin/marketplace.json` `name` to `patterson-enterprise-plugins`; leave both
      plugin `name` values untouched
- [x] 2.2 Run `sh scripts/sync-manifests.sh` and confirm `--check` reports the two manifests
      byte-identical
- [x] 2.3 Update `homepage` and `repository` in `plugins/patterson-engineering/.claude-plugin/plugin.json`
      and `plugins/patterson-brand/.claude-plugin/plugin.json`
- [x] 2.4 Update the marketplace key, `source.repo`, and `enabledPlugins` keys in `.claude/settings.json`
- [x] 2.5 Update the same keys in `managed-settings.d/10-enterprise.json`, `30-department.json`, and
      `40-team.json`
- [x] 2.6 Update `.devcontainer/devcontainer.json` `name`
- [x] 2.7 Update both blob URLs in `.github/ISSUE_TEMPLATE/config.yml`

## 3. Reading surfaces

- [x] 3.1 `README.md`: heading, banner (switch to `docs/assets/banner.svg`, update alt text), install
      commands, layered-model and topology prose, catalog table, repository-layout tree, and a new
      migration note giving both qualified install identities
- [x] 3.2 `CONTRIBUTING.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `SECURITY.md`,
      `CODE_OF_CONDUCT.md`, `CODEOWNERS`, `REFERENCES.md`
- [x] 3.3 `plugins/patterson-engineering/README.md` and `plugins/patterson-brand/README.md` install
      snippets and settings examples
- [x] 3.4 `plugins/patterson-brand/skills/brand-identity/references/DESIGN.md` project ID
- [x] 3.5 `docs/architecture/layered-settings.md` and `docs/architecture/org-enforcement.md`
- [x] 3.6 `docs/index.html` title, heading, and GitHub links
- [x] 3.7 `docs/diagrams/marketplace-topology.svg` node label (verified it still fits its box)
- [x] 3.8 `docs/assets/banner.svg` wordmark and `aria-label`; delete `docs/assets/banner.webp` and
      drop its copy step from `.github/workflows/pages.yml`
- [x] 3.9 `scripts/verify-all.sh` header comment and banner echo; `.githooks/pre-commit` header comment
- [x] 3.10 `scripts/build-site-content.ts` blob base, source-of-truth footer, install snippet, and
      catalog description
- [x] 3.11 `site/package.json` name, `site/astro.config.mjs` title and edit-link base, `site/README.md`,
      and `site/src/content/docs/index.mdx` hero, install block, and layered-model prose

## 4. Specifications and in-flight changes

- [x] 4.1 Update the repository references in `openspec/specs/marketplaces/siblings/spec.md`,
      `marketplaces/name-reconciliation/spec.md`, `settings/managed-layering/spec.md`,
      `cli/marketplace-emission/spec.md`, `design/token-imports/spec.md`, and
      `repo-standard/quality-baseline/spec.md`
- [x] 4.2 Update `openspec/config.yaml`'s project context
- [x] 4.3 Update the in-flight changes `openspec/changes/add-branded-doc-sites/` and
      `openspec/changes/add-house-standards-enforcement/`
- [x] 4.4 Confirm `openspec/changes/archive/**` and `docs/decisions/0001`–`0005` are untouched, per
      the preservation policy

## 5. Follow-ups that require a remote operation (not executable from this repository)

- [ ] 5.1 Rename the GitHub repository `patterson-agents/patterson-corp` to
      `patterson-agents/patterson-enterprise-plugins` (Settings > General > Repository name). Until
      this runs, every updated slug in this change points at a repository that does not resolve
- [ ] 5.2 Confirm `corp.patterson.sh` still serves after the rename (the Pages custom domain is
      bound to the repository, and a rename can drop the `CNAME` binding)
- [ ] 5.3 `patterson-agents/.github`: update `AGENTS.md`, `copilot-org-instructions.md`,
      `profile/README.md`, and `.github/workflows/standards-gate.yml`
- [ ] 5.4 `patterson-agents/patterson-skills`: update `README.md`, `CONTRIBUTING.md`, `REFERENCES.md`,
      and `.claude/settings.json`
- [ ] 5.5 `patterson-agents/patterson-labs`: update `docs/promotion-path.md`, which names this
      repository as the promotion destination, plus any `.claude/settings.json` or
      `managed-settings.d/` keys
- [ ] 5.6 `patterson-agents/patterson-dental` and `patterson-agents/patterson-vet`: update any
      `extraKnownMarketplaces` / `enabledPlugins` keys naming the enterprise catalog
- [ ] 5.7 `patterson-agents/cli`, `patterson-agents/design-plugins`, and
      `patterson-agents/patterson-platform-docs`: sweep for the old slug and marketplace name
- [ ] 5.8 Announce the migration so consumers re-add the marketplace and re-enable both plugins under
      their new qualified identities
- [ ] 5.9 Recapture `docs/screenshots/site-home.webp` once the renamed site has redeployed

## 6. Verification

- [x] 6.1 `sh scripts/verify-all.sh` exits `0`
- [x] 6.2 `sh scripts/sync-manifests.sh --check` exits `0`
- [x] 6.3 `node -e` parse check on every edited JSON file
- [ ] 6.4 `openspec validate --all --strict --no-interactive` — **the `openspec` CLI is not installed
      in this devcontainer**, so this step is recorded as not run rather than silently skipped

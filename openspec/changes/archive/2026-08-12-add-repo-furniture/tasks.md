## 1. Assess the template sources

- [ ] 1.1 Read `patterson-sh/templates/` and the KEEP/ADAPT verdicts in `.tmp/staging/reuse/`
- [ ] 1.2 List every template element that carries a `package.json`, `.mjs`, or dependency assumption and must be rewritten
- [ ] 1.3 Confirm the tracked-byte baseline for `patterson-corp` per correction C4 (547 KB, not the 1.2 MB `du` figure)

## 2. Validators, tests first

- [ ] 2.1 Create fixtures: a compliant tree, an oversized tree, a tree containing a `.woff2`, and an unreadable path
- [ ] 2.2 Write the failing tests for `check-size.ts` covering exit `0`, `1`, and `2`
- [ ] 2.3 Write the failing tests for `check-no-binaries.ts` covering exit `0`, `1`, and `2`
- [ ] 2.4 Implement `scripts/check-size.ts` measuring tracked bytes via `git ls-files`, erasable syntax, `node:` builtins only
- [ ] 2.5 Implement `scripts/check-no-binaries.ts` with the same conventions
- [ ] 2.6 Confirm both emit `LEVEL|file|line|rule|message` and the suites pass

## 3. Policy documents

- [ ] 3.1 Write `CONTRIBUTING.md` covering zero-dependency TypeScript, `node:24`, conventional commits, no binaries, and literal `${CLAUDE_PLUGIN_ROOT}`
- [ ] 3.2 Write `CODE_OF_CONDUCT.md`
- [ ] 3.3 Write `SECURITY.md`, including the vulnerability reporting route
- [ ] 3.4 Write `CODEOWNERS` covering every top-level path
- [ ] 3.5 Record in `CONTRIBUTING.md` that `LICENSE` is deliberately absent pending a legal ruling and that manifests declare `UNLICENSED`

## 4. GitHub templates and configuration

- [ ] 4.1 Write `.github/ISSUE_TEMPLATE/` bug, feature, new-plugin-proposal, new-skill-proposal, and `config.yml`
- [ ] 4.2 Write `.github/pull_request_template.md` including the two-approver requirement
- [ ] 4.3 Write `.github/copilot-instructions.md` mirroring the contributing conventions
- [ ] 4.4 Write `.github/copilot-setup-steps.yml` with no package manifest or dependency install
- [ ] 4.5 Write `.github/secret_scanning.yml` excluding `plugins/patterson-engineering/hooks/tests/`

## 5. Hooks and CI

- [ ] 5.1 Write `.githooks/pre-commit` running every test suite and `verify-theme.sh`
- [ ] 5.2 Write `.pre-commit-config.yaml` wiring the same checks
- [ ] 5.3 Write `.github/workflows/ci.yml`: manifest validation, all suites, tracked-byte 1 MiB budget, no-binaries assert
- [ ] 5.4 Confirm `ci.yml` contains no manifest-projection check and no security-scanning job
- [ ] 5.5 Confirm no file in this change references `node:20`

## 6. Gate battery and devcontainer

- [ ] 6.1 Write `scripts/verify-all.sh` chaining suites, theme round-trip, `verify-theme.sh`, skill name-equals-directory, forbidden strings, no binaries, tracked-byte budget, and literal `${CLAUDE_PLUGIN_ROOT}`
- [ ] 6.2 Confirm `verify-all.sh` exits non-zero when any single component fails
- [ ] 6.3 Write `.devcontainer/devcontainer.json` on a pinned `node:24`-family image

## 7. README and verification

- [ ] 7.1 Upgrade `README.md` to the house style: centred header with an SVG mark, shields.io badges, GFM alerts, tables, a mermaid or hand-authored SVG diagram, `<details>` sections
- [ ] 7.2 Confirm the README adds no raster assets and no emoji
- [ ] 7.3 Run `sh scripts/verify-all.sh` and confirm a clean pass
- [ ] 7.4 Confirm no `LICENSE` file was added and no remote operation was performed

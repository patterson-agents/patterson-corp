## 1. Establish the baseline definition

- [ ] 1.1 Record the repository list in scope: corp, labs, dental, vet, platform-docs, marketplace, skills, the design-plugins fork, and cli
- [ ] 1.2 Record which repositories are covered by other changes (corp by `add-repo-furniture`; labs, dental, vet by `populate-sibling-marketplaces`; the fork by `fork-design-plugins`) and which this change covers directly
- [ ] 1.3 Read the devcontainer precedents in `patterson-design-plugins/.devcontainer/` and `patterson-sh/templates/`
- [ ] 1.4 Confirm the installed gh-aw version and the version the design-plugins locks were compiled with

## 2. READMEs

- [ ] 2.1 Author or upgrade each repository's `README.md` to the house style: centred SVG header, shields.io badges, GFM alerts, tables, a mermaid or SVG diagram, `<details>` sections
- [ ] 2.2 Use the design-plugins fork's nine existing optimized PNGs in its README
- [ ] 2.3 Confirm no new raster asset was generated in any repository
- [ ] 2.4 Record the README-imagery deviation from the no-binaries rule

## 3. Devcontainers

- [ ] 3.1 Add `.devcontainer/devcontainer.json` on a pinned `node:24`-family image to each marketplace and docs repository
- [ ] 3.2 Add the Bun-flavored variant to `cli/`
- [ ] 3.3 Grep every repository for `node:20` and confirm zero hits

## 4. Tests and CI

- [ ] 4.1 Confirm each marketplace repository has a zero-dependency `run-tests.sh` covering manifest validation, skill name equals directory, size, and forbidden content
- [ ] 4.2 Confirm `cli/` runs `bun test` through `bun run gate`
- [ ] 4.3 Confirm each repository's CI workflow invokes that repository's own test entry point
- [ ] 4.4 Confirm tests were written before the checks they cover, per the TDD ordering rule
- [ ] 4.5 Add tests to any repository in scope that still lacks an entry point

## 5. gh-aw initialization

- [ ] 5.1 Run `gh aw init --engine claude` in every repository
- [ ] 5.2 Commit the generated `.gitattributes`, `.github/skills/agentic-workflows/`, and `.vscode/settings.json` with the repository's furniture
- [ ] 5.3 Confirm the initialization performed no remote operation

## 6. Agentic workflows

- [ ] 6.1 Author the corp nightly marketplace-doctor via the official gh-aw creation prompt, adapting `grumpy-reviewer` and `update-docs`
- [ ] 6.2 Author the labs weekly incubation review against `docs/promotion-path.md`
- [ ] 6.3 Author the dental and vet repo-ask workflows
- [ ] 6.4 Author the platform-docs weekly chronicle and link audit, adapting `daily-doc-updater` and following the gh-aw docs-automation guide
- [ ] 6.5 Author the marketplace manifest-doctor
- [ ] 6.6 Author the cli gate-doctor, adapting `code-simplifier`
- [ ] 6.7 Run `gh aw init` only in `patterson-skills`; author no workflow there
- [ ] 6.8 In the design-plugins fork, recompile only; if `.lock.yml` files regenerate, commit separately and note the version bump; adapt `slide-deck-maintainer` and `repository-quality-improver` only as far as recompilation allows
- [ ] 6.9 Compile every authored workflow with `gh aw compile` and commit the `.md`, `.lock.yml`, and `.gitattributes` only

## 7. Verification

- [ ] 7.1 Run each repository's test entry point and confirm a clean pass
- [ ] 7.2 Run `claude plugin validate .` in every marketplace repository
- [ ] 7.3 Confirm no `LICENSE` was added anywhere
- [ ] 7.4 Confirm no repository was created, nothing was pushed, and no workflow is active

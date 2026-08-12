## 1. Governance (this change, `patterson-corp` only)

- [ ] 1.1 Record `docs/decisions/0005-branded-doc-sites.md`, Accepted, with the socket gate results
- [ ] 1.2 Author the `sites/branded-docs` capability spec (this change's delta)
- [ ] 1.3 Reword `.github/copilot-instructions.md`'s zero-dependency claim to scope it to plugin
      scripts and reference ADR 0005
- [ ] 1.4 Reword `.github/copilot-setup-steps.yml`'s comment and echoed setup message the same way
- [ ] 1.5 Reword `.github/ISSUE_TEMPLATE/new-plugin-proposal.yml`'s zero-dependency checklist item
- [ ] 1.6 Reword `.github/ISSUE_TEMPLATE/new-skill-proposal.yml`'s zero-dependency checklist item
- [ ] 1.7 Add an `npm` ecosystem entry scoped to `/site` (weekly, grouped) to `.github/dependabot.yml`
- [ ] 1.8 Run `sh scripts/verify-all.sh` and `openspec validate --all --strict --no-interactive` and
      confirm both pass

## 2. Gate-hardening dependency (tracked, not implemented here)

- [ ] 2.1 Confirm the parallel gate-hardening change updates `scripts/verify-all.sh`'s no-binaries,
      size-budget, and forbidden-content scans to exclude `site/bun.lock` and `site/node_modules`
      before any repository's `site/` lands
- [ ] 2.2 Re-run `sh scripts/verify-all.sh` against this change once the gate-hardening commit lands,
      to confirm the two changes compose cleanly

## 3. Per-repository site build-out (follow-on work, one workstream per repository)

- [ ] 3.1 `patterson-corp`: scaffold `site/`, pin `astro@7.1.5` + `@astrojs/starlight@0.41.5`,
      commit `site/bun.lock`, configure `passthroughImageService`, compose the Pages artifact
- [ ] 3.2 `lab-workshop`: same scaffold, build, and composition steps as 3.1
- [ ] 3.3 `design-plugins`: same scaffold, build, and composition steps as 3.1; reuse the existing
      `prototypes/patterson-starlight/` prototype as the starting point rather than starting fresh
- [ ] 3.4 `patterson-platform-docs`: same scaffold, build, and composition steps as 3.1
- [ ] 3.5 `patterson-academy`: same scaffold, build, and composition steps as 3.1
- [ ] 3.6 `patterson-design-system`: same scaffold, build, and composition steps as 3.1
- [ ] 3.7 For each repository above, score any dependency beyond `astro`/`@astrojs/starlight` with
      `socket package shallow` before adding it, per the `sites/branded-docs` spec
- [ ] 3.8 For each repository above, verify fonts load from the Adobe Fonts kit ID only (no
      binaries, no `@font-face`) and accent colors are not used for body copy or legal text
- [ ] 3.9 For each repository above, confirm the repository's own pre-existing test suite still
      exits `0` after `site/` is added
- [ ] 3.10 For each repository above, add the repository's own `npm`/`/site` Dependabot entry,
      mirroring 1.7

## 4. Design-plugins templates (tracked, separate workstream)

- [ ] 4.1 Ship a themed `patterson-starlight` `bun create` template as a `patterson-design-plugins`
      plugin
- [ ] 4.2 Ship a `patterson-vitepress` `bun create` template as a `patterson-design-plugins` plugin,
      so VitePress remains a documented, supported alternative for a future site

## 5. Verification

- [ ] 5.1 `openspec validate --all --strict --no-interactive` passes
- [ ] 5.2 `sh scripts/verify-all.sh` passes in `patterson-corp`
- [ ] 5.3 Confirm no `site/` directory, dependency, or lockfile was actually added by this change --
      it is governance only
- [ ] 5.4 Confirm every one of the six site repositories has a tracked follow-on task (section 3)
      before this change is considered fully carried forward

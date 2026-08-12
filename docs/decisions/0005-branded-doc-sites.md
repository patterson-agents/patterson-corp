# 0005 — Branded doc sites: Starlight, a scoped `site/` dependency exception, and composed Pages artifacts

**Status:** Accepted
**Date:** 2026-08-12
**Decider:** Daniel Bodnar
**Scope:** the six Patterson GitHub Pages sites currently published on custom domains

## Context

Six repositories in the org ship a GitHub Pages site on a custom domain, each built and deployed by
its own `.github/workflows/pages.yml`: `lab-workshop`, `patterson-corp`, `design-plugins`,
`patterson-platform-docs`, `patterson-academy`, and `patterson-design-system`. All six are currently
hand-authored static HTML stubs — no site generator, no theme, no shared component system. Daniel
directed rebuilding all six as high-quality branded sites rather than continuing to hand-author
static pages one repository at a time.

**Starlight was chosen over VitePress.** The evidence available in the workspace favors it plainly:
there are zero VitePress artifacts anywhere in the org, while a branded Starlight prototype already
exists at `design-plugins/prototypes/patterson-starlight/` and a working Starlight instance is
already live and building at `cli/docs/` (`@astrojs/starlight@0.41.5` on `astro@7.1.5`, per
`cli/docs/package.json` and `cli/docs/dep-scores.md`). Choosing the tool with a working precedent
over the one with none is the lower-risk path for a six-repository rollout. Separately, Daniel has
directed that a themed `patterson-starlight` **and** a `patterson-vitepress` `bun create` template
both ship as `patterson-design-plugins` plugins, so VitePress remains available as a documented,
supported alternative for a future site even though Starlight is the default for this program.

`patterson-corp` itself governs the org's zero-dependency invariant: `copilot-instructions.md`,
`copilot-setup-steps.yml`, and the `new-plugin-proposal` / `new-skill-proposal` issue templates all
currently assert, unscoped, that the platform ships no `package.json` anywhere. A Starlight site
needs `astro`, `@astrojs/starlight`, and a lockfile to build, so the six-site program cannot proceed
without carving out a scoped exception to that invariant and correcting the now-overbroad wording
that asserts it repo-wide.

## Decision

### 1. A `site/` directory is a scoped exception to the zero-dependency invariant

Each of the six site repositories gains a `site/` directory containing:

- `site/package.json` — `bun` as the package manager, with **pinned** dependencies
  `astro@7.1.5` and `@astrojs/starlight@0.41.5`
- a committed `site/bun.lock`

This is a **scoped** exception. It applies to `site/` only, in each of the six repositories. Skill
scripts, validators, and hooks everywhere else in every repository remain zero-dependency: `node
script.ts` against `node:*` builtins only, no `package.json`, no `node_modules`, exactly as
documented today. Nothing about this decision relaxes that rule anywhere outside `site/`.

### 2. Supply-chain gate: `socket package shallow`, approved 2026-08-12

Scored via `socket package shallow npm pkg:npm/<name>@<version> --markdown`, re-verified live during
this record:

| Package | Supply chain | Maintenance | Quality | Vulnerability | License |
| --- | --- | --- | --- | --- | --- |
| `astro@7.1.5` | 88 | 97 | 88 | 100 | 100 |
| `@astrojs/starlight@0.41.5` | 98 | 96 | 84 | 100 | 100 |
| `vitepress@1.6.4` | 97 | 95 | 84 | 100 | 100 |

All three sit below the 90 threshold on at least one dimension (astro on supply chain and quality;
Starlight and VitePress on quality), and all three score **100 on vulnerability**. Per the socket
gate policy, a low *quality* score on a devDependency-shaped, build-time toolchain package is a
different risk class than a low *supply-chain* or *vulnerability* score — the alerts on `astro` are
`[high] obfuscatedFile` (its bundled, minified/WASM compiler — a stable characteristic of the
package, not a version-specific injection) plus two `[low]` alerts; Starlight and VitePress carry no
`[high]` alerts. **Approved by Daniel 2026-08-12** on that basis.

**`sharp` is excluded.** The image-processing dependency Astro would otherwise pull in for its
default image service carries a `[high]` vulnerability-class CVE alert on the version in question.
Rather than accept that alert, Astro is configured with `passthroughImageService` instead of the
default `sharp`-backed service: site images are pre-optimized SVG or WebP ahead of time and passed
through unprocessed at build. `sharp` is not a dependency of `site/` in any of the six repositories.

### 3. Pages artifacts are composed, not replaced

The deployed Pages artifact for each site is a **composition**: the built `site/dist` output placed
at the site root, plus a passthrough copy of each repository's existing static artifacts at their
current, already-linked-to paths. Nothing that is live today moves or disappears — the new Starlight
site is added alongside the existing static surface, not swapped in for it, so deep links external
parties already hold never break. Each repository's `pages.yml` is responsible for assembling that
composed artifact before the Pages deploy step.

## Consequences

- **`scripts/verify-all.sh`'s tracked-content scans must exclude `site/`'s lockfiles and
  `node_modules`.** A `bun.lock` and any installed toolchain output would otherwise trip the
  no-binaries, size-budget, or forbidden-content checks that assume a zero-dependency tree. This is
  carried by the parallel gate-hardening commit referenced in this program's task list, not by this
  record.
- **Dependabot needs an `npm` ecosystem entry wherever a `package.json` lands.** `patterson-corp`'s
  own `.github/dependabot.yml` gains a `/site` entry (weekly, grouped) as part of this change; the
  other five repositories need the equivalent entry when their own `site/` directories are added in
  their respective workstreams.
- **The "no `package.json` by design" language is now scoped, not repo-wide.** `.github/
  copilot-instructions.md`, `.github/copilot-setup-steps.yml`, and the `new-plugin-proposal` /
  `new-skill-proposal` issue templates are reworded by this same change so the zero-dependency claim
  reads correctly against a repository that legitimately ships one `package.json` under `site/`.
- **Six repositories now carry two dependency surfaces each**: the zero-dependency plugin/skill
  surface (unchanged) and the `site/` toolchain surface (new, pinned, gated). Reviewers need to know
  which rules apply to which paths.
- **VitePress stays available as a documented alternative.** Because a `patterson-vitepress`
  template ships alongside `patterson-starlight`, a future site is not locked into Starlight by this
  decision — only the current six-site program is.

## References

- `cli/docs/package.json`, `cli/docs/dep-scores.md` — the working Starlight precedent and its own
  supply-chain scoring, scored 2026-07-31
- `design-plugins/prototypes/patterson-starlight/` — the branded Starlight prototype
- `.github/workflows/pages.yml` in `lab-workshop`, `patterson-corp`, `design-plugins`,
  `patterson-platform-docs`, `patterson-academy`, `patterson-design-system` — the six existing Pages
  deployments this program rebuilds
- `openspec/changes/add-branded-doc-sites/` — the proposal, design, tasks, and
  `sites/branded-docs` capability spec implementing this decision
- `docs/decisions/0001-spec-framework.md` — the OpenSpec framework this change is authored under

## Why

Six Patterson repositories publish GitHub Pages sites on custom domains
(`lab-workshop`, `patterson-corp`, `design-plugins`, `patterson-platform-docs`,
`patterson-academy`, `patterson-design-system`), and all six are hand-authored static HTML stubs
with no theme, no shared components, and no generator. Daniel directed rebuilding all six as
high-quality branded sites. `docs/decisions/0005-branded-doc-sites.md` records that decision and
picks Starlight over VitePress on the strength of the working `cli/docs/` precedent and the
`design-plugins/prototypes/patterson-starlight/` prototype, and it authorizes a scoped exception to
the platform's zero-dependency invariant so a `site/` directory can carry a pinned Astro/Starlight
toolchain. This change is the spec-level implementation of that ADR: it defines the requirements
every one of the six sites must satisfy and scopes the existing "no `package.json`" repository
wording down to what is actually still true.

## What Changes

- **New `sites/branded-docs` capability**: the behavior contract every one of the six sites must
  satisfy -- a clean `site/` build with pinned, gated dependencies; a composed Pages artifact so no
  existing deep link breaks; the Patterson font kit and accent-color policy applied without
  deviation; and each repository's own pre-existing tests staying green through the rebuild.
- **`docs/decisions/0005-branded-doc-sites.md`** records the program-level decision (Starlight over
  VitePress, the `site/` dependency exception, the socket gate results, composed Pages artifacts).
  This proposal does not restate that record; it turns it into testable requirements.
- **Wording correction, not a new rule**: `.github/copilot-instructions.md`,
  `.github/copilot-setup-steps.yml`, and the `new-plugin-proposal.yml` / `new-skill-proposal.yml`
  issue templates currently assert, unscoped, that the platform ships no `package.json` anywhere.
  This change rewords those four files so the claim reads "plugin scripts are zero-dependency; the
  `site/` toolchain is the documented exception (ADR 0005)" instead of an absolute that a compliant
  `site/` directory would falsify.
- **`.github/dependabot.yml`** gains an `npm` ecosystem entry scoped to `/site` (weekly, grouped)
  alongside the existing `github-actions` entry, so `patterson-corp`'s own future `site/` carries
  dependency update coverage from day one.
- This change does **not** scaffold `site/` itself in any of the six repositories, does not add the
  `astro`/`@astrojs/starlight` dependencies, and does not touch `scripts/verify-all.sh`'s scan
  exclusions -- those are implementation work for the per-repository site-build workstreams and the
  parallel gate-hardening change, tracked separately in `tasks.md`.

## Capabilities

### New Capabilities

- `sites/branded-docs`: the behavior contract every branded doc-site build satisfies -- clean build,
  preserved deep links via composed Pages artifacts, kit-only fonts, the accent-color policy, and
  green per-repository tests through the rebuild.

### Modified Capabilities

None. This change does not alter any existing capability's requirements; `repo-standard/quality-baseline`'s
README/devcontainer/tests baseline is unaffected, and the wording corrections in `copilot-instructions.md`,
`copilot-setup-steps.yml`, and the issue templates are documentation accuracy fixes, not a change to a
documented requirement's behavior.

## Impact

- `patterson-corp`: `docs/decisions/0005-branded-doc-sites.md` (new), `openspec/specs/sites/branded-docs/`
  (new capability, via this change's delta spec), `.github/copilot-instructions.md`,
  `.github/copilot-setup-steps.yml`, `.github/ISSUE_TEMPLATE/new-plugin-proposal.yml`,
  `.github/ISSUE_TEMPLATE/new-skill-proposal.yml`, `.github/dependabot.yml`.
- Downstream, non-code impact: the six site repositories (`lab-workshop`, `patterson-corp`,
  `design-plugins`, `patterson-platform-docs`, `patterson-academy`, `patterson-design-system`) each
  need their own `site/` scaffold, dependency install, and Pages-workflow composition work to satisfy
  the `sites/branded-docs` requirements this change defines; that build-out is out of scope here and
  tracked as follow-on work per repository.
- `scripts/verify-all.sh`'s no-binaries/size/forbidden-content scans need a `site/` lockfile and
  `node_modules` exclusion before any repository's `site/` actually lands; that is the parallel
  gate-hardening change, not this one.

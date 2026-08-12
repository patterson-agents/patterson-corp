## Purpose

Defines the behavior contract every one of the six Patterson branded GitHub Pages sites must
satisfy when rebuilt on the Starlight `site/` toolchain authorized by
`docs/decisions/0005-branded-doc-sites.md`: a clean, gated build; preserved deep links; brand-kit
fonts only; the documented accent-color policy; and green pre-existing tests throughout.

## ADDED Requirements

### Requirement: The `site/` build completes cleanly with gated dependencies

Each repository's `site/` directory SHALL build with `astro build` exiting `0`, using only the
pinned, socket-gated dependencies recorded in ADR 0005 (`astro@7.1.5`, `@astrojs/starlight@0.41.5`)
and a committed `site/bun.lock`. The build SHALL NOT load `sharp`; Astro's image service SHALL
be configured as `passthroughImageService`, with site images pre-optimized to SVG or WebP ahead of
build. (`sharp` unavoidably appears in `site/bun.lock` as an optional dependency declared by
`astro` — omitting optional dependencies also removes Rolldown's native binding and breaks the
build — but it is never imported at build or run time under the passthrough service. ADR 0005
records this; the requirement binds what executes, not what the resolver records.)

#### Scenario: Running the site build

- **WHEN** `bun run build` is executed inside a repository's `site/` directory
- **THEN** the command exits `0` and produces `site/dist`
- **AND** the build log shows the passthrough image service in effect, with no `sharp` module loaded

#### Scenario: A new dependency is proposed for `site/`

- **WHEN** a dependency other than `astro` or `@astrojs/starlight` is proposed for `site/package.json`
- **THEN** it is scored with `socket package shallow npm pkg:npm/<name>@<version> --markdown` before
  it is added
- **AND** any dimension scoring below 90 is surfaced and dispositioned before the dependency lands,
  per the socket gate policy

### Requirement: Deep links survive the rebuild via a composed Pages artifact

Each repository's deployed Pages artifact SHALL be a composition of the built `site/dist` output and
a passthrough copy of that repository's pre-existing static artifacts at their current paths. No URL
path that resolves today SHALL stop resolving as a result of the rebuild.

#### Scenario: An existing static page is requested after the rebuild

- **WHEN** a URL that resolved to a pre-existing static artifact before the rebuild is requested
  after the site is redeployed
- **THEN** the same content is still served at that path
- **AND** the response is not a 404

#### Scenario: Composing the Pages artifact

- **WHEN** a repository's `pages.yml` workflow runs
- **THEN** it assembles the deploy artifact from both `site/dist` and the repository's existing
  static paths before the Pages deploy step
- **AND** neither source is deployed alone

### Requirement: Fonts are served from the Patterson Adobe Fonts kit only

Every branded doc site SHALL reference Patterson's typeface exclusively via the Adobe Fonts
(Typekit) CDN kit ID. No font binary (e.g. `.woff`, `.woff2`, `.ttf`, `.otf`) and no `@font-face`
rule SHALL be committed to any `site/` directory.

#### Scenario: Auditing a site's font loading

- **WHEN** a branded doc site's committed `site/` tree is inspected
- **THEN** no font binary file is present
- **AND** no `@font-face` declaration is present in any committed stylesheet
- **AND** the page loads its typeface via the Adobe Fonts CDN kit ID at runtime

### Requirement: Accent colors follow the documented usage policy

Every branded doc site SHALL use accent colors (`pat-digital-green`, `pat-digital-teal`,
`pat-digital-purple` / `pat-digital-purple-dark`, and the `--accent` token) only for the roles the
design-tokens reference documents -- UI accents, highlights, and success states. Accent colors SHALL
NOT be used for body copy or legal disclaimer text.

#### Scenario: Reviewing accent color usage on a page

- **WHEN** a branded doc site page's body copy or legal disclaimer text is inspected
- **THEN** it is not set in an accent color
- **AND** any accent-colored text on the page is UI chrome, a highlight, or a success/status
  indicator

### Requirement: Each repository's own pre-existing tests stay green

Rebuilding a repository's site SHALL NOT break that repository's own existing `run-tests.sh` suite
or CI workflow. The `site/` toolchain is additive to a repository's zero-dependency plugin/skill
surface, not a replacement for it.

#### Scenario: Running a repository's existing test suite after adding `site/`

- **WHEN** a repository's pre-existing `run-tests.sh` (or equivalent CI-invoked suite) is run after
  `site/` is added
- **THEN** it exits `0` exactly as it did before `site/` existed
- **AND** the `site/` toolchain's own build is verified separately, not folded into that suite

#### Scenario: `site/` is excluded from the zero-dependency scans

- **WHEN** a repository's tracked-content scans (no-binaries, size budget, forbidden content) run
  after `site/` is added
- **THEN** `site/bun.lock` and any `site/node_modules` output are excluded from those scans
- **AND** the scans still enforce the zero-dependency rule against every path outside `site/`

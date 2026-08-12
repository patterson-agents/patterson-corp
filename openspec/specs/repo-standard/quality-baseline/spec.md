# repo-standard/quality-baseline Specification

## Purpose
Defines the cross-cutting quality baseline every Patterson repository satisfies, so that a
reviewer, a contributor, and the program-wide gate battery encounter the same shape in each
repository: documentation, development environment, tests with CI, and a single fitted agentic
workflow.
## Requirements
### Requirement: House-style README in every repository

Every repository SHALL ship a `README.md` in the established house style: a centred header with an
SVG logo or mark, shields.io badges, GFM alerts, tables, a mermaid or hand-authored SVG diagram, and
`<details>` sections. No new raster assets SHALL be generated.

#### Scenario: Reading any repository's front page

- **WHEN** a reader opens a Patterson repository README
- **THEN** it presents the centred header, badges, at least one table, and at least one diagram
- **AND** any diagram is mermaid or hand-authored SVG rather than a generated image

#### Scenario: A repository already has optimized screenshots

- **WHEN** a repository ships existing optimized PNG screenshots, as the design-plugins fork does
- **THEN** those images are used in the README rather than deleted
- **AND** the use is recorded as a deliberate override of the no-binaries rule for README imagery

#### Scenario: No suitable existing imagery

- **WHEN** a repository has no existing optimized imagery
- **THEN** the README uses SVG or mermaid visuals only
- **AND** no raster asset is created to fill the gap

### Requirement: Pinned node:24 devcontainer in every repository

Every repository SHALL ship `.devcontainer/devcontainer.json` on a pinned `node:24`-family image
tag. `cli/` SHALL use a Bun-flavored variant. No committed configuration in any repository SHALL
reference `node:20`.

#### Scenario: Inspecting a devcontainer

- **WHEN** any repository's devcontainer definition is read
- **THEN** the image tag is from the `node:24` family and is pinned rather than floating

#### Scenario: Scanning for the forbidden runtime

- **WHEN** the program-wide grep for `node:20` runs across all repositories
- **THEN** it returns no hit in any committed workflow, devcontainer, manifest, or document

### Requirement: Runnable tests and CI in every repository

Every repository SHALL ship runnable tests and CI that executes them. Marketplace repositories SHALL
use zero-dependency `run-tests.sh` suites covering manifest validation, skill name equals directory,
size, and forbidden content. `cli/` SHALL use `bun test`. Tests SHALL be written before the code or
configuration they check.

#### Scenario: Running a repository's tests

- **WHEN** a repository's test entry point is executed
- **THEN** the suite runs without installing dependencies in a marketplace repository
- **AND** it exits `0` on a compliant tree and non-zero on a violation

#### Scenario: CI executes the suite

- **WHEN** a repository's CI workflow is inspected
- **THEN** it invokes the repository's own test entry point
- **AND** a test failure fails the workflow

#### Scenario: A repository has no tests

- **WHEN** the program-wide review checks each repository for a test entry point
- **THEN** every repository has one
- **AND** a repository without tests is treated as failing the baseline, not as untested-but-fine

### Requirement: gh-aw initialization in every repository

Every repository SHALL be initialized with `gh aw init --engine claude`, generating local files only
-- `.gitattributes`, `.github/skills/agentic-workflows/`, and `.vscode/settings.json` -- committed
alongside the repository's furniture.

#### Scenario: Initialization output is committed

- **WHEN** `gh aw init --engine claude` has been run in a repository
- **THEN** the generated files are present and committed
- **AND** no remote operation was performed by the initialization

### Requirement: One fitted agentic workflow per eligible repository

Each eligible repository SHALL carry exactly one agentic workflow, authored through the official
gh-aw creation prompt, compiled with `gh aw compile`, and committed as the workflow `.md`, its
`.lock.yml`, and `.gitattributes` only. Work SHALL stop at commit.

#### Scenario: Workflow purposes are fitted to their repository

- **WHEN** the set of authored workflows is reviewed
- **THEN** `patterson-corp` has a nightly marketplace-doctor that validates manifests, runs all skill
  suites, and creates an issue on failure
- **AND** `patterson-labs` has a weekly incubation review against `docs/promotion-path.md`
- **AND** `patterson-dental` and `patterson-vet` each have a repo-ask slash-command workflow
- **AND** `patterson-platform-docs` has a weekly reference-library chronicle and link audit
- **AND** `patterson-marketplace` has a manifest-doctor
- **AND** `cli/` has a gate-doctor that investigates failed `bun run gate` CI runs

#### Scenario: Repositories excluded from new workflows

- **WHEN** `patterson-skills` and the design-plugins fork are considered
- **THEN** `patterson-skills` receives gh-aw initialization only and no new workflow, because it is
  deprecated
- **AND** the design-plugins fork receives no new workflow, because it already runs three, and any
  regenerated `.lock.yml` files are committed separately with the gh-aw version bump noted

#### Scenario: Named upstream sources are adapted, not copied

- **WHEN** a workflow is adapted from a named upstream source
- **THEN** the source is fetched at execution time
- **AND** repository names, the `claude` engine, and `node:24` are adjusted for the target repository
- **AND** the doc-related workflows follow the gh-aw docs-automation guide as their authority

#### Scenario: Nothing is pushed

- **WHEN** workflow authoring completes
- **THEN** the workflow files are committed locally
- **AND** no push occurs, so no workflow is activated


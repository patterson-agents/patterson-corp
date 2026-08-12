## Why

The program touches nine repositories and each workstream would otherwise decide independently what
a README looks like, whether tests exist, and which Node image a devcontainer pins. The plan's
"Cross-cutting repo standard" section fixes that: **every repo touched** ships a house-style README,
a `node:24`-family devcontainer, runnable tests plus CI that runs them, `gh aw init --engine claude`
output, and exactly one agentic workflow authored through the official gh-aw prompt.

The consistency is not cosmetic. Without a shared quality baseline the gate battery cannot be run
uniformly across repositories, and a repository with no tests is indistinguishable from one whose
tests pass.

## What Changes

- **README.md** in every repository, in the established house style: centred header with an SVG
  logo or mark, shields.io badges, GFM alerts, tables, mermaid or hand-authored SVG diagrams, and
  `<details>` sections. Screenshots are used only where assets already exist -- the design-plugins
  fork's nine optimized PNGs are used rather than deleted, a recorded override of the no-binaries
  rule for README imagery. No new raster generation.
- **`.devcontainer/devcontainer.json`** in every repository on a pinned `node:24`-family image;
  `cli/` gets a Bun-flavored one. Precedents: `patterson-design-plugins/.devcontainer/` and
  `patterson-sh/templates/`.
- **Runnable tests plus CI** in every repository: zero-dependency `node` `run-tests.sh` suites in
  the marketplace repos (manifest validation, skill name equals directory, size, forbidden content)
  and `bun test` in `cli/`. Tests are written before the code they check.
- **`gh aw init --engine claude`** in every repository -- local file generation only
  (`.gitattributes`, `.github/skills/agentic-workflows/`, `.vscode/settings.json`), committed with
  the repo's furniture.
- **One agentic workflow per repository**, authored via the official prompt that fetches
  `https://raw.githubusercontent.com/github/gh-aw/main/create.md`, compiled with `gh aw compile`,
  and **stopped at commit**. Fitted purposes: corp = nightly marketplace-doctor; labs = weekly
  incubation review against `docs/promotion-path.md`; dental and vet = repo-ask; platform-docs =
  weekly reference-library chronicle and link audit; marketplace = manifest-doctor; cli =
  gate-doctor; design-plugins already runs three, so recompile only; skills is deprecated, init only
  and no new workflow.
- **Named upstream workflow sources** adapted at execution time: `daily-doc-updater` to
  platform-docs, `code-simplifier` to cli, `grumpy-reviewer` and `update-docs` to patterson-corp,
  `slide-deck-maintainer` and `repository-quality-improver` to design-plugins. The guide at
  `https://github.github.com/gh-aw/guides/docs-automation/` is the authority for the doc-related
  workflows.

## Capabilities

### New Capabilities

- `repo-standard/quality-baseline`: the cross-cutting baseline every Patterson repository satisfies
  -- README, devcontainer, tests plus CI, gh-aw initialization, and a single fitted agentic workflow.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **No pushing, ever.** Agentic workflows only activate once Daniel pushes; this change stops at
  commit. `gh aw compile` runs locally; `gh aw init` generates files locally.
- **No new agentic workflow in `patterson-skills`.** It is deprecated: `gh aw init` only.
- **No new agentic workflow in the design-plugins fork.** It already runs three; recompilation only,
  committed separately with the gh-aw version bump noted (v0.81.6 locks against v0.85.4 installed).
- **No new raster assets.** Existing optimized PNGs may be used in READMEs; new visuals are SVG or
  mermaid.
- **No `node:20`** in any devcontainer, workflow, or committed configuration.
- **No `LICENSE`** in any repository -- the same blocked open question applies everywhere.
- **No repository creation.** Only the separately-authorized `design-plugins` create happens, and it
  belongs to `fork-design-plugins`.

## Impact

- Touches every repository in the program: `patterson-corp`, `patterson-labs`, `patterson-dental`,
  `patterson-vet`, `patterson-platform-docs`, `patterson-marketplace`, `patterson-skills`,
  `design-plugins`, and `cli/`.
- Overlaps deliberately with `add-repo-furniture` (which implements the standard for
  `patterson-corp`) and `populate-sibling-marketplaces` (which implements it for labs, dental, and
  vet); this change defines the baseline they satisfy and covers the repositories they do not.
- Adds one agentic workflow definition and lock file per eligible repository, plus gh-aw
  initialization files.

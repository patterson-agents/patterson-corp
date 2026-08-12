## Context

Nine repositories are in scope and they start from very different places. `patterson-corp` has
plugins and tests but no furniture. Labs, dental, and vet start empty. `patterson-platform-docs` is
a reference library with no git history yet. `patterson-skills` is being retired.
`patterson-marketplace` carries a large vendored skill library. The design-plugins fork already runs
three agentic workflows compiled with gh-aw v0.81.6, while v0.85.4 is what is installed. `cli/` runs
on Bun with its own constitution.

Two constraints cut across all of them: nothing is pushed, so agentic workflows are inert until
Daniel pushes; and no binaries, with a single user-granted exception for README imagery where
optimized assets already exist.

## Goals / Non-Goals

**Goals:**

- One recognizable shape across every repository, so review and the gate battery are uniform.
- Tests that exist and run everywhere, because "no tests" and "tests pass" are otherwise
  indistinguishable from the outside.
- Agentic workflows fitted to what each repository actually needs, not a generic template applied
  nine times.

**Non-Goals:**

- Pushing, activating workflows, or creating repositories.
- Generating new raster assets.
- Overriding `cli/`'s own constitution.

## Decisions

- **This change defines the baseline; other changes implement it in their repositories.**
  `add-repo-furniture` covers `patterson-corp`, `populate-sibling-marketplaces` covers labs, dental,
  and vet, and `fork-design-plugins` covers the fork. The overlap is intentional: one definition,
  several implementers, no per-repository reinterpretation.
- **One workflow per repository, purpose-fitted.** A generic workflow replicated nine times produces
  nine sources of noise. Each purpose is drawn from what that repository is for, and the
  marketplace-doctor mirrors the ci-doctor precedent that already works in design-plugins.
- **Author through the official gh-aw prompt.** Fetching `create.md` at execution time keeps the
  authored workflows aligned with the tool's current expectations rather than a remembered shape.
- **Existing PNGs are used, not regenerated and not deleted.** The user override is narrow -- README
  imagery, existing optimized assets only -- and is recorded as a deviation so the no-binaries rule
  stays otherwise intact.
- **`patterson-skills` gets init only.** Authoring a workflow for a repository being retired spends
  effort on something scheduled for removal.
- **Recompiled locks commit separately.** If `gh aw compile` regenerates the design-plugins locks,
  a mixed commit would hide a v0.81.6-to-v0.85.4 toolchain bump inside unrelated content changes.
- **`cli/` keeps Bun.** A `node:24` devcontainer imposed on a Bun monorepo would contradict its own
  rules, so it gets a Bun-flavored variant instead.

## Risks / Trade-offs

- Overlapping ownership between this change and the per-repository changes could produce duplicate
  or conflicting files. Mitigated by making this change the definition and the others the
  implementers, with the repositories partitioned explicitly.
- Nine READMEs authored to a house style is significant effort for output no machine checks.
  Accepted, and partly mitigated: badges and diagrams are checkable for presence even if quality is
  not.
- Committed-but-unpushed workflows are never exercised. Accepted as a direct consequence of the
  no-push constraint; `gh aw compile` succeeding is the only available verification.
- The gh-aw version skew means recompilation may produce large lock diffs. Isolated into their own
  commits so the churn is reviewable.

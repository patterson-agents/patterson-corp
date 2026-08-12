## Context

See `proposal.md` - Why for the motivation, and `docs/decisions/0005-branded-doc-sites.md` for the
program-level decision this change turns into requirements. Six repositories currently ship
hand-authored static Pages stubs; this change defines the contract the rebuilt sites satisfy. It
does not itself build any site -- that is per-repository follow-on work tracked in `tasks.md`.

`cli/docs/` is the one place a Starlight build already exists in the org, and its
`dep-scores.md` is the precedent for how this program's socket gate is recorded. The six target
repositories are otherwise a blank slate for this toolchain: no `site/` directory, no `astro`
dependency, no Pages-artifact composition step, in any of them yet.

## Goals / Non-Goals

**Goals:**

- Give every one of the six sites one behavior contract (`sites/branded-docs`) instead of six
  independently-interpreted rebuilds.
- Keep the platform's zero-dependency invariant intact everywhere except the newly-scoped `site/`
  exception, and make the repository docs that assert it say so accurately.
- Make sure a reader of `.github/copilot-instructions.md` or either issue template after this change
  lands cannot conclude something false about `patterson-corp`'s dependency posture.

**Non-Goals:**

- Scaffolding `site/` in any of the six repositories, or in `patterson-corp` itself. This change is
  the spec and the governance wording only.
- Modifying `scripts/verify-all.sh`'s scan exclusions. That is the parallel gate-hardening change;
  this change's `sites/branded-docs` spec states the requirement (`site/` is excluded from the
  zero-dependency scans) without implementing the exclusion logic itself.
- Choosing or building the six sites' visual design, navigation structure, or content migration
  plan. Those are per-repository decisions for the workstream that actually builds each `site/`.

## Decisions

- **One shared capability, not six.** A single `sites/branded-docs` spec under `openspec/specs/`
  means the six per-repository build-outs are reviewed against one contract instead of drifting into
  six interpretations of "high-quality branded site." Alternative considered: a spec per repository
  under `openspec/specs/sites/<repo>/`. Rejected -- the six sites share every requirement in this
  change (build cleanliness, deep-link preservation, font kit, accent policy, test isolation) and
  nothing in scope here is repository-specific enough to justify six copies.
- **The wording fix touches exactly the four files that assert the invariant repo-wide.** Grepped for
  the literal claim ("no `package.json`", "zero-dependency ... repo-wide") rather than rewording
  every file that happens to mention zero-dependency scripts; `CONTRIBUTING.md`'s and the plugin
  skill validators' zero-dependency language is still true as written and is left alone.
- **Deep-link preservation is enforced by composition, not by redirect.** ADR 0005 already decided
  this (Decision 3); this design does not revisit it, only encodes it as a testable requirement
  (composed artifact, no path stops resolving).
- **`sharp` exclusion is a build-config requirement, not a dependency-list requirement.** The spec
  requires `passthroughImageService` and pre-optimized images rather than merely forbidding `sharp`
  in the lockfile, so a future contributor cannot satisfy the letter of "no sharp" while still
  needing runtime image processing Astro's default service would otherwise perform.

## Risks / Trade-offs

- **A shared spec across six repositories with different owners could be satisfied inconsistently.**
  Mitigated by writing every requirement as an observable, checkable scenario (build exit code, HTTP
  response, presence/absence of a font binary or `@font-face` rule) rather than a subjective bar.
- **The wording correction could be read as "the zero-dependency rule is gone."** Mitigated by
  keeping the correction narrow and explicit -- "plugin scripts are zero-dependency; the `site/`
  toolchain is the documented exception (ADR 0005)" -- in all four files, rather than deleting the
  zero-dependency claim outright.
- **This change ships a spec with no implementation yet in `patterson-corp` itself.** Accepted: the
  spec exists to be satisfied by the six per-repository workstreams, and `openspec validate` does not
  require a capability's requirements to already be met by code in the repository that defines them.

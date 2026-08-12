## Context

Correction C5 changed the sequencing of this work: the three sibling directories contain zero
files, so there is nothing to commit until content exists. That makes this change a hard
prerequisite for two others -- the `agentic-workflow-designer` harvest from `patterson-skills` and
the claude.ai design-system extractions, both of which target `patterson-labs`.

The marketplace `name` field is a flat global namespace where a duplicate replaces the incumbent, a
constraint verified for `add-layered-managed-settings`. Three new marketplaces entering that
namespace at once is exactly the situation where a copy-paste name would go unnoticed.

## Goals / Non-Goals

**Goals:**

- Three repositories that are structurally identical, so a reviewer checks one shape three times.
- Enough structure that a first commit and `claude plugin validate .` both succeed.
- A promotion path written down before anything needs promoting.

**Non-Goals:**

- Shipping plugin content beyond the harvested skill and the later design extractions.
- Creating remote repositories or marking any repository as a GitHub template.
- Licensing decisions.

## Decisions

- **One shape, three repositories.** The same file list, the same test-suite structure, the same
  devcontainer. Divergence between siblings is a maintenance cost with no offsetting benefit at this
  stage.
- **Distinct names asserted by test, not by care.** Each suite checks its own manifest name, and the
  program-level review checks uniqueness across the org, because the failure mode is silent
  replacement rather than an error.
- **Labs carries the extra documents.** Dental and vet are minimal by direction; labs is the
  incubation repo and therefore owns `promotion-path.md`, `gh-aw-adoption.md`, and the harvest
  destination.
- **Template adoption documented, not executed.** Making `githubnext/agentics` a GitHub template
  requires remote mutation. Writing down what would be done preserves the finding without violating
  the no-remote-operations constraint; the gap goes in the deviations list.
- **`managed-settings.d/` placeholder, not a copy.** Each sibling gets a placeholder matching the
  layered-settings shape rather than a duplicate of `patterson-corp`'s four layers, so the
  demonstration keeps a single source.

## Risks / Trade-offs

- Three near-identical repositories invite drift once they diverge for real reasons. Accepted;
  the shared shape is documented in each README so a later divergence is a visible decision.
- `patterson-labs` becomes a dependency bottleneck for two downstream changes. Mitigated by keeping
  labs' baseline small -- the design extractions can be fetched in parallel and written once the
  shell exists.
- The promotion path is written with no graduation precedent to draw on, so some criteria will be
  `[TBD: not specified in HANDOFF.md 1F]`. That is the correct outcome rather than inventing gates.

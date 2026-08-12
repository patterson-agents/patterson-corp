## Context

Three vendor behaviours were verified against `.tmp/staging/docs/{claude-code,copilot,vscode}/` and
`patterson-platform-docs/references/platforms/_NORMATIVE-*.md`, and they do not agree with each
other. Claude Code's managed tier replaces wholesale and only `managed-settings.d/` merges
(alphabetically). Copilot inverts precedence -- personal beats repository beats organisation -- and
has no enterprise tier at all, so an "enterprise policy" has no Copilot equivalent to project onto.
VS Code reads the same keys from `.claude/settings.json`, which is the one piece of good news: a
single settings shape serves two agents.

Patterson's own readiness is the other constraint. Public-repo approval is unresolved (open question
#1) and the catalog is still being assembled, so any hard denial shipped today would break
consumers before it protected them.

## Goals / Non-Goals

**Goals:**

- Make the merge semantics visible by demonstration rather than by assertion.
- Ship something that is safe on day one and one edit per layer away from enforcement.
- Keep every claim traceable to a cited source.

**Non-Goals:**

- Enforcing anything.
- Installing settings onto a machine.
- Modelling the Copilot or VS Code tiers as parallel file trees.

## Decisions

- **Numeric filename prefixes.** Because the merge is alphabetical, the organisational precedence
  has to be encoded in the filename. `10`/`20`/`30`/`40` leaves gaps for later tiers without
  renaming existing files.
- **Advisory keys only.** `extraKnownMarketplaces` and `enabledPlugins` add capability;
  `strictKnownMarketplaces` and `permissions.deny` remove it. Only the additive half ships.
- **Enforcement examples live in the markdown.** JSON has no comment syntax, so a commented-out
  switch inside a `.json` file is not a thing that exists. The document carries the fenced examples;
  the JSON stays clean and parseable.
- **Six layers described, four demonstrated.** The document explains all six settings layers Claude
  Code consults; only the four organisational tiers get demonstration files, because the user and
  project layers are not Patterson's to ship.
- **Cite, do not extrapolate.** Where the staged docs are silent, `[TBD: not specified in <source>]`
  goes in. A plausible-sounding inference about settings precedence is exactly the kind of claim
  that gets copied into a policy and never re-checked.

## Risks / Trade-offs

- An advisory demonstration can be mistaken for an enforced policy by a reader who skims. Mitigated
  by stating the posture at the top of the document and in each layer's description.
- The four verified constraints were captured from staged documentation snapshots, not from live
  vendor docs; vendor behaviour can change. Recorded with source paths so the claims can be
  re-verified rather than re-derived.
- Numeric prefixes create an implicit contract: inserting a `25-` layer later changes merge results.
  Called out in the document so the gap allocation is deliberate.

# Contributing to patterson-corp

`patterson-corp` is Patterson's enterprise Claude Code plugin marketplace: the capability
that is true for **all** of Patterson, shipped as installable plugins. This document is
how a person or an agent proposes a change to it.

## Before you write anything

Every change here follows the [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow
under `openspec/`. There is no other path to a merged change:

1. **Propose.** Create `openspec/changes/<change-id>/` with `proposal.md` (why, what
   changes, capabilities added or modified, non-goals, impact), `tasks.md` (a checklist),
   and, for anything non-trivial, `design.md` and a delta `specs/<capability>/spec.md`
   using `ADDED`/`MODIFIED`/`REMOVED Requirements` and `#### Scenario:` blocks.
2. **Validate.** Run `openspec validate --strict` on the change before asking for review.
   A change that does not validate is not ready for review, regardless of how complete the
   code looks.
3. **Implement against the tasks.** Work through `tasks.md` in order; check items off as
   you land them.
4. **Archive.** Once merged, the change moves to `openspec/changes/archive/` and its delta
   specs are folded into `openspec/specs/`.

If you are not sure whether something needs a full change proposal, open a
[new-plugin-proposal or new-skill-proposal issue](.github/ISSUE_TEMPLATE/) first and ask.

## Repository conventions

These are load-bearing, not stylistic. `scripts/verify-all.sh` enforces the ones that can
be checked mechanically; the rest are checked in review.

| Rule | What it means |
|---|---|
| **Zero-dependency TypeScript** | Every validator script is run directly by Node via native type stripping (`node scripts/check-size.ts .`) -- no build step, no bundler, no `package.json`, no `node_modules`. Imports come only from `node:*` built-ins. |
| **Erasable syntax only** | No `enum`, `namespace`, parameter properties, or legacy decorators in any `.ts` file. Node's type stripper cannot erase these constructs and the script will throw at runtime, not at review time. |
| **Node 24 only** | Every pinned runtime -- CI, the devcontainer, `copilot-setup-steps.yml` -- targets the `node:24` image family. Never Node 20. |
| **Validator contract** | A validator script takes a path argument, exits `0` (pass), `1` (findings present), or `2` (could not evaluate), and emits one finding per line as `LEVEL\|file\|line\|rule\|message`. See `plugins/patterson-engineering/skills/*/scripts/*.ts` for the reference shape. |
| **Provenance files** | Every skill carries `_SOURCES.md` (where its content came from, with a confidence note) and `REFERENCES.md` (canonical, authoritative locations). A skill without both is incomplete. |
| **The `[TBD]` marker** | When a source is silent on something the platform would otherwise need to assert, write `[TBD: what is missing]` rather than inventing an answer. A `[TBD]` is a finding to escalate to the standard's owner, not a defect to quietly resolve. `grep -rn '\[TBD' plugins/` surfaces every open item. |
| **kebab-case** | Plugin names, skill directory names, and issue/PR template filenames are kebab-case. A skill's directory name and its `SKILL.md` frontmatter `name:` field must be identical -- `scripts/verify-all.sh` checks this. |
| **`${CLAUDE_PLUGIN_ROOT}` stays literal** | Every intra-plugin reference in a `SKILL.md`, agent, or hook uses the literal token `${CLAUDE_PLUGIN_ROOT}`, never an absolute path a tool happened to resolve it to on someone's machine. `scripts/verify-all.sh` greps for an expanded form and fails the build if it finds one. |
| **No binaries** | No fonts, no PDFs, no Office documents, no archives, and no raster image over 50 KiB (SVG is exempt at any size). `scripts/check-no-binaries.ts` enforces this; see `SECURITY.md` and `docs/decisions/` for why brand fonts are referenced by CDN kit ID rather than shipped as files. |
| **1 MiB tracked-byte budget** | `scripts/check-size.ts` sums `git ls-files` byte sizes, not `du` output -- `du` block-accounting overstated this repository's real size by more than a factor of two. The predecessor repository reached 96 MB before anyone measured it; do not let this one drift the same way. |
| **No emoji** | This is a B2B healthcare distribution brand. Plain text, GFM alerts (`> [!NOTE]`, `> [!WARNING]`), and tables carry emphasis instead. |
| **Conventional commits** | `<type>(<scope>): <summary>`, e.g. `feat(scripts): add repo gate validators`. Types in use here: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`. |

## Test-first

`scripts/check-size.ts` and `scripts/check-no-binaries.ts` were written test-first, and any
new validator script should be too: write the failing `run-tests.sh` fixtures before the
implementation exists, confirm they fail for the right reason (missing script, not a typo),
then implement. Fixtures that need an oversized file or a font binary to prove a check works
are generated at test-run time into a throwaway directory -- never committed -- because a
committed oversized tree or binary would itself trip the very check it exists to test.

Before opening a pull request, run the full gate locally:

```bash
sh scripts/verify-all.sh
```

This runs every `run-tests.sh` suite under the repository, the design-tokens theme
round-trip, the skill-name-equals-directory check, the forbidden-string greps, both
validators above, and the `.py` / Node 20 / expanded-`${CLAUDE_PLUGIN_ROOT}` bans (Node 24
is the only supported runtime). CI runs the identical script; there is no separate CI-only
check to guess at.

To run it automatically before every commit:

```bash
git config core.hooksPath .githooks
```

(This is a local, per-clone opt-in. It is not activated by cloning the repository, and
nothing in this change activates it on your behalf.)

## Pull requests

- Two approvers are required before merge, per the CI/CD Pipeline Standard's pull request
  policy (`plugins/patterson-engineering/skills/cicd-pipeline-standards/references/version-control-and-pr-policy.md`).
  Whether the two approvers may include the author, whether code owners specifically are
  required, and whether stale-review dismissal is mandatory are `[TBD]` in that standard
  itself -- do not assume an answer that source does not give.
- `CODEOWNERS` names a reviewing team for every top-level path. The team handles in that
  file are placeholders (`[TBD: real team handles not specified]`) until Patterson platform
  leadership assigns them.
- Fill in the pull request template's checklist honestly, including the provenance,
  no-binaries, and size-budget items. An unchecked box that should be checked is more
  useful to a reviewer than a checked box that is not true.

## Security

See `SECURITY.md` for how to report a vulnerability. Do not open a public issue for one.

## Why

`patterson-design-plugins` cannot be worked in. Correction C3 verified that its git index is
**corrupt**: `git status` fails fatally while `git log` still works. HANDOFF.md 2A's prescription
was to `rm -rf .git` and re-initialise, which would also purge the Adobe font binaries and 79 MB of
PNGs from history -- but it destroys the only copy of that history and does so in a repository whose
index is already broken.

Daniel's mid-planning direction replaces that with a safer move: **fork, never purge.** Copy the
working tree into a new sibling repository `design-plugins/`, do all work there, and leave the
original repository -- corrupt index included -- completely untouched. The same pattern applies to
any other repo where history would otherwise be rewritten.

Two residual items from HANDOFF.md 1I ("Residual cleanup") ride along, and one of them is a decision
rather than a fix: `patterson-docs` and `patterson-file-manager` load React and Babel from unpkg,
and they are genuine 750-1400 line application templates, not component specimens. Converting them
would destroy their purpose, so it is Daniel's call, recorded as an ADR.

## What Changes

- Create a new sibling repository `design-plugins/` as a working-tree copy of
  `patterson-design-plugins` **excluding `.git`**; write `.gitignore` first, then `git init -b main`.
- Leave `patterson-design-plugins` entirely untouched: no git operations, no deletion, no index repair.
- In the fork: fix the undefined `.pat-docs` CSS class (one class, trivial).
- Write `docs/decisions/0004-unpkg-react-application-templates.md` recording that the unpkg React
  templates are **not** converted and why the decision belongs to Daniel.
- Run the forbidden-content greps (Figtree, `d98a00`, `c0392b`, `rul6mjk`, uppercase text-transform,
  fonts, `.py`, `node:20`) across the fork.
- Keep the nine optimized PNG screenshots and **use them in the README** -- a deliberate user
  override of the no-binaries rule for README imagery, kept small and optimized, recorded as a
  deviation.
- Apply the cross-cutting repo standard: house-style README, `.devcontainer/` on a pinned
  `node:24`-family image, runnable tests plus CI.
- Commit `feat: initial commit of Patterson design system plugins`, then run the single authorized
  remote command: `gh repo create patterson-agents/design-plugins --private --source=. --remote=origin`
  -- **create only, no `--push`**. Install the local pre-push guard immediately after the remote exists.
- Recompile the repository's existing agentic workflows only if `gh aw compile` regenerates them,
  committed separately with the gh-aw version bump noted (the existing `.lock.yml` files were
  compiled with v0.81.6; v0.85.4 is installed).

## Capabilities

### New Capabilities

None. This change is a repository migration plus documentation and tooling; it introduces no new
behavioural capability. `skip_specs: true` is set in this change's `.openspec.yaml` accordingly.

### Modified Capabilities

None. No requirement changes in any existing capability -- the cross-cutting quality baseline this
fork adopts is specified by `apply-repo-standard`, not redefined here.

## Non-goals

- **The unpkg React templates are not converted.** They are application templates, not component
  specimens; converting them would destroy their purpose. ADR 0004 records the decision as Daniel's.
- **The original `patterson-design-plugins` is not touched.** No `rm -rf .git`, no re-init, no index
  repair, no commits, no deletion. Its disposition is a morning-report item.
- **Nothing is pushed.** `gh repo create` runs without `--push`. If the org create fails, or would
  land in the personal `danielbodnar` namespace, it is skipped and recorded -- never
  `danielbodnar/design-plugins`.
- **The nine PNGs are kept, not regenerated and not deleted.** No new raster generation; any new
  visual is SVG or mermaid.
- **No new agentic workflows.** The repository already runs three; only recompilation is in scope.
- **No history migration.** The fork starts with a fresh history by design; the original's history
  stays where it is.

## Impact

- New sibling repository `design-plugins/` with a fresh history, superseding
  `patterson-design-plugins` locally.
- The single remote action of the entire program run happens here, and it creates an empty
  repository only.
- The original repository's three non-main remote branches (`copilot/fix-vhs-demos-and-scripts`,
  `copilot/optimize-plugin-assets`, and a codespace branch) are orphaned by the fresh history and
  must be listed in the morning report.
- Adds a repo-standard test suite and CI to the fork.

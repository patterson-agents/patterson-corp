## Context

Correction C3 is the governing fact: `patterson-design-plugins` has a corrupt git index. `git
status` fails fatally; `git log` works. Any recovery attempt operates on a repository whose state
cannot be reliably read, and HANDOFF.md 2A's `rm -rf .git` would additionally destroy the only local
copy of a 12 MB history containing Adobe font binaries and 79 MB of historical PNGs.

The repository is otherwise healthy at the working-tree level and carries real assets: nine
optimized PNG screenshots and three live agentic workflows compiled with gh-aw v0.81.6, against
v0.85.4 installed.

## Goals / Non-Goals

**Goals:**

- A clean, working repository for the design plugins, without gambling on a broken index.
- Preserve the original untouched, so any later forensic or recovery work is still possible.
- Bring the fork up to the cross-cutting repo standard in the same pass.

**Non-Goals:**

- Repairing the corrupt index.
- Migrating history.
- Converting the unpkg application templates.
- Pushing anything.

## Decisions

- **Fork instead of purge.** A working-tree copy plus `git init -b main` gets a usable repository
  without any operation on the broken original. The cost is a lost history that was, in this case,
  mostly binary weight nobody wants carried forward.
- **New name, not a re-init in place.** `design-plugins/` as a sibling makes the supersession
  visible and keeps both trees on disk simultaneously. The same fork-to-new-name pattern applies to
  any future repo facing a history rewrite.
- **`gh repo create` without `--push`.** This is the single authorized remote action in the run, and
  it creates an empty private repository only. The guard matters: the active token belongs to the
  personal `danielbodnar` account, so the org must be targeted explicitly, and a create that would
  land in the personal namespace is skipped and reported rather than accepted.
- **Pre-push guard installed immediately.** An executable `.git/hooks/pre-push` that exits `1` turns
  an accidental push into a clean error. It lives in `.git/` and is never committed.
- **Keep the nine PNGs and use them.** The cross-cutting standard calls for screenshots where assets
  already exist. They are small and already optimized; regenerating or discarding them would be
  worse than the deviation from the no-binaries rule, which is recorded rather than hidden.
- **`skip_specs: true`.** This change is a migration plus documentation. The quality baseline the
  fork adopts is specified by `apply-repo-standard`; restating it here would duplicate requirements
  and invent behaviour that already has an owner.
- **Recompile workflows only if the compiler regenerates them,** and in a separate commit, so the
  v0.81.6-to-v0.85.4 lock churn is reviewable on its own.

## Risks / Trade-offs

- A fresh history orphans the original's three non-main remote branches. Unavoidable given the
  index corruption; mitigated by listing them in the morning report so the work is not lost silently.
- Two copies of the design plugins on disk invites editing the wrong one. Mitigated by leaving a
  note in the fork's README and by the original being unusable for git operations anyway.
- Creating the remote repository before Daniel has approved publication commits the org to a name.
  Accepted because it was explicitly authorized, and because an empty private repository is
  reversible.
- ADR 0004 defers a real technical debt -- unpkg-loaded React in committed templates. Accepted:
  converting a 1400-line application template into a component specimen is a product decision.

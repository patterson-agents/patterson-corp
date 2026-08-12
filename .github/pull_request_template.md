<!--
Fill this in honestly. An unchecked box that should be checked is more useful to a
reviewer than a checked box that is not true. See CONTRIBUTING.md for the conventions
referenced below.
-->

## What this changes

<!-- One or two sentences. Link the OpenSpec change under openspec/changes/ this implements. -->

## OpenSpec change

- [ ] This implements `openspec/changes/<change-id>/` and I ran `openspec validate --strict` against it.
- [ ] `tasks.md` in that change is checked off for everything this PR completes.

## Checklist

- [ ] `sh scripts/verify-all.sh` passes locally (paste the tail of its output below if any check needed a second look).
- [ ] Every new or changed validator script has tests written before the implementation, and the tests are included in this PR.
- [ ] Every new or changed skill has `_SOURCES.md` and `REFERENCES.md`, and any source-silent gap is recorded as `[TBD: ...]` rather than filled with a guess.
- [ ] Skill directory names equal their `SKILL.md` frontmatter `name:` field.
- [ ] No tracked binaries were added (fonts, PDFs, Office documents, archives, or raster images over 50 KiB; SVG is exempt).
- [ ] This change stays within the repository's 1 MiB tracked-byte budget.
- [ ] No absolute path was substituted for `${CLAUDE_PLUGIN_ROOT}` anywhere.
- [ ] No Node 20 reference was introduced; every pinned runtime targets Node 24.
- [ ] Commit messages follow Conventional Commits.

## Review

- [ ] **Two approvers** have reviewed this pull request, per the CI/CD Pipeline Standard's pull request policy.

## verify-all.sh output (tail)

```text
<paste here>
```

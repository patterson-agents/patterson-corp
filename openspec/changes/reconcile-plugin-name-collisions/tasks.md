## 1. Verify the collision facts

- [ ] 1.1 Read the marketplace `name` field from every Patterson marketplace manifest and confirm the four values are distinct
- [ ] 1.2 Enumerate plugin names across `patterson-corp`, `patterson-marketplace`, `patterson-skills`, and `patterson-design-plugins`
- [ ] 1.3 Confirm the `patterson-design` collision between `patterson-marketplace` and `patterson-skills`
- [ ] 1.4 Confirm the unreported `patterson-brand` collision between `patterson-corp` and `patterson-design-plugins`
- [ ] 1.5 Record the evidence commands so the finding is reproducible

## 2. Harvest the workflow-designer skill

- [ ] 2.1 Confirm `patterson-labs` has landed its baseline and harvest destination
- [ ] 2.2 Copy `patterson-skills/.github/skills/agentic-workflow-designer/` into `patterson-labs`
- [ ] 2.3 Update the `SKILL.md` frontmatter `name` to equal the new directory name, plain kebab-case, no namespace prefix
- [ ] 2.4 Run the labs test suite and confirm the name-equals-directory check passes

## 3. Deprecate patterson-skills locally

- [ ] 3.1 Add a deprecation banner to the `patterson-skills` README pointing to `patterson-marketplace`
- [ ] 3.2 Set `deprecated: true` and prefix the description in its `marketplace.json`
- [ ] 3.3 Commit on the existing history with a conventional commit subject
- [ ] 3.4 Confirm no archive, transfer, or other remote operation was attempted

## 4. Review the patterson-marketplace conversion

- [ ] 4.1 Read `.remember/now.md` for the prior session's provenance and verification notes
- [ ] 4.2 Enumerate the 55 changes and confirm they are the 21 script conversions plus directly related files
- [ ] 4.3 Check every converted script for erasable syntax only: no `enum`, `namespace`, parameter properties, or legacy decorators
- [ ] 4.4 Check every converted script imports `node:` builtins only, with no third-party dependency
- [ ] 4.5 Check behavioural parity against each Python original
- [ ] 4.6 If every check passes, commit as a single conversion refactor citing the prior session's provenance
- [ ] 4.7 If any check fails, commit nothing in this repository and write the escalation note
- [ ] 4.8 Confirm no blanket `git add -A` was used

## 5. Decision record

- [ ] 5.1 Write `docs/decisions/0003-plugin-name-reconciliation.md`
- [ ] 5.2 Record that HANDOFF.md 1G's marketplace-level collision premise is wrong, with the verified names
- [ ] 5.3 Record the `patterson-design` collision and its resolution through the `patterson-skills` retirement
- [ ] 5.4 Record the `patterson-brand` collision as decision-needed: options, consequences, recommendation, no rename applied
- [ ] 5.5 Note that plugin names resolve first-found-wins and the losing publisher receives no signal

## 6. Verification

- [ ] 6.1 Confirm no plugin was renamed in any repository
- [ ] 6.2 Confirm the `patterson-brand` decision is queued for the morning report
- [ ] 6.3 Confirm no push, no `gh` invocation, and no history rewrite occurred in either legacy repository

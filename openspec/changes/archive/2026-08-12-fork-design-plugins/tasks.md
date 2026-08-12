## 1. Confirm the starting state

- [ ] 1.1 Confirm correction C3: `git status` fails in `patterson-design-plugins` while `git log` works
- [ ] 1.2 Record the three non-main remote branches (`copilot/fix-vhs-demos-and-scripts`, `copilot/optimize-plugin-assets`, and the codespace branch) for the morning report
- [ ] 1.3 Confirm the gh-aw version installed (v0.85.4) against the version the existing `.lock.yml` files were compiled with (v0.81.6)

## 2. Create the fork

- [ ] 2.1 Copy the `patterson-design-plugins` working tree to a new sibling `design-plugins/`, excluding `.git`
- [ ] 2.2 Write `.gitignore` in the fork before any other file
- [ ] 2.3 Run `git init -b main` in the fork
- [ ] 2.4 Confirm `patterson-design-plugins` has received no git operation, no deletion, and no file modification

## 3. Fixes and decisions in the fork

- [ ] 3.1 Fix the undefined `.pat-docs` CSS class
- [ ] 3.2 Write `docs/decisions/0004-unpkg-react-application-templates.md` recording that the unpkg React templates are not converted, why, and that the decision is Daniel's
- [ ] 3.3 Run the forbidden-content greps: Figtree, `d98a00`, `c0392b`, `rul6mjk`, uppercase `text-transform`, font binaries, `.py`, `node:20`
- [ ] 3.4 Record any grep hit rather than silently fixing content outside this change's scope

## 4. Apply the repo standard

- [ ] 4.1 Write the house-style `README.md`, using the nine existing optimized PNG screenshots
- [ ] 4.2 Record the README-imagery deviation from the no-binaries rule
- [ ] 4.3 Confirm no new raster assets were generated; any new visual is SVG or mermaid
- [ ] 4.4 Write `.devcontainer/devcontainer.json` on a pinned `node:24`-family image
- [ ] 4.5 Add a runnable test suite and CI that runs it, tests written before the checks they cover

## 5. Commit and the single authorized remote action

- [ ] 5.1 Commit `feat: initial commit of Patterson design system plugins`
- [ ] 5.2 Run `gh repo create patterson-agents/design-plugins --private --source=. --remote=origin` with no `--push`
- [ ] 5.3 If the org create fails, or would land in the personal `danielbodnar` namespace, skip it and record the outcome; never create `danielbodnar/design-plugins`
- [ ] 5.4 Install the executable `.git/hooks/pre-push` guard immediately after the remote exists, and confirm it is not committed

## 6. Agentic workflows

- [ ] 6.1 Run `gh aw compile` and determine whether the `.lock.yml` files are regenerated
- [ ] 6.2 If regenerated, commit the recompilation separately and note the v0.81.6 to v0.85.4 version bump
- [ ] 6.3 Confirm no new agentic workflow was authored in this change

## 7. Verification

- [ ] 7.1 Run `claude plugin validate .` in the fork
- [ ] 7.2 Run the fork's test suite and confirm a clean pass
- [ ] 7.3 Review `git log --stat` for font binaries, oversized PNGs, and `.tmp/` content
- [ ] 7.4 Confirm nothing was pushed and that the only remote call made was the authorized `gh repo create`
- [ ] 7.5 Queue the morning-report items: original repository disposition, orphaned branches, README-imagery deviation, ADR 0004

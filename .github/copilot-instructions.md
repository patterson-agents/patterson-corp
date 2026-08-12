# Copilot instructions for patterson-corp

This is Patterson's enterprise Claude Code plugin marketplace: the capability true for all
of Patterson, shipped as installable plugins under `plugins/`. Full detail lives in
`CONTRIBUTING.md` -- this file is the short version for an in-editor agent.

- **Every change goes through OpenSpec.** Look under `openspec/changes/` before writing
  code. If no change proposal covers what you are about to do, propose one first
  (`proposal.md`, `tasks.md`, and a delta spec) rather than editing `plugins/` directly.
- **Zero-dependency TypeScript only.** Scripts run as `node script.ts` -- no build step, no
  bundler, no `package.json`, no `node_modules`. Import only `node:*` built-ins. Use
  erasable syntax exclusively: no `enum`, `namespace`, parameter properties, or legacy
  decorators; Node's type stripper cannot erase them and the script throws at runtime.
- **Target Node 24, never Node 20.** Every pinned runtime in this repository -- CI, the
  devcontainer, `copilot-setup-steps.yml` -- is `node:24`-family.
- **A validator is a contract.** Path argument in; exit `0` (pass), `1` (findings), or `2`
  (could not evaluate); output `LEVEL|file|line|rule|message`, one finding per line. Match
  the shape already in `plugins/patterson-engineering/skills/*/scripts/*.ts` rather than
  inventing a new one.
- **Tests come before implementation.** For a new validator, write the failing
  `run-tests.sh` fixtures first. If a fixture needs an oversized file or a binary to prove
  a check works, generate it at test-run time into a throwaway directory -- never commit
  it; a committed binary or oversized tree would itself violate the checks it tests.
- **Every skill carries `_SOURCES.md` and `REFERENCES.md`.** When the underlying source
  material is silent on something, write `[TBD: what is missing]`. Never invent an answer
  to fill a source-silent gap -- that is a finding for the standard's owner, not something
  this platform decides.
- **`${CLAUDE_PLUGIN_ROOT}` stays literal.** Every intra-plugin path in a `SKILL.md`, agent,
  or hook uses this exact token, never a resolved absolute path.
- **A skill's directory name equals its `SKILL.md` frontmatter `name:` field.**
  `scripts/verify-all.sh` enforces this.
- **No binaries, ever.** No fonts, PDFs, Office documents, or archives; no raster image over
  50 KiB (SVG is exempt at any size). Patterson's brand font is referenced by Adobe Fonts
  CDN kit ID, never shipped as a file.
- **1 MiB tracked-byte budget.** Measured by `git ls-files` byte sizes, not `du`. Run
  `sh scripts/verify-all.sh` before proposing a change that adds meaningful content.
- **No emoji.** This is a B2B healthcare distribution brand; use GFM alerts and tables for
  emphasis instead.
- **Conventional commits.** `<type>(<scope>): <summary>`.
- **There is no `LICENSE` file, and that is intentional.** Manifests declare
  `"license": "UNLICENSED"` pending a Patterson legal ruling. Do not add one and do not
  change that field.

Run the full gate before treating any change as done:

```bash
sh scripts/verify-all.sh
```

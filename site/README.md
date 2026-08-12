# corp.patterson.sh

The documentation site for `patterson-corp`, built with [Starlight](https://starlight.astro.build)
on Astro. Deployed to <https://corp.patterson.sh> by `.github/workflows/pages.yml`.

This directory is the **one documented exception** to the platform's zero-dependency rule. It
carries `astro@7.1.5` and `@astrojs/starlight@0.41.5`, pinned without a caret, plus a committed
`bun.lock`. Everything outside `site/` remains zero-dependency TypeScript run directly by Node.
See [`docs/decisions/0005-branded-doc-sites.md`](../docs/decisions/0005-branded-doc-sites.md).

## Almost every page here is generated

The Markdown under `plugins/`, `docs/`, `openspec/` and the root governance files is the source of
truth. `scripts/build-site-content.ts` derives the site's pages from it — it does not fork prose.
Each generated page carries the file it came from, both as an HTML comment and as the page's
"Edit page" link.

```sh
node ../scripts/build-site-content.ts   # or: bun run content
```

The generated trees are **not tracked** (see the repository's `.gitignore`), so tracked bytes stay
flat as the catalog grows and a page can never drift from its source. The generator removes and
rebuilds every directory it owns on each run, so a renamed or deleted source cannot leave a stale
page behind.

| Section | Generated from |
|---|---|
| `architecture/` | `docs/architecture/*.md`, split on its own section boundaries, plus a diagrams page inlining `docs/diagrams/*.svg` |
| `plugins/` | each plugin's `README.md`, each skill's `SKILL.md`, and every file in that skill's `references/` |
| `decisions/` | `docs/decisions/*.md` |
| `specifications/` | `openspec/specs/**/spec.md`, grouped by capability area |
| `governance/` | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `AGENTS.md` |
| `provenance.md` | every skill's `_SOURCES.md` and `REFERENCES.md`, plus a live `[TBD]` count |

`src/content/docs/index.mdx` is the only hand-authored page.

## Commands

```sh
bun install          # once
bun run content      # regenerate the derived pages
bun run dev          # regenerates content, then serves with hot reload
bun run build        # astro build -> dist/  (run `bun run content` first)
bun run preview      # serve the built dist/
```

`bun run build` deliberately does **not** run the generator. CI runs the two steps separately so a
content failure is distinguishable from a build failure, and so the same generated tree is built
once rather than twice.

> [!IMPORTANT]
> The sidebar autogenerates from the directories the generator writes. Running `astro build`
> without generating content first fails loudly rather than publishing a half-empty site.

## The deployed artifact is composed

`site/dist` is not deployed on its own. `pages.yml` composes it with the repository's pre-existing
`docs/` tree so that every URL that resolved before this site existed still resolves:

- `site/dist` becomes the site root
- `docs/` is copied to `/docs/`
- each subdirectory of `docs/` is also copied to its original root-level path — `/assets/`,
  `/diagrams/`, `/architecture/`, `/decisions/`

The one path whose content intentionally changes is `/`, which now serves this site instead of the
previous hand-authored page. That page is still published, at `/docs/`.

## Brand rules that apply here

- **Sentence case everywhere.** No uppercase transforms, in content or in CSS. The repository gate
  fails on a `text-transform` set to all caps.
- **No emoji.** This is a business-to-business healthcare distribution brand.
- **Fonts come from the Adobe Fonts kit only.** Proxima Nova loads from kit `uth1qfm`, linked from
  the `head` entry in `astro.config.mjs`. Never self-host it and never add an `@font-face` rule for
  it — Adobe's terms do not permit re-hosting Typekit payloads. Arial is the sanctioned substitute.
- **Accent policy.** On light, navy `#003767` carries strong text and link blue `#147EC2` carries
  links; sky `#00A8E1` appears only as non-text chrome. On dark, sky and its tints carry the
  accent. Accent colors never carry body copy or legal text.
- `src/styles/patterson.css` is the brand file and maps Patterson tokens onto Starlight's `--sl-*`
  variables. `src/styles/site.css` adds only what is specific to this site: the inlined diagrams
  and the splash proof points.

## Dependencies

`astro` and `@astrojs/starlight` are the only two direct dependencies, both pinned exactly and both
supply-chain scored in ADR 0005. Adding a third means scoring it with
`socket package shallow npm pkg:npm/<name>@<version> --markdown` first and surfacing anything below
90 before it lands.

The image pipeline uses Astro's `passthroughImageService()` rather than the default sharp-backed
service. Astro still declares `sharp` as an *optional* dependency, so it appears in `bun.lock` and
in `node_modules`; it is never loaded. Do not add it directly, do not switch the image service
back, and do not run `bun install --omit=optional` — that strips Rolldown's native binding along
with sharp and breaks the build.

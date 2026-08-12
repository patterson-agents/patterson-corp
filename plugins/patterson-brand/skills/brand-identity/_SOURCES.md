# Sources — brand-identity skill

Extraction date: **2026-08-11**. All reading was done locally from Patterson-owned PDFs and cached
production stylesheets; nothing in this skill was fetched from the open internet or invented.

---

> [!IMPORTANT]
> **No binaries are shipped with this plugin.** No PDF, image, font, logo or template file is
> committed. Canonical originals live on SharePoint — see [`REFERENCES.md`](REFERENCES.md).

## Confidence scale

| Rating | Meaning |
|---|---|
| **High** | The value appears as literal text in an authoritative document and, where possible, is corroborated by a second independent source. |
| **Medium** | The value is derived from a documented rule, sampled from vector art, or taken from a production stylesheet rather than a brand document. |
| **Low** | The value is inferred from usage patterns with no explicit statement anywhere. Treat as a hypothesis. |

## Documents this skill draws on

| Key | Document | Date | Confidence | What this skill takes from it |
|---|---|---|---|---|
| `[BG25 p.N]` | **Patterson Companies Brand Guide, VERSION 3.2025** (69 pp.) — **authoritative** | 2025-04-08 | **High** | Palette (p.24), typography (p.25–27), sentence-case mandate (p.25–26, p.57, p.59), logo system (p.13–23), buttons (p.57), marquees (p.60), banner ads (p.62), photography (p.33–39), icons (p.41–42), video (p.52), image specs (p.44–48) |
| `[DS20 p.N]` | DesignSystem_042120.pdf — UX design system and governance (40 slides) | 2020-04 | High for content; superseded where it conflicts with BG25 | WCAG-adjusted digital palette (p.7–8), UI copy rules (p.10), atomic model (p.12–13), buttons (p.15), eyebrows (p.16), pattern library (p.18–38), governance (p.40) |
| `[IMG20 p.N]` | ImageSpecs_042120.pdf — image and icon export specs (2 pp., **image-only, OCR'd**) | 2020-04-21 | **Medium** — guidance paragraphs OCR'd cleanly; small wireframe dimension labels did not | Icon export (80×80 SVG/PNG @2x, export from the .RGB file), image file-weight guidance |
| `[VEND22]` | Patterson Companies Brand Guide — Vendors | 2022-11 | High for what it says; superseded by BG25 where they differ | Conflicts #7, #8, #9 in [`references/conflicts-and-gaps.md`](references/conflicts-and-gaps.md) |
| `[BG22]` | PDCO_BrandGuide_2022.pdf — **superseded** | 2022 | High for content; **not authority** | Confirms the palette has been stable since 2022; source of the reversed all-caps rule |
| `[DPL]` | Patterson Digital Pattern Library **v5.7.2** `toolkit.css` — production stylesheet, not a brand document | — | High for what the code does; Medium as a statement of brand intent | Shipped type scale, button/input/eyebrow implementation, status colors, neutrals, breakpoints, 5px grid |
| `[PCOM]` | pattersoncompanies.com WordPress `theme-styles.min.css?ver=3.2.2` — production stylesheet | — | High as corroboration only | Independent confirmation of the BG25 palette hexes |

## Notable derived values

### Tint ramp (75 / 50 / 25) — Medium confidence

`[BG25 p.24]` prints tint swatches with no labels, percentages or hexes. Page 24 was rendered at
130 dpi and the swatch rows sampled pixel-by-pixel; every row resolves to a uniform four-step ramp at
100/75/50/25 over white:

```text
navy  0,55,104  →  64,105,142  →  127,155,179  →  191,205,217
```

and identically for every other row. The hexes published in this skill apply that ramp to the
*published* base hexes and land within ±1 of the render.

> [!NOTE]
> **The step percentages themselves are not published** — see gap #1 in
> [`references/conflicts-and-gaps.md`](references/conflicts-and-gaps.md).

### 5px spacing grid — Medium confidence

No Patterson source publishes a spacing scale. Derived from `[BG25 p.57]`'s explicit 30px button
padding plus `[DPL]` padding values clustering exactly on multiples of 5 (5/10/15/20/25/30/50/60/80).
See gap #2.

## Provenance findings worth knowing

- The 2022 guide's color palette (p.27) is **identical** to `[BG25 p.24]` — same hexes, same PMS, CMYK
  and RGB. The palette has been stable since at least 2022, which materially raises confidence.
- The 2022 guide's typography section states *"Titles should be all caps"* — **directly reversed** by
  `[BG25 p.25–26]`. This is the single most consequential editorial change between the two guides.

> [!CAUTION]
> `ds/assets/fonts/proxima-nova-italic.woff2` in the predecessor `patterson-design-plugins` repo is
> **byte-identical (md5 `76bb0b958a918b4d270df75ecf0be2fe`)** to the Adobe Fonts CDN payload for
> `fvd=i4`, contradicting the claim in that repo that it was a licensed self-hosting file. See
> [`references/typography.md`](references/typography.md) §2.

## Escalation

Anything not covered here, and every `[TBD]` in
[`references/conflicts-and-gaps.md`](references/conflicts-and-gaps.md):
**corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`.

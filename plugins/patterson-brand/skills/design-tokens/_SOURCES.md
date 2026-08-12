# Sources — design-tokens skill

Extraction date: **2026-08-11**. Every token traces to a Patterson document or production stylesheet;
nothing is invented. Gaps are recorded in `tokens.json._tbd`, not guessed.

---

> [!IMPORTANT]
> **No binaries are shipped.** No font file, no image, no PDF. Canonical originals: see
> [`REFERENCES.md`](REFERENCES.md).

## Confidence scale

| Rating | Meaning |
|---|---|
| **High** | Literal text in an authoritative document, corroborated where possible by a second source. |
| **Medium** | Derived from a documented rule, sampled from vector art, or taken from a production stylesheet rather than a brand document. |
| **Low** | Inferred from usage with no explicit statement. Treat as a hypothesis. |

## Documents behind each token group

| Token group | Source | Confidence |
|---|---|---|
| `color.brand` | `[BG25 p.24]` — printed with hex, RGB, CMYK and PMS for every color. Corroborated verbatim by the pattersoncompanies.com theme stylesheet, and identical in the 2022 guide (p.27) | **High** |
| `color.tint` | `[BG25 p.24]` — swatches only, **no printed values**. Recovered by rendering p.24 at 130 dpi and sampling the vector fills; every row resolves to a uniform 75/50/25 ramp over white | **Medium** |
| `color.digital` | `[DS20 p.7–8]` — printed hexes with usage rules; shipped in the DPL | **High** |
| `color.status` | `[DPL]` `.message-box--*`. `[DS20 p.37]` names the four states but publishes no hexes | **Medium** — implementation values, not brand-published |
| `color.semantic`, `color.semanticDark` | Composed from the above; every entry is an alias to a documented Patterson color, never a new value | **High** (composition), inherits the confidence of what it aliases |
| `font.family` | `[BG25 p.25]` names Proxima Nova and Arial; production stack verbatim from `[DPL]` `body{}` | **High** |
| `font.weight` | `[BG25 p.25, p.27]` names the weights by role; numeric values are the standard Proxima Nova mapping | **High** for roles, **Medium** for the numeric mapping |
| `font.size`, `font.lineHeight` | `[DPL]` shipped web scale; CTA size confirmed at `[BG25 p.57]` | **High** |
| `typography.leading`, `typography.tracking` | `[BG25 p.27]`, converted from InDesign 1/1000-em tracking units | **High** |
| `typography.case` | `[BG25 p.25, p.26, p.27, p.28, p.57, p.59]`, `[DS20 p.10]` | **High** |
| `dimension.spacing` | Inferred: `[BG25 p.57]`'s explicit 30px button padding plus `[DPL]` padding values clustering on multiples of 5 | **Medium** |
| `dimension.radius` | `[BG25 p.57]` "Rounded corners: 5px radius"; dominant value in `[DPL]` (20 occurrences) | **High** |
| `dimension.control` | `[BG25 p.57]` for button height/padding; `[DPL]` for min/max width and input padding; `[IMG20 p.2]` for icon size | **High** |
| `dimension.layout` | `[DPL]` media queries (600px × 220 uses, 900px × 164) and the 1300px page wrapper | **High** |
| `asset.imageSize`, `asset.characterLimit` | `[BG25 p.44–62]`, `[DS20 p.17–36]` | **High** |
| `asset.fileWeight` | `[IMG20 p.1–2]` — **OCR'd from an image-only PDF** | **Medium** |

## Source documents

| Key | Document | Date |
|---|---|---|
| `[BG25]` | Patterson Companies Brand Guide, VERSION 3.2025 (69 pp.) — **authoritative** | 2025-04-08 |
| `[DS20]` | DesignSystem_042120.pdf — UX design system and governance (40 slides) | 2020-04 |
| `[IMG20]` | ImageSpecs_042120.pdf — image/icon export specs (2 pp., image-only, OCR'd) | 2020-04-21 |
| `[DPL]` | Patterson Digital Pattern Library v5.7.2 `toolkit.css` — production stylesheet | — |
| `[PCOM]` | pattersoncompanies.com WordPress `theme-styles.min.css?ver=3.2.2` — production stylesheet | — |

> `[DS20]` describes itself as *"complimentary to the already existing Patterson Corporate brand
> guidelines… with subtle adjustments to align with digital best practices"* (slide 6).

It does **not** claim to override the brand guide. `[DPL]` and `[PCOM]` are production code, not brand
documents, and are labelled as such everywhere they are used.

## The one conflict that matters for this skill

> [!WARNING]
> `--primary`. `[BG25 p.57]` states the default button color is sky
> ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1`. `[DS20 p.7–8]` replaced that with
> ![](https://img.shields.io/badge/-269BCB-269BCB) `#269BCB` for digital specifically to satisfy WCAG
> 2.0 contrast, and `[DPL]` ships `#269BCB` on every button. `theme.css` defaults to the authoritative
> 2025 value and provides the opt-in `.patterson-a11y` class for the digital set. **Unresolved by the
> sources** — escalate to corporatemarketing@pattersoncompanies.com.

## Generation provenance

`assets/theme.css` is produced by `scripts/build-theme.ts` from `assets/tokens.json`. The two are
verified byte-identical by `scripts/verify-theme.sh`. Structure and comments live in the script's
`TEMPLATE`; every value comes from the token file.

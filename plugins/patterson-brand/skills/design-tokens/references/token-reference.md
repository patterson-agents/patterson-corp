# Token reference

Grouped as they appear in `assets/tokens.json`. Source keys: `[BG25 p.N]` Brand Guide 2025
(authoritative) · `[DS20 p.N]` DesignSystem_042120 · `[DPL]` Digital Pattern Library v5.7.2 ·
`[IMG20 p.N]` ImageSpecs_042120.

---

## `color.brand` `[BG25 p.24]`

| Swatch | Token | Tailwind utility | Value |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | `navy` | `pat-navy` | `#003767` |
| <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | `sky` | `pat-sky` | `#00A8E1` |
| <img src="https://img.shields.io/badge/-58585B-58585B" alt="58585B"> | `gray` | `pat-gray` | `#58585B` |
| <img src="https://img.shields.io/badge/-FFFFFF-FFFFFF" alt="FFFFFF"> | `white` | `pat-white` | `#FFFFFF` |
| <img src="https://img.shields.io/badge/-147EC2-147EC2" alt="147EC2"> | `blue` | `pat-blue` | `#147EC2` |
| <img src="https://img.shields.io/badge/-6DCFF6-6DCFF6" alt="6DCFF6"> | `blueLight` | `pat-blue-light` | `#6DCFF6` |
| <img src="https://img.shields.io/badge/-ECECEC-ECECEC" alt="ECECEC"> | `grayLight` | `pat-gray-light` | `#ECECEC` |
| <img src="https://img.shields.io/badge/-7BC24D-7BC24D" alt="7BC24D"> | `green` | `pat-green` | `#7BC24D` |
| <img src="https://img.shields.io/badge/-00817D-00817D" alt="00817D"> | `teal` | `pat-teal` | `#00817D` |
| <img src="https://img.shields.io/badge/-522E91-522E91" alt="522E91"> | `purple` | `pat-purple` | `#522E91` |

## `color.tint` `[BG25 p.24]`, sampled — 75 / 50 / 25 over white

| Base | 75% | 50% | 25% |
|---|---|---|---|
| `navy` | ![](https://img.shields.io/badge/-40698D-40698D) `#40698D` | ![](https://img.shields.io/badge/-809BB3-809BB3) `#809BB3` | ![](https://img.shields.io/badge/-BFCDD9-BFCDD9) `#BFCDD9` |
| `sky` | ![](https://img.shields.io/badge/-40BEE8-40BEE8) `#40BEE8` | ![](https://img.shields.io/badge/-80D4F0-80D4F0) `#80D4F0` | ![](https://img.shields.io/badge/-BFE9F8-BFE9F8) `#BFE9F8` |
| `gray` | ![](https://img.shields.io/badge/-828284-828284) `#828284` | ![](https://img.shields.io/badge/-ACACAD-ACACAD) `#ACACAD` | ![](https://img.shields.io/badge/-D5D5D6-D5D5D6) `#D5D5D6` |
| `blue` | ![](https://img.shields.io/badge/-4F9ED1-4F9ED1) `#4F9ED1` | ![](https://img.shields.io/badge/-8ABEE0-8ABEE0) `#8ABEE0` | ![](https://img.shields.io/badge/-C4DFF0-C4DFF0) `#C4DFF0` |
| `blueLight` | ![](https://img.shields.io/badge/-92DBF8-92DBF8) `#92DBF8` | ![](https://img.shields.io/badge/-B6E7FA-B6E7FA) `#B6E7FA` | ![](https://img.shields.io/badge/-DAF3FD-DAF3FD) `#DAF3FD` |
| `green` | ![](https://img.shields.io/badge/-9CD17A-9CD17A) `#9CD17A` | ![](https://img.shields.io/badge/-BDE0A6-BDE0A6) `#BDE0A6` | ![](https://img.shields.io/badge/-DEF0D2-DEF0D2) `#DEF0D2` |
| `teal` | ![](https://img.shields.io/badge/-40A09E-40A09E) `#40A09E` | ![](https://img.shields.io/badge/-80C0BE-80C0BE) `#80C0BE` | ![](https://img.shields.io/badge/-BFE0DE-BFE0DE) `#BFE0DE` |
| `purple` | ![](https://img.shields.io/badge/-7D62AC-7D62AC) `#7D62AC` | ![](https://img.shields.io/badge/-A896C8-A896C8) `#A896C8` | ![](https://img.shields.io/badge/-D4CBE4-D4CBE4) `#D4CBE4` |

Utilities are `pat-navy-75`, `pat-sky-25`, etc.

> [!NOTE]
> The step percentages are **not** published — `[TBD]`, see `tokens.json._tbd.tintStepPercentages`.

## `color.digital` `[DS20 p.7–8]`, shipped in `[DPL]`

| Swatch | Token | Utility | Value | Use |
|---|---|---|---|---|
| <img src="https://img.shields.io/badge/-269BCB-269BCB" alt="269BCB"> | `sky` | `pat-digital-sky` | `#269BCB` | Interactive blue on screen (WCAG-adjusted) |
| <img src="https://img.shields.io/badge/-147CBD-147CBD" alt="147CBD"> | `link` | `pat-digital-link` | `#147CBD` | Links on white/light gray |
| <img src="https://img.shields.io/badge/-9B9B9B-9B9B9B" alt="9B9B9B"> | `greyMedium` | `pat-digital-grey-medium` | `#9B9B9B` | Secondary text |
| <img src="https://img.shields.io/badge/-F8F8F8-F8F8F8" alt="F8F8F8"> | `greyLight` | `pat-digital-grey-light` | `#F8F8F8` | Section backgrounds |
| <img src="https://img.shields.io/badge/-0CA50F-0CA50F" alt="0CA50F"> | `green` | `pat-digital-green` | `#0CA50F` | Accent + success |
| <img src="https://img.shields.io/badge/-008E8B-008E8B" alt="008E8B"> | `teal` | `pat-digital-teal` | `#008E8B` | Accent |
| <img src="https://img.shields.io/badge/-512E91-512E91" alt="512E91"> | `purpleOnLight` | `pat-digital-purple` | `#512E91` | Accent on light |
| <img src="https://img.shields.io/badge/-9660F3-9660F3" alt="9660F3"> | `purpleOnDark` | `pat-digital-purple-dark` | `#9660F3` | Accent on navy |
| <img src="https://img.shields.io/badge/-001C34-001C34" alt="001C34"> | `navyDeep` | `pat-navy-deep` | `#001C34` | Navy pressed/hover |
| <img src="https://img.shields.io/badge/-D8D8D8-D8D8D8" alt="D8D8D8"> | `rule` | `pat-rule` | `#D8D8D8` | Dividers |
| <img src="https://img.shields.io/badge/-A8A9AC-A8A9AC" alt="A8A9AC"> | `fieldBorder` | `pat-field-border` | `#A8A9AC` | Input border, disabled |
| <img src="https://img.shields.io/badge/-F0F0F0-F0F0F0" alt="F0F0F0"> | `disabledBg` | `pat-disabled-bg` | `#F0F0F0` | Disabled field background |

> [!WARNING]
> Accent colors must never be used for body copy or legal disclaimers `[DS20 p.8]`.

## `color.status` `[DPL]`, states named at `[DS20 p.37]`

| Swatch | Token | Value | Utility |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-D0021B-D0021B" alt="D0021B"> | `error` | `#D0021B` | `pat-error`, `--destructive` |
| <img src="https://img.shields.io/badge/-0CA50F-0CA50F" alt="0CA50F"> | `success` | `#0CA50F` | `pat-success`, `--success` |
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | `urgent` | `#003767` (white text) | `pat-urgent`, `--urgent` |
| <img src="https://img.shields.io/badge/-F5A623-F5A623" alt="F5A623"> | `warning` | `#F5A623` | `pat-warning`, `--warning` |

> [!NOTE]
> **Not brand-published** — implementation values.

## `color.semantic` — the shadcn/ui contract (`:root` in `theme.css`)

| Variable | Resolves to | Source |
|---|---|---|
| `--background` | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) `#FFFFFF` | `[BG25 p.24]` |
| `--foreground` | ![](https://img.shields.io/badge/-58585B-58585B) `#58585B` | `[BG25 p.24]` body copy |
| `--card`, `--popover` | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) `#FFFFFF` | `[BG25 p.24]` |
| `--primary` | ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1` | `[BG25 p.57]` default button — **conflict**, DPL ships `#269BCB` |
| `--primary-foreground` | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) `#FFFFFF` | `[BG25 p.57]` |
| `--secondary` / `--secondary-foreground` | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) `#FFFFFF` / ![](https://img.shields.io/badge/-003767-003767) `#003767` | `[DS20 p.15]` navy outline button |
| `--muted` / `--muted-foreground` | ![](https://img.shields.io/badge/-F8F8F8-F8F8F8) `#F8F8F8` / ![](https://img.shields.io/badge/-9B9B9B-9B9B9B) `#9B9B9B` | `[DS20 p.7]` |
| `--accent` / `--accent-foreground` | ![](https://img.shields.io/badge/-BFE9F8-BFE9F8) `#BFE9F8` / ![](https://img.shields.io/badge/-003767-003767) `#003767` | sky 25% tint `[BG25 p.24]` |
| `--destructive` | ![](https://img.shields.io/badge/-D0021B-D0021B) `#D0021B` | `[DPL]` |
| `--border` / `--input` / `--ring` | ![](https://img.shields.io/badge/-D8D8D8-D8D8D8) `#D8D8D8` / ![](https://img.shields.io/badge/-A8A9AC-A8A9AC) `#A8A9AC` / ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1` | `[DPL]`, `[BG25 p.24]` |
| `--chart-1..5` | navy, sky, green, teal, purple | `[BG25 p.24]` tertiary palette is designated for infographics |
| `--sidebar*` | navy ground, sky primary, navy-75 accent | `[BG25 p.52]`, `[BG25 p.24]` |
| `--radius` | `5px` | `[BG25 p.57]` |

`color.semanticDark` mirrors this for the `.dark` selector using only documented on-navy values.

## `font`

**Family:**

```json
{
  "brand":  ["proxima-nova", "Arial", "sans-serif"],
  "office": ["Arial", "Helvetica", "sans-serif"]
}
```

`[BG25 p.25]`, `[DPL]`.

**Weight** `[BG25 p.25, p.27]`:

| Token | Value | Role |
|---|---|---|
| `light` | 300 | Body alternative |
| `regular` | 400 | Body |
| `semibold` | 600 | Subheads, CTA text |
| `bold` | 700 | CTA, shipped h2/h3, eyebrow |
| `extrabold` | 800 | Titles, headlines |

**Size** `[DPL]`:

| Token | Value |
|---|---|
| `h1` | 36px |
| `h1Mobile` | 24px |
| `h2` | 24px |
| `h3` | 18px |
| `body` | 18px |
| `eyebrow` | 15px |
| `cta` | 15px `[BG25 p.57]` |
| `textlink` | 18px |
| `small` | 13px |

**Line height** `[DPL]`: `h1 1.25` · `h1Mobile 1.15` · `h2 1.3` · `h3 1.3` · `body 1.5` · `cta 1.15`.

Tailwind exposes these as `text-pat-h1`, `text-pat-body`, `text-pat-cta`, etc., each carrying its
line height and weight.

## `typography`

**Leading** `[BG25 p.27]` — `headline 0.75` (75% of size), `bodyMin 1.25`, `bodyMax 1.5`.

**Tracking** `[BG25 p.27]`, InDesign units are 1/1000 em:

| Token | Value | Utility |
|---|---|---|
| `default` | `-0.01em` (tracking −10) | `tracking-pat-snug` |
| `largeScale` | `-0.025em` (−25) | `tracking-pat-tight` |
| `bodyMax` | `0` | `tracking-pat-none` |

**Case** — `default`, `headline`, `subhead`, `button`, `eyebrow`, `textlink`, `caption` are all
`sentence`. `titlePrint` and `emailSignaturePromise` are `upper` and are the only exceptions
`[BG25 p.25, p.27, p.28, p.57, p.59]`, `[DS20 p.10]`.

## `dimension`

**Spacing** — 5px base grid; steps 5/10/15/20/25/30/50/60/80 `[DPL]`, `[BG25 p.57]`. `theme.css` sets
`--spacing: 0.3125rem`, so `p-1` = 5px, `p-2` = 10px, `p-6` = 30px.

> [!NOTE]
> **Inferred, not published** — `[TBD]`.

**Radius** — `default 5px` `[BG25 p.57]` · `pill 30px` `[DPL]` toggle track · `circle 50%` `[DPL]`.

**Control:**

| Token | Value | Source |
|---|---|---|
| `buttonHeight` | 46px | `[BG25 p.57]` (conflict: `buttonHeightDpl` 45px) |
| `buttonPaddingX` | 30px | `[BG25 p.57]` |
| `buttonMinWidth` | 100px | `[DPL]` |
| `buttonMaxWidth` | 600px | `[DPL]` |
| `inputPaddingY` | 10px | `[DPL]` |
| `inputPaddingX` | 12px | `[DPL]` |
| `iconSize` | 80px | `[IMG20 p.2]` |

**Layout** `[DPL]` — `containerMax 1300px` · `breakpointMobile 600px` · `breakpointTablet 900px` ·
`breakpointDesktop 1300px`. Utilities are namespaced `pat-mobile`, `pat-tablet`, `pat-desktop` so
stock Tailwind `sm/md/lg/xl` are left intact.

## `asset`

`imageSize` carries the documented pixel dimensions (marquee 675×330, banner ads 970×150 and
350×100, social 1200×628 and 1080×1080, video canvas 1920×1080, pattern image sizes from `[DS20]`).
`characterLimit` carries the marquee copy limits (headline 50, body 150, button 20) `[BG25 p.60]`.
`fileWeight` carries the 200KB export guidance `[IMG20]`.

## Component primitives in `theme.css`

`@layer components` defines `.pat-button`, `.pat-button--secondary`, `.pat-textlink` and
`.pat-eyebrow` — the two elements the Brand Guide specifies pixel-exactly, plus the eyebrow, which is
the most frequently mis-styled element.

> [!TIP]
> The eyebrow is **teal and sentence case**, not sky blue and not uppercase.

## `_tbd` — do not fill these in

`tintStepPercentages` · `namedSpacingScale` · `elevationScale` · `motionTokens` ·
`statusColorsInBrandGuide` · `onDarkErrorColor` · `proximaHeavyWeight` · `typekitWeightCoverage` ·
`wcagTarget` · `imageSpecsPixelLabels` · `iconLibraryContents`.

> [!IMPORTANT]
> Each is something Patterson has never published. `theme.css` deliberately ships **no** shadow scale
> and **no** motion tokens rather than invent them.

---
name: brand-identity
description: Patterson Companies visual brand identity - the color palette and each color's role, logo usage and clear space, Proxima Nova typography, and the mandatory sentence-case rule. Use when applying Patterson branding to a design or document, choosing a brand color or looking up a hex, placing or sizing the Patterson logo, setting headline or button type, or answering questions like "what is Patterson navy", "which blue is the CTA blue", "can we use all caps in this headline", "is this on brand".
---

# Patterson brand identity

Authoritative source: **Patterson Companies Brand Guide, VERSION 3.2025** (69 pp., 8 Apr 2025), cited
below as `[BG25 p.N]`. Where a value comes from the 2020 design system deck it is cited `[DS20 p.N]`;
production-stylesheet values are cited `[DPL]`.

---

> [!IMPORTANT]
> **Never invent a hex, a font name, or a measurement.** If a value is not in this skill's references,
> say so and mark it `[TBD: not specified in <source>]`.

## The one rule that gets broken most

**Sentence case is mandatory in every digital channel.** `[BG25 p.25]`: "All caps are to be avoided in
any digital channel since this is regarded as shouting." `[BG25 p.59]`: titles, headlines, subheads,
text and captions are **all** sentence case. `[BG25 p.57]`: button text is sentence case, "never all
caps."

> [!WARNING]
> This is a **hard reversal** of the 2022 guide, which said "Titles should be all caps." If you are
> working from anything dated 2022 or earlier, that instruction is superseded.

Narrow exceptions, and nothing else:

| Exception | Source |
|---|---|
| Titles *may* be all caps **in print** | `[BG25 p.25]` |
| Titles and footer text, Extrabold or Semibold all caps | `[BG25 p.27]` |
| The brand-promise line in an Outlook email signature, Arial Bold all caps | `[BG25 p.28]` |

## Palette — memorize these six

| Swatch | Role | Name | Hex | PMS |
|---|---|---|---|---|
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | Primary, headlines and dark grounds | Navy | `#003767` | 540 |
| <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | Primary, default CTA and accent | Sky | `#00A8E1` | 2995 |
| <img src="https://img.shields.io/badge/-58585B-58585B" alt="58585B"> | **Body copy** and dividers | Gray 80% | `#58585B` | Cool Gray 11 |
| <img src="https://img.shields.io/badge/-FFFFFF-FFFFFF" alt="FFFFFF"> | Backgrounds for content-heavy work | White | `#FFFFFF` | — |
| <img src="https://img.shields.io/badge/-00817D-00817D" alt="00817D"> | Eyebrow text | Teal | `#00817D` | 7718 |
| <img src="https://img.shields.io/badge/-D0021B-D0021B" alt="D0021B"> | Danger / error | Error red | `#D0021B` | `[DPL]` — not brand-published |

Secondary `[BG25 p.24]` — use for depth, must not dominate:

![](https://img.shields.io/badge/-147EC2-147EC2) **Blue** `#147EC2` (7683) ·
![](https://img.shields.io/badge/-6DCFF6-6DCFF6) **Light blue** `#6DCFF6` (297) ·
![](https://img.shields.io/badge/-ECECEC-ECECEC) **Light gray** `#ECECEC` (Cool Gray 1 @ 50%)

Tertiary `[BG25 p.24]` — infographics and presentations:

![](https://img.shields.io/badge/-7BC24D-7BC24D) **Green** `#7BC24D` (369) ·
![](https://img.shields.io/badge/-00817D-00817D) **Teal** `#00817D` (7718) ·
![](https://img.shields.io/badge/-522E91-522E91) **Purple** `#522E91` (7679)

Warning orange ![](https://img.shields.io/badge/-F5A623-F5A623) `#F5A623` `[DPL]` — an implementation
value, not brand-published.

> [!NOTE]
> **Tints are a 75 / 50 / 25 ramp over white** — not an 80/60/40/20/10 ramp. Full table in
> `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/color-palette.md`.

Icons must **never** use a color outside the brand palette `[BG25 p.42]`.

## Typography

Proxima Nova at every tier `[BG25 p.25]`:

| Use | Weight |
|---|---|
| Titles, headlines | **Extrabold** (800) |
| Subheads | **Semibold** (600) |
| Body copy, long-form | **Regular** (400) or **Light** (300), whichever reads better at scale |
| Calls to action | **Bold** (700) `[BG25 p.27]` |
| OfficeSuite — Outlook, PowerPoint, Teams, SharePoint | **Arial** Regular / Bold |

Tracking **−10** (`-0.01em`); **−25** (`-0.025em`) is acceptable at large scale; body copy runs 0 to
−10. Leading is **75% of type size** for headings, **125–150%** for body. Everything is flush left.
`[BG25 p.27]`

> [!CAUTION]
> **Do not ship Proxima Nova font files.** It is licensed through Adobe Fonts; load kit **`uth1qfm`**
> (`https://use.typekit.net/uth1qfm.css`) and declare `font-family: "proxima-nova", Arial, sans-serif`.
> `uth1qfm` serves 400/500/600/700/800 in normal and italic, so Semibold 600 and Extrabold 800 render
> for real; the other kit in evidence, `rul6mjk`, serves only 400/700 and forces the browser to
> synthesise them. See `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/typography.md` and the
> plugin README for the full licensing position.

## Logo

- Four marks `[BG25 p.13]`: the **handshake** (corporate communications only — never for a business
  unit), the **business-agnostic** logo (internal / unit-agnostic external), the **primary** logo, and
  the **secondary/square** logo.
- Colorways `[BG25 p.14, p.16]`: navy, sky, dark gray (80% black), black, white reverse. Navy and sky
  first; dark gray only for grayscale; black only for very limited printing.
- **Clear space**: the height of the "P" in PATTERSON in print, **half** that in digital
  `[BG25 p.14]`. AHI uses the height of the "A" in Animal `[BG25 p.23]`.
- Placement `[BG25 p.15]`: lower right or upper left.
- Co-branding `[BG25 p.18]`: Patterson is always dominant and always on the **left**; partner right
  and proportionally slightly smaller, separated by a vertical rule.

> [!WARNING]
> **Never** `[BG25 p.20]`: use the old gold-and-blue logo, use an old version, resize any part,
> distort or skew, rearrange elements, add names or elements, alter the color, place the logo over an
> image, or place an image inside the shape.

## Geometry and controls

| Property | Value | Source |
|---|---|---|
| Corner radius | 5px | `[BG25 p.57]` |
| Button height | 46px | `[BG25 p.57]` |
| Button side padding | 30px each side (width = type width + padding) | `[BG25 p.57]` |
| Button type | Proxima Nova Semibold 15px, 0 tracking, centered, white on sky `#00A8E1` | `[BG25 p.57]` |
| Spacing grid | 5px — inferred, not published | `[DPL]` |
| Icons | 80 × 80px SVG for web, PNG @2x for email | `[DS20 p.18]`, `[IMG20 p.2]` |

> [!NOTE]
> `[DPL]` ships `min-height: 45px` — a known conflict. Design to **46px**.

## Two palettes exist — know which one you are in

`[BG25 p.24]` publishes the print/brand palette. `[DS20 p.7–8]` publishes a **WCAG-adjusted digital
palette** with different hexes that Patterson web properties actually render:

| Swatch | Name | Hex | Source |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | Sky (print/brand) | `#00A8E1` | `[BG25 p.24]` — the default here |
| <img src="https://img.shields.io/badge/-269BCB-269BCB" alt="269BCB"> | Digital sky | `#269BCB` | `[DS20 p.7]` |
| <img src="https://img.shields.io/badge/-147CBD-147CBD" alt="147CBD"> | Link blue | `#147CBD` | `[DS20 p.7]` |

> [!WARNING]
> The 2025 guide does not acknowledge the digital palette; the 2020 deck does not claim to override
> the guide. **Default to the 2025 values and flag the conflict** — do not silently substitute.
> `[TBD: whether the 2020 digital palette is still endorsed. Escalate to corporatemarketing@pattersoncompanies.com.]`

## References

Read only what the task needs.

| File | When |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/DESIGN.md` | Prose design system in Google Stitch DESIGN.md format — hand this to a generative design tool |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/color-palette.md` | Full palette, tint ramp, digital palette, status colors, usage rules |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/typography.md` | Per-element type spec, shipped web scale, font licensing |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/logo-and-imagery.md` | Logo system, clear space, co-branding, photography, icons, video |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/references/conflicts-and-gaps.md` | Every source conflict and every `[TBD]` |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/assets/palette.csv` | Machine-readable palette for scripts and swatch generation |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/assets/brand-review-checklist.md` | Pass/fail checklist for reviewing a design |
| `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/_SOURCES.md` · `${CLAUDE_PLUGIN_ROOT}/skills/brand-identity/REFERENCES.md` | Provenance and extraction confidence; canonical SharePoint locations |

> [!TIP]
> For CSS variables and a drop-in Tailwind v4 theme, use the **design-tokens** skill instead. For
> editorial mechanics, use **copy-style-guide**. For voice, use **voice-and-tone**.

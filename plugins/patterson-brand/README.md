<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../docs/assets/patterson-logo-white.svg">
  <img src="../../docs/assets/patterson-logo-navy.svg" alt="Patterson Companies" width="260">
</picture>

# patterson-brand

**Trusted Expertise. Unrivaled Support.** — Patterson Companies brand identity, design tokens and
editorial voice, packaged as an installable [agent plugin](https://code.claude.com/docs/en/plugin-marketplaces).

![skills](https://img.shields.io/badge/skills-5-00A8E1?labelColor=003767)
![agent](https://img.shields.io/badge/agent-brand--compliance--reviewer-003767)
![theme](https://img.shields.io/badge/theme-Tailwind_v4_·_shadcn%2Fui-147EC2)
![runtime](https://img.shields.io/badge/scripts-TypeScript_·_no_build_step-00817D)
![binaries](https://img.shields.io/badge/binaries-none-58585B)

</div>

---

## Table of contents

- [What this is](#what-this-is)
- [Skills](#skills)
- [Agent](#agent)
- [Install](#install)
- [Using the theme](#using-the-theme)
- [The palette](#the-palette)
- [The Adobe Fonts situation](#the-adobe-fonts-situation)
- [Two palettes, unreconciled](#two-palettes-unreconciled)
- [Open `[TBD]` items](#open-tbd-items)
- [Provenance](#provenance)
- [Contributing](#contributing)

## What this is

Patterson Companies brand identity, design tokens and editorial voice for Claude Code — including a
drop-in Tailwind CSS v4 + shadcn/ui theme.

**Text only. No images, no fonts, no PDFs, no `.pptx`.** The whole plugin is well under 1 MB. Its
predecessor was 96 MB because a design-system directory was copy-pasted into nine plugins and a single
5.6 MB PNG existed ten times over. Everything visual in this plugin is expressed as text, and every
binary original is referenced by URL in the per-skill `REFERENCES.md`.

## Skills

| Skill | Use it for |
|---|---|
| **[`brand-identity`](skills/brand-identity/)** | Palette and each color's role, logo usage and clear space, Proxima Nova typography, the mandatory sentence-case rule, what not to do. Includes a Google Stitch–format [`DESIGN.md`](skills/brand-identity/references/DESIGN.md). |
| **[`design-tokens`](skills/design-tokens/)** | The drop-in. `theme.css` (Tailwind v4 `@theme` + full shadcn semantic contract) and `tokens.json` (W3C Design Tokens format), plus install steps and a generator. |
| **[`copy-style-guide`](skills/copy-style-guide/)** | Editorial mechanics: sentence case, AP style and Patterson's exceptions to it, numbers, dates, phone numbers, punctuation, product and business-unit naming, terminology. |
| **[`voice-and-tone`](skills/voice-and-tone/)** | Corporate voice (optimistic, clear, truthful, personable), the Patterson Dental addendum (empathetic, empowering, authoritative), and the social voice (first-person plural, 80/20). Kept explicitly separate. |
| **[`presentation-templates`](skills/presentation-templates/)** | Building decks and Office documents on the Patterson standards — Arial substitution, chart colors, slide structure, image sizes. |

## Agent

**[`brand-compliance-reviewer`](agents/brand-compliance-reviewer.md)** — reviews copy and UI against
palette, typography, sentence case, logo usage and voice. Cites the specific rule and source for every
finding, ranks by severity, and will not invent a rule.

## Install

```bash
# inside Claude Code
/plugin marketplace add patterson-agents/patterson-corp
/plugin install patterson-brand@patterson-corp
```

> [!NOTE]
> Nothing to build and no dependencies. `scripts/build-theme.ts` runs on Node 22.18+ via native
> TypeScript type stripping — no `tsc`, no bundler, no `package.json`, Node builtins only.

## Using the theme

```css
@import "tailwindcss";
@import "./patterson-theme.css";   /* copied from skills/design-tokens/assets/theme.css */
```

Order matters — Tailwind must load first. Full instructions, including Vite, Next.js and Astro setup,
are in [`skills/design-tokens/references/installation.md`](skills/design-tokens/references/installation.md).

Regenerate and drift-check:

```bash
node skills/design-tokens/scripts/build-theme.ts       # tokens.json -> theme.css
skills/design-tokens/scripts/verify-theme.sh           # exit 1 on drift; wire into CI
```

> [!IMPORTANT]
> `theme.css` is generated. **Never hand-edit it** — edit `tokens.json` and regenerate.

## The palette

Primary and secondary, from the Brand Guide 2025 `[BG25 p.24]`:

| Swatch | Name | Hex | Tier | Role |
|---|---|---|---|---|
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | Navy | `#003767` | Primary | Headlines, brand accents, dark grounds |
| <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | Sky | `#00A8E1` | Primary | Default CTA/button, accent |
| <img src="https://img.shields.io/badge/-58585B-58585B" alt="58585B"> | Gray 80% | `#58585B` | Primary | **Body copy**, divider graphics |
| <img src="https://img.shields.io/badge/-FFFFFF-FFFFFF" alt="FFFFFF"> | White | `#FFFFFF` | Primary | Background for content-heavy applications |
| <img src="https://img.shields.io/badge/-147EC2-147EC2" alt="147EC2"> | Blue | `#147EC2` | Secondary | Supporting fills, secondary emphasis |
| <img src="https://img.shields.io/badge/-6DCFF6-6DCFF6" alt="6DCFF6"> | Light blue | `#6DCFF6` | Secondary | Light supporting fields, highlights |
| <img src="https://img.shields.io/badge/-ECECEC-ECECEC" alt="ECECEC"> | Light gray | `#ECECEC` | Secondary | Accent gray on web and email |
| <img src="https://img.shields.io/badge/-7BC24D-7BC24D" alt="7BC24D"> | Green | `#7BC24D` | Tertiary | Infographics and presentations |
| <img src="https://img.shields.io/badge/-00817D-00817D" alt="00817D"> | Teal | `#00817D` | Tertiary | Infographics, and every eyebrow label |
| <img src="https://img.shields.io/badge/-522E91-522E91" alt="522E91"> | Purple | `#522E91` | Tertiary | Infographics and presentations |

Full tint ramp, digital palette, status colors and usage rules:
[`skills/brand-identity/references/color-palette.md`](skills/brand-identity/references/color-palette.md).

## The Adobe Fonts situation

**Proxima Nova is the Patterson brand font at every typographic tier** `[BG25 p.25]`. It is a
commercial typeface by Mark Simonson Studio, licensed to Patterson through **Adobe Fonts (Typekit)**
kits **`uth1qfm`** (the Digital Pattern Library) and **`rul6mjk`** (pattersoncompanies.com). They are
not interchangeable — **use `uth1qfm`**:

| Kit | Faces | Weights served | Last published |
|---|---|---|---|
| **`uth1qfm`** — use this one | **10** | **400, 500, 600, 700, 800** — each normal *and* italic | 2019-03-05 |
| `rul6mjk` — superseded, deficient | 4 | 400, 700 — normal and italic only | 2024-08-01 |

> [!CAUTION]
> **This plugin ships no font binaries and no `@font-face` rules, deliberately.** Adobe Fonts'
> standard terms serve fonts from Adobe's CDN via a kit ID; they do not grant the right to extract,
> re-host, redistribute or bundle the binaries. A plugin or package containing them would be a
> redistribution.
>
> The predecessor plugin (`patterson-design-plugins`) shipped three `.woff2` files described in its
> own source as *"licensed Adobe Fonts binaries, provided by the user."* An md5 check found
> `proxima-nova-italic.woff2` (`76bb0b958a918b4d270df75ecf0be2fe`) to be **byte-identical to the
> Adobe CDN payload** for `fvd=i4`, which contradicts that description. Do not reproduce those files.

**Do this instead:** load `https://use.typekit.net/uth1qfm.css` and declare
`font-family: "proxima-nova", Arial, sans-serif` — exactly what the Digital Pattern Library does.
Arial is the sanctioned fallback `[BG25 p.25]` and is on every machine. Do not substitute a lookalike;
an earlier extraction inserted Figtree, which appears in no Patterson source.

### Weight coverage — resolved by kit choice

> [!NOTE]
> **Earlier versions of this plugin recorded the missing weights as a blocker requiring Adobe. That
> was wrong.** The deficiency is `rul6mjk`'s alone: it declares exactly four faces (400 and 700,
> normal and italic) and serves **no** Semibold or Extrabold, so pages on that kit get
> browser-synthesised 600 and 800. **`uth1qfm` declares ten faces and already serves Semibold 600 and
> Extrabold 800** — the two weights the Brand Guide names as its primary and secondary tiers.
> **The fix is a kit swap, not an Adobe negotiation.** Verified 2026-08-11 by fetching both
> stylesheets and counting their `@font-face` blocks.

> [!WARNING]
> **Resolved pending account-owner sign-off.** `uth1qfm` was last published 2019-03-05 — *older* than
> `rul6mjk` (2024-08-01) — yet carries more weights. That its weights are still being served is
> evidence the kit is **live**, not proof it is **sanctioned**. Patterson's Adobe Fonts account owner
> must confirm `uth1qfm` is an active, correctly-licensed Patterson kit rather than a legacy one, and
> whether `rul6mjk` can be retired.

Open questions for Corporate Marketing and the Adobe Fonts account owner:

1. Confirm `uth1qfm` is an active, sanctioned Patterson kit — and whether `rul6mjk` can be retired.
2. Does Patterson's Adobe Fonts plan permit self-hosting?
3. Is there a desktop Proxima Nova licence for InDesign/Illustrator work, and how many seats?
4. Is "Proxima Heavy" `[BG25 p.60]` a licensed weight or shorthand for Extrabold?

## Two palettes, unreconciled

> [!WARNING]
> Patterson publishes two different blues for the same job and has never reconciled them.

| Source | Sky blue | Link blue |
|---|---|---|
| **Brand Guide 2025** `[BG25 p.24, p.57]` — authoritative, and the default here | <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> `#00A8E1` | — |
| **DesignSystem_042120** `[DS20 p.7–8]` — WCAG-adjusted, and what the live sites render | <img src="https://img.shields.io/badge/-269BCB-269BCB" alt="269BCB"> `#269BCB` | <img src="https://img.shields.io/badge/-147CBD-147CBD" alt="147CBD"> `#147CBD` |

The 2025 guide does not acknowledge the digital palette. The 2020 deck calls itself *"complimentary"*
and does not claim to override the guide. Measured: white on `#00A8E1` is ~2.3:1 and **fails WCAG AA
at every text size**; white on `#269BCB` is ~3.4:1 and passes AA for large text and UI components only.

`theme.css` ships the 2025 values as the default and provides an opt-in `.patterson-a11y` class that
swaps in the digital set. **This is the single most consequential open question in the extraction** —
escalate to `corporatemarketing@pattersoncompanies.com`.

## Open `[TBD]` items

> [!IMPORTANT]
> Every one of these is something Patterson has never published, or a question only Corporate
> Marketing can answer. They are marked `[TBD]` in place throughout the skills. Do not fill them in.

**Brand values that do not exist**

1. Tint step percentages — the 75/50/25 ramp was recovered by sampling the printed swatches, not read.
2. A named spacing scale — the 5px grid is inferred from production CSS.
3. An elevation/shadow scale — none published. The theme deliberately ships none.
4. Motion/easing tokens — none published beyond one `.3s ease-out` button transition.
5. Status/semantic colors — none in the 2025 guide; the four in use are production values.
6. An on-dark error color — `#D0021B` is low contrast on navy.
7. A dark-mode surface ramp — Patterson publishes an on-navy accent system, not a dark theme.
8. A WCAG conformance target and version — the 2020 deck says WCAG 2.0; the 2025 guide says only "ADA
   standards".

**Typography**

*Which kit licenses Semibold (600) and Extrabold (800) was formerly listed here. It is
[resolved](#weight-coverage--resolved-by-kit-choice) — `uth1qfm` serves both — subject to the
account-owner sign-off noted in that section.*

9. Whether the Patterson licence permits self-hosting.
10. Whether a desktop licence exists, and for how many seats.
11. Whether "Proxima Heavy" `[BG25 p.60]` is a real weight.

**Documents and assets not recovered**

12. The canonical SharePoint URL of the Brand Guide 2025 itself.
13. The PowerPoint best-practice bullets at `[BG25 p.50]`, and the template's own SharePoint path.
14. Slide dimensions / aspect-ratio standard, and the template's named layouts.
15. Word, letterhead and report template specifications.
16. The 300+ icon library, and the missing logo colorways, business-unit families, AHI set and
    favicon — all on SharePoint.
17. Pixel-dimension labels in `ImageSpecs_042120` — that PDF is image-only and they did not OCR.
18. The verbatim value-proposition text `[BG25 p.8–9]` — published in the guide, not reproduced here.
19. Voice addenda for Patterson Veterinary and Animal Health International — none exist.
20. Whether a DPL release newer than v5.7.2 exists.
21. Current owners of the digital design system — the named contacts are from April 2020.
22. Which AP Stylebook edition is current for Patterson (the Copy Style Guide cites 2022).
23. Refreshed social audience demographics — the published figures are from 09/2019.

## Provenance

Every skill carries `_SOURCES.md` (which document, which page, what confidence) and `REFERENCES.md`
(where the official original lives). Source keys used throughout:

| Key | Document |
|---|---|
| `[BG25 p.N]` | Patterson Companies Brand Guide, VERSION 3.2025 — **authoritative** |
| `[DS20 p.N]` | DesignSystem_042120.pdf (April 2020 UX design system) |
| `[IMG20 p.N]` | ImageSpecs_042120.pdf (image-only, OCR'd) |
| `[COPY22]` | Patterson Companies Copy Style Guide 2022 |
| `[VOICE18]` | Patterson Dental Marketing Voice Guidelines (9/25/18) |
| `[SOC19]` | Patterson Companies Social Media Writing Guidelines (09/2019) |
| `[DPL]` | Digital Pattern Library v5.7.2 production stylesheet |
| `[PCOM]` | pattersoncompanies.com theme stylesheet |

Where sources conflict, the 2025 Brand Guide wins and the conflict is recorded rather than resolved
silently — see
[`skills/brand-identity/references/conflicts-and-gaps.md`](skills/brand-identity/references/conflicts-and-gaps.md).

> [!IMPORTANT]
> **Nothing in this plugin is invented.** If a value is not in the sources it is written
> `[TBD: not specified in <source>]`.

## Contributing

- Never add a binary. No images, fonts, PDFs or Office files.
- Never invent a hex, font name or measurement.
- Edit `tokens.json`, then run `build-theme.ts`; commit both files. `verify-theme.sh` must pass.
- Skill directory name and the `name:` in its frontmatter must match exactly, with no namespace
  prefix — VS Code silently skips skills that violate this.
- kebab-case everywhere.
- Use `${CLAUDE_PLUGIN_ROOT}` for intra-plugin paths. Never an absolute path.

Questions about the brand itself: **corporatemarketing@pattersoncompanies.com**.

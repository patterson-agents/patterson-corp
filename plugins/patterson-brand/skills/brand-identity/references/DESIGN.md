# Design System: Patterson Companies

**Project ID:** `patterson-agents/patterson-corp → plugins/patterson-brand`

> [!NOTE]
> **Substitution note.** `Project ID` is a Google Stitch–native concept (`projects/{numeric}`).
> Patterson has no Stitch project, so the repository-and-plugin identifier is substituted here, as the
> Stitch DESIGN.md specification permits. Everything else follows the specification's five-section
> structure verbatim.

> [!IMPORTANT]
> **Provenance.** Every value traces to a Patterson source document. `[BG25 p.N]` = Patterson
> Companies Brand Guide VERSION 3.2025, page N (authoritative). `[DS20 p.N]` = DesignSystem_042120,
> slide N. `[DPL]` = Patterson Digital Pattern Library v5.7.2 production stylesheet. Nothing is
> invented; gaps are written as `[TBD: …]`. Full provenance in
> [`../_SOURCES.md`](../_SOURCES.md); the machine-readable counterpart to this prose lives in the
> **design-tokens** skill (`tokens.json`, `theme.css`).

---

## 1. Visual Theme & Atmosphere

Patterson is a 140-year-old healthcare distributor speaking to dentists, veterinarians and the teams
around them. The brand's atmosphere is **calm, credible and unhurried** — the visual equivalent of a
knowledgeable rep who has been to your practice before and does not need to raise their voice. The
registered promise, *Trusted Expertise. Unrivaled Support.®*, sets the register: expert, but warm.

The aesthetic philosophy is **quiet confidence over visual noise**. Two blues carry almost the entire
identity — a deep, saturated navy and a bright, clean sky blue — chosen because they read as clear
thought, intelligence, communication and trust `[BG25 p.24]`. Everything else is support: a muted
warm-neutral gray for reading, generous white ground, and a small tertiary set reserved for
infographics.

Density is **moderate to airy**. White is designated as the background for content-heavy applications
`[BG25 p.24]`, so long-form pages breathe rather than compress. Surfaces are **flat**: Patterson
publishes no elevation or shadow scale at all, and the single documented shadow in the entire system
is a barely-visible inset on text inputs `[DPL]`. There are no drop shadows, no glows, no gradients,
no glass. Depth is created by color blocking — a solid navy field against white — not by layering.

Corners are **subtly rounded, never pill-shaped and never sharp**: a small, consistent softening
applied uniformly to buttons, cards and inputs `[BG25 p.57]`.

Tone of voice on screen is **optimistic, clear, truthful and personable** `[BG25 p.10–12]`, and it
shows typographically: sentence case everywhere, no shouting, one thought per line. All-caps is
explicitly rejected in digital channels as both impolite and hostile to screen readers
`[BG25 p.25–26]`.

Imagery is **authentic and bright** — real practices, real people, natural light, shallow depth of
field, never staged or clichéd `[BG25 p.33–39]`. Icons are **simple, modern and linear**, deliberately
kept as small supporting cues that must never become the main visual `[BG25 p.41]`.

| Adjectives that fit | Adjectives that do not |
|---|---|
| trustworthy, clinical-but-warm, uncluttered, flat, legible, unhurried | edgy, luxurious, playful, dense, dramatic |

## 2. Color Palette & Roles

**Primary — the brand's whole voice lives in these four.**

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | **Deep Institutional Navy** (PMS 540) | `#003767` | Headlines, brand accents and solid full-frame dark grounds. The anchor color; where the brand feels most itself. |
| <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | **Bright Clinical Sky Blue** (PMS 2995) | `#00A8E1` | The default call-to-action button fill, interactive accents, and the full-frame ground for Patterson Dental video `[BG25 p.52, p.57]`. |
| <img src="https://img.shields.io/badge/-58585B-58585B" alt="58585B"> | **Warm Slate Gray** (PMS Cool Gray 11, 80% black) | `#58585B` | All body copy and divider rules. Never used for headlines; never used as a fill. |
| <img src="https://img.shields.io/badge/-FFFFFF-FFFFFF" alt="FFFFFF"> | **Pure Paper White** | `#FFFFFF` | The background for content-heavy applications, and the full-frame ground for Patterson Companies corporate and Animal Health International video. |

**Secondary — reached for only when a composition needs additional depth, and never allowed to
dominate the primaries** `[BG25 p.24]`.

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-147EC2-147EC2" alt="147EC2"> | **Confident Mid Blue** (PMS 7683) | `#147EC2` | Supporting fills and secondary emphasis where navy would be too heavy. |
| <img src="https://img.shields.io/badge/-6DCFF6-6DCFF6" alt="6DCFF6"> | **Soft Aqua Blue** (PMS 297) | `#6DCFF6` | Light supporting fields and gentle highlights. |
| <img src="https://img.shields.io/badge/-ECECEC-ECECEC" alt="ECECEC"> | **Barely-There Cool Gray** (PMS Cool Gray 1 at 50%) | `#ECECEC` | The accent gray behind web and email sections. |

**Tertiary — reserved for infographics and presentations, to add depth and interest** `[BG25 p.24]`.

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-7BC24D-7BC24D" alt="7BC24D"> | **Fresh Meadow Green** (PMS 369) | `#7BC24D` | Data series and infographic accents. |
| <img src="https://img.shields.io/badge/-00817D-00817D" alt="00817D"> | **Deep Sea Teal** (PMS 7718) | `#00817D` | Data accents and, in digital, the color of **every eyebrow label** `[DS20 p.16]`, `[DPL]`. |
| <img src="https://img.shields.io/badge/-522E91-522E91" alt="522E91"> | **Rich Royal Purple** (PMS 7679) | `#522E91` | Data series and infographic accents. |

**Tints — a single uniform three-step ramp over white, at 75%, 50% and 25%, applied identically to
every palette color** `[BG25 p.24]`. Used sparingly, for large calm fields and chart shading. Example,
navy:

| Swatch | Name | Hex | Step |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-40698D-40698D" alt="40698D"> | **Muted Steel Navy** | `#40698D` | 75% |
| <img src="https://img.shields.io/badge/-809BB3-809BB3" alt="809BB3"> | **Hazy Slate Blue** | `#809BB3` | 50% |
| <img src="https://img.shields.io/badge/-BFCDD9-BFCDD9" alt="BFCDD9"> | **Pale Mist Blue** | `#BFCDD9` | 25% |

The full table for all eight colors is in [`color-palette.md`](color-palette.md). `[TBD: the step
percentages are not labelled in BG25 p.24 — they were recovered by sampling the printed swatches.]`

**Digital, WCAG-adjusted — a parallel set that Patterson web properties actually render**
`[DS20 p.7–8]`, `[DPL]`.

> [!IMPORTANT]
> These are *different hexes from the primaries above*, not tints of them.

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-269BCB-269BCB" alt="269BCB"> | **Tempered Digital Sky** | `#269BCB` | The interactive/primary blue on screen, where the brighter print sky misses WCAG 2.0 contrast. |
| <img src="https://img.shields.io/badge/-147CBD-147CBD" alt="147CBD"> | **Readable Link Blue** | `#147CBD` | Text links on white or light gray grounds. |
| <img src="https://img.shields.io/badge/-9B9B9B-9B9B9B" alt="9B9B9B"> | **Neutral Medium Gray** | `#9B9B9B` | Secondary and de-emphasized text. |
| <img src="https://img.shields.io/badge/-F8F8F8-F8F8F8" alt="F8F8F8"> | **Faint Page Gray** | `#F8F8F8` | Alternating section backgrounds against white. |
| <img src="https://img.shields.io/badge/-0CA50F-0CA50F" alt="0CA50F"> | **Signal Green** | `#0CA50F` | An accent and the positive/success state, on both light and dark grounds. |
| <img src="https://img.shields.io/badge/-008E8B-008E8B" alt="008E8B"> | **Muted Digital Teal** | `#008E8B` | An accent, on both light and dark grounds. |
| <img src="https://img.shields.io/badge/-9660F3-9660F3" alt="9660F3"> | **Luminous Violet** | `#9660F3` | The purple accent **only** on navy or dark grounds. |
| <img src="https://img.shields.io/badge/-001C34-001C34" alt="001C34"> | **Near-Black Navy** | `#001C34` | The pressed and hover state of navy controls. |

> [!WARNING]
> Accent colors must **never** be used for body copy or legal disclaimers `[DS20 p.8]`.

**Status — implementation values from the production pattern library; the 2025 Brand Guide publishes
none** `[DPL]`, states named at `[DS20 p.37]`.

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-D0021B-D0021B" alt="D0021B"> | **Alert Crimson** | `#D0021B` | Error message boxes, error text and invalid field borders. |
| <img src="https://img.shields.io/badge/-0CA50F-0CA50F" alt="0CA50F"> | **Signal Green** | `#0CA50F` | Positive/success message boxes. |
| <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | **Deep Institutional Navy** with white text | `#003767` | The urgent message box. |
| <img src="https://img.shields.io/badge/-F5A623-F5A623" alt="F5A623"> | **Attention Amber** | `#F5A623` | Warning text and warning eyebrows. |

**Supporting neutrals** `[DPL]`:

| Swatch | Name | Hex | Role |
|---|---|---|---|
| <img src="https://img.shields.io/badge/-D8D8D8-D8D8D8" alt="D8D8D8"> | **Hairline Gray** | `#D8D8D8` | Horizontal rules and dividers. |
| <img src="https://img.shields.io/badge/-A8A9AC-A8A9AC" alt="A8A9AC"> | **Field Edge Gray** | `#A8A9AC` | Input borders and disabled controls. |
| <img src="https://img.shields.io/badge/-F0F0F0-F0F0F0" alt="F0F0F0"> | **Dormant Gray** | `#F0F0F0` | Disabled field backgrounds. |

> [!CAUTION]
> Absolute rule: **icons and graphics must never use a color outside this palette** `[BG25 p.42]`.

## 3. Typography Rules

One family carries the whole system: **Proxima Nova** — a humanist geometric sans with a low contrast,
wide apertures and a friendly, upright character. It is used at every tier `[BG25 p.25]`. In Microsoft
OfficeSuite contexts (Outlook, PowerPoint, Teams, SharePoint), **Arial** is the sanctioned substitute
`[BG25 p.25]`.

Weight is the hierarchy device, not size alone:

| Weight | Used for |
|---|---|
| **Extrabold** | Titles and headlines — heavy, confident, the loudest thing on the page. |
| **Semibold** | Subheads, creating clear visual separation without competing with the headline. |
| **Regular or Light** | Body copy and long-form supporting text, chosen by whichever gives better legibility and contrast at the intended scale. |
| **Bold** | Calls to action `[BG25 p.27]`. |

**Letter-spacing character: consistently, deliberately tight.** Headlines, subheads, CTAs and titles
are tracked at **−10 InDesign units (−0.01em)**, tightening to **−25 (−0.025em)** at large display
sizes. Body copy runs between 0 and −10. Tracking is set optically, never metrically. `[BG25 p.27]`

**Leading is unusually tight for headings and generous for reading.** Headings, subheads and CTAs set
at **75% of type size** — a 24pt headline takes 18.5pt leading, giving display type a dense, stacked,
poster-like block. Body copy sets at **125–150% of size**, so paragraphs stay open and scannable.
`[BG25 p.27]`

All type is **flush left**, ragged right. `[BG25 p.27]`

**Case is a hard rule, not a preference: everything is sentence case.** Titles, headlines, subheads,
body text, captions, buttons, text links and eyebrows are all sentence case `[BG25 p.59]`,
`[DS20 p.10]`. All-caps is explicitly rejected in digital channels because it reads as shouting and
degrades audible reading technology `[BG25 p.25–26]`. This reverses the 2022 guide. The only
sanctioned all-caps survivals are print titles `[BG25 p.25]`, footer/title text `[BG25 p.27]`, and the
brand-promise line in an Outlook email signature `[BG25 p.28]`.

Shipped screen scale `[DPL]`:

| Role | Size | Line height | Weight |
|---|---|---|---|
| Page headline | 36px (24px below 600px) | 1.25 (1.15 mobile) | Extrabold |
| Section head | 24px | 1.3 | Bold |
| Sub-section | 18px | 1.3 | Bold |
| Body | 18px | 1.5 | Regular |
| Eyebrow | 15px | 19px | Bold |
| Button | 15px | 1.15 | Semibold |
| Small print | 13px | — | — |

Headings render in navy; body renders in the warm slate gray.

> [!CAUTION]
> Reference the Adobe Fonts kit — **never bundle or self-host the font binaries**. Load kit
> **`uth1qfm`**, which serves the full brand range: 400, 500, 600, 700 and 800, each in normal and
> italic. The other kit in evidence, `rul6mjk`, serves only 400 and 700 (normal and italic) and leaves
> the Semibold 600 and Extrabold 800 this system requires to be synthesised by the browser.
> `[TBD: confirmation from Patterson's Adobe Fonts account owner that uth1qfm is an active, sanctioned
> kit rather than a legacy one — its weights are serving, which shows it is live, not that it is
> approved.]`

## 4. Component Stylings

* **Buttons:** A **compact rectangle with gently softened corners** — never pill-shaped, never sharp.
  Comfortably tall (46px) and sized to its label, with a generous fixed breathing space of 30px to the
  left and right of the text `[BG25 p.57]`. The default is a **solid Bright Clinical Sky Blue
  (`#00A8E1`) field with white Semibold label text, centered, tracked at zero, in sentence case —
  never all caps**. Other palette colors are permitted so long as the button still stands out in
  context `[BG25 p.57]`. The secondary variant is a **white field outlined with a single hairline of
  Deep Institutional Navy, with navy label text** `[DS20 p.15]`. The tertiary variant drops the box
  entirely: a bare **Readable Link Blue text link** on light grounds, switching to Tempered Digital Sky
  on navy. Disabled buttons fill with Field Edge Gray. Color transitions on hover are **slow and soft —
  roughly a third of a second, easing out** `[DPL]` — the only motion the system documents. Button copy
  carries no punctuation, never contains a phone number, and is never phrased as a question
  `[DS20 p.10]`.

* **Cards/Containers:** **Subtly rounded corners**, matching the buttons — a small, uniform softening,
  nothing generous or dramatic. Backgrounds are **Pure Paper White**, or **Faint Page Gray** when a
  band needs to separate from the page around it. **Shadow depth is flat — completely flat.** Patterson
  publishes no elevation scale; separation is achieved with a **Hairline Gray rule** or a change of
  background field, never with a lift. On the navy variant, containers sit as **Muted Steel Navy panels
  on a Deep Institutional Navy ground**, again with no shadow.

* **Inputs/Forms:** A **single thin stroke of Field Edge Gray around a white field**, with the same
  subtle corner rounding, comfortable interior padding, and body-sized 18px text `[DPL]`. The only
  depth anywhere in the system appears here: a **whisper-faint inset shadow along the top and left
  inner edges**, barely perceptible, suggesting a shallow recess. Invalid fields swap the stroke to
  Alert Crimson. Disabled fields fill with Dormant Gray. Field counts on lead forms are kept
  deliberately minimal, and every successful submission must return an explicit confirmation message
  `[DS20 p.38]`.

* **Eyebrows:** A small, bold, **Deep Sea Teal** label sitting above a section headline to name the
  sub-category it belongs to. Short, concise and **sentence case — not uppercase, and not sky blue**.
  An eyebrow is a locator, never a headline `[DS20 p.16]`.

* **Alerts:** Four named states — positive, error, neutral and urgent — each with a dedicated message
  box. Other patterns must never be repurposed as alerts, and the error state must never be used when
  the user did nothing wrong `[DS20 p.37]`.

## 5. Layout Principles

**Everything sits on a five-pixel rhythm.** Padding and spacing step through 5, 10, 15, 20, 25, 30, 50,
60 and 80 pixels `[DPL]`, and the Brand Guide's own 30px button padding lands exactly on that grid
`[BG25 p.57]`. The effect is a layout that feels metered rather than improvised. `[TBD: no Patterson
source publishes a named spacing scale; the 5px grid is inferred from consistent production usage.]`

**Content is bounded, not full-bleed.** The page wrapper caps at 1300px and centers, so text lines stay
readable on wide monitors while background fields and hero imagery run edge to edge behind it. Layout
reflows at two points: 900px for tablet and 600px for phone `[DPL]`.

**Whitespace strategy: generous vertically, disciplined horizontally.** Sections are separated by large
vertical gaps (50–80px) and, where needed, a Hairline Gray rule or a change of background field —
never by a shadow or a border box. Within a section, elements cluster tightly on the 5px rhythm so that
related content reads as one unit.

**Pages are assembled, not drawn.** The system is explicitly atomic — *atom → organism → structure →
page* — and structures are **horizontal, full-width bands stacked down the page** `[DS20 p.12]`. A
band introducing a new sub-topic (a "parent") gets an eyebrow, a larger headline and a primary CTA;
its supporting bands ("children") break content out of paragraph form beneath it. Everything placed
above the jump navigation must be agnostic of any sub-category and apply to the whole category, and
should be used sparingly `[DS20 p.29]`.

**Logos claim their own space.** The primary logo takes the lower-right corner or the upper-left, and
holds clear space equal to the height of the "P" in PATTERSON in print, or half that in digital
`[BG25 p.14–15]`. A secondary square logo never exceeds roughly 20% of the width of a vertical page or
15% of a horizontal one `[BG25 p.17]`. In co-branded layouts Patterson always sits on the left and
always reads as dominant, separated from the partner mark by a thin vertical rule `[BG25 p.18]`.

**Imagery is planned for cropping.** Every image must survive being cropped to desktop, tablet and
phone in both landscape and portrait: desktop shows full width cropped top and bottom, mobile
landscape shows full height cropped left and right `[BG25 p.61]`. Shoot and export loose, with room
around the subject.

**Restraint is governance, not taste.** The design system states it directly:

> "Every time you override a global component in one area of a product, you erode the consistency of
> your design system" `[DS20 p.40]`.

Compose from the existing bands rather than inventing new ones.

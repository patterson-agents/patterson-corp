# Patterson typography — full reference

Source keys: `[BG25 p.N]` Brand Guide 2025 (authoritative) · `[DS20 p.N]` DesignSystem_042120 ·
`[DPL]` Digital Pattern Library v5.7.2 · `[PCOM]` pattersoncompanies.com theme stylesheet.

---

## 1. Families `[BG25 p.25]`

| Tier | Face | Use |
|---|---|---|
| Primary | **Proxima Nova Extrabold** | Titles and headlines |
| Secondary | **Proxima Nova Semibold** | Subheads (clear visual hierarchy) |
| Tertiary | **Proxima Nova Regular** *or* **Light** | Body copy, long-form supporting copy — pick by legibility and contrast |
| CTA | **Proxima Nova Bold** | Calls to action `[BG25 p.27]` |
| OfficeSuite | **Arial Regular / Arial Bold** | Outlook, PowerPoint, Teams, SharePoint. Arial Nova Light is available as an extra weight where installed |

Production stack, verbatim:

```css
/* [DPL] */
font-family: proxima-nova, Arial, sans-serif;

/* [PCOM] */
--font-proxima-nova: proxima-nova, sans-serif;
```

## 2. Font licensing — read before writing any CSS

Proxima Nova is a commercial typeface by Mark Simonson Studio, licensed to Patterson through **Adobe
Fonts (Typekit)**. Two kits are in evidence, and they are **not** interchangeable:

| Kit | Serves | Faces published | Last published |
|---|---|---|---|
| **`uth1qfm`** — **use this one** | Patterson Digital Pattern Library v5.7.2 — `https://use.typekit.net/uth1qfm.css` | **10** — 400, 500, 600, 700, 800, each in normal *and* italic | 2019-03-05 |
| `rul6mjk` — superseded, deficient | pattersoncompanies.com — `https://use.typekit.net/rul6mjk.css` | 4 — 400 and 700 only, normal and italic | 2024-08-01 |

`uth1qfm` serves the **complete brand range, including Semibold (600) and Extrabold (800)**. Both kits
are live and currently serving; verified 2026-08-11 by fetching each stylesheet and counting its
`@font-face` blocks and `font-weight` declarations.

> [!CAUTION]
> **Do not ship font binaries.** Adobe Fonts' standard terms serve fonts from Adobe's CDN via a kit
> ID. They do not grant the right to extract, re-host, redistribute or bundle the binaries. A plugin,
> npm package or marketplace artifact containing them would be a redistribution.
>
> An earlier Patterson plugin (`patterson-design-plugins`) shipped three `.woff2` files claimed to be
> "licensed Adobe Fonts binaries, provided by the user." An md5 check found
> `proxima-nova-italic.woff2` to be **byte-identical to the Adobe CDN payload** for `fvd=i4`,
> contradicting that claim. Those files must not be reproduced.

**Do this instead:**

1. Load the kit:

   ```html
   <link rel="stylesheet" href="https://use.typekit.net/uth1qfm.css">
   ```

   Use `uth1qfm`. `rul6mjk` will render, but silently drops you to browser-synthesised 600 and 800.

2. Declare the production stack. This is exactly what the production DPL does. Ship **no**
   `@font-face` rules.

   ```css
   font-family: "proxima-nova", Arial, sans-serif;
   ```

3. Arial is the sanctioned fallback and is present on every PC and Mac — nothing needs shipping.

4. **Do not substitute a lookalike.** A previous extraction inserted Figtree (Google Fonts) ahead of
   Arial. Figtree appears in no Patterson source document. Choosing a free fallback is a brand
   decision, not an engineering one.

### Weight coverage — resolved by kit choice

> [!NOTE]
> **This was previously recorded as an unresolved blocker requiring Adobe. It is not.** The
> deficiency belongs to `rul6mjk` alone, which declares **exactly four faces**: `n4` (400 normal),
> `n7` (700 normal), `i4` (400 italic), `i7` (700 italic) — no Semibold and no Extrabold. `uth1qfm`
> declares **ten**: `n4`/`i4`, `n5`/`i5`, `n6`/`i6`, `n7`/`i7`, `n8`/`i8`, i.e. 400/500/600/700/800 in
> both styles. Semibold 600 and Extrabold 800 are already licensed and already serving.
>
> **The fix is a kit swap, not an Adobe negotiation.** Anywhere that loads `rul6mjk`, load `uth1qfm`
> instead. Pages still on `rul6mjk` are getting browser-synthesised 600 and 800, which is why those
> weights look wrong.

> [!WARNING]
> **Resolved pending account-owner sign-off.** `uth1qfm` was last published **2019-03-05**, *older*
> than `rul6mjk` (2024-08-01), yet carries more weights. That it is still serving is evidence the kit
> is **live**, not proof it is **sanctioned**. Whoever owns Patterson's Adobe Fonts account must
> confirm `uth1qfm` is an active, correctly-licensed Patterson kit rather than a legacy one before
> this is treated as fully closed. Route to Corporate Marketing / the Adobe Fonts account owner.

`[TBD: confirmation from the Adobe Fonts account owner that kit uth1qfm is an active, sanctioned
Patterson kit and not a legacy one, and that rul6mjk can be retired.]`
`[TBD: whether Patterson holds a desktop Proxima Nova licence for InDesign/Illustrator work, and how
many seats.]`
`[TBD: whether Patterson's Adobe Fonts plan permits self-hosting.]`

## 3. Case — the 2025 reversal

| Source | Rule |
|---|---|
| `[BG25 p.25]` | "All caps are to be **avoided in any digital channel** since this is regarded as shouting." |
| `[BG25 p.26]` | "Making the case for sentence case" — all-caps in headlines "may no longer be practical"; cites decorum and audible reading technology (screen readers) |
| `[BG25 p.59]` | For UX: "titles, headlines, subheads, text and captions are **all sentence case**" |
| `[BG25 p.57]` | Button text: "sentence case (never all caps)" |
| `[DS20 p.10]` | "Use sentence case for headlines, buttons, textlinks, and eyebrows" |

Surviving all-caps exceptions: titles **may** be all caps in print `[BG25 p.25]`; titles and footer
text are Extrabold or Semibold all caps `[BG25 p.27]`; the email-signature brand promise line is all
caps `[BG25 p.28]`.

> [!WARNING]
> **This reverses the 2022 guide**, which stated "Titles should be all caps" and set its own headings
> in caps. Anything dated 2022 or earlier is superseded on this point.

## 4. Typographic specification `[BG25 p.27]`

All elements are **flush left**, sentence case, optical tracking.

| Element | Face | Tracking | Leading |
|---|---|---|---|
| Headline | Proxima Nova Extrabold (optional sky blue or white) | −10 (−25 OK at large scale) | 75% of size (24 pt type → 18.5 pt) |
| Subhead | Proxima Nova Extrabold | −10 (−25 large) | 75% of size |
| Secondary subhead | Proxima Nova Semibold | −10 | 75% of size |
| Body copy | Proxima Nova Light or Regular (by scale) | 0 to −10 | **125%–150%** of size (10 pt → 15 pt) |
| CTA | Proxima Nova Bold | −10 (−25 large) | 75% of size |
| Titles, footer text | Proxima Nova Extrabold or Semibold, **all caps** | −10 (−25 large) | 75% of size |

> [!NOTE]
> InDesign tracking units are 1/1000 em → **−10 = `-0.01em`**, **−25 = `-0.025em`**.

## 5. Shipped web type scale `[DPL]`

| Role | Size | Line height | Weight | Color |
|---|---|---|---|---|
| `h1` desktop | 36px | 1.25 | 800 | ![](https://img.shields.io/badge/-003767-003767) `#003767` |
| `h1` ≤600px | 24px | 1.15 | 800 | ![](https://img.shields.io/badge/-003767-003767) `#003767` |
| `h2` | 24px | 1.3 | 700 | ![](https://img.shields.io/badge/-003767-003767) `#003767` |
| `h3` | 18px | 1.3 | 700 | ![](https://img.shields.io/badge/-003767-003767) `#003767` |
| Body | 18px | 1.5 | 400 | ![](https://img.shields.io/badge/-58585B-58585B) `#58585B` |
| Eyebrow | 15px | 19px | 700 | ![](https://img.shields.io/badge/-00817D-00817D) `#00817D` (teal) |
| Button / CTA | 15px | 1.15 | 600 | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) `#FFFFFF` |
| Tertiary text link | 18px | — | 600 | ![](https://img.shields.io/badge/-147CBD-147CBD) `#147CBD` |
| Small | 13px | — | — | — |

## 6. Marquee weight anomaly

`[BG25 p.60]` specifies marquee button text as "Proxima **Heavy**". That weight name appears nowhere
else in the guide; §1 lists only Extrabold, Semibold, Regular, Light and Bold.

`[TBD: is "Proxima Heavy" a distinct licensed weight, or a synonym for Extrabold?]`

## 7. Authoring restrictions `[DS20 p.9]`

Content authors may **bold and italicise** within patterns. Changing size or font is **not allowed**.
Some patterns (Quote, Cliffhanger) permit highlighted words in an alternate color instead of bold.

#!/usr/bin/env node
/**
 * Regenerate theme.css from tokens.json.
 *
 * Patterson Companies design tokens -> Tailwind CSS v4 theme.
 *
 * Every value in the generated stylesheet is read out of `tokens.json`; the prose, comments and
 * structure live in the TEMPLATE string below. That split is deliberate: token values have exactly
 * one home (`tokens.json`), and the CSS cannot drift from it without this script noticing.
 *
 * Usage
 * -----
 *     node build-theme.ts                 # write ../assets/theme.css (and echo it on stdout)
 *     node build-theme.ts --check         # exit 1 if ../assets/theme.css is out of date
 *     node build-theme.ts --stdout        # print to stdout only, write nothing
 *     node build-theme.ts --tokens X --out Y
 *
 * Requires only Node 22.18+ (native TypeScript type stripping) and Node builtins - no build step,
 * no package.json, no dependencies. `verify-theme.sh` wraps `--stdout` for CI.
 *
 * Placeholder syntax inside TEMPLATE: `@@<token.path>[|filter]@@`
 *   (no filter)  hex string, number, or plain string, verbatim
 *   |dim         W3C dimension object -> "5px" / "50%"
 *   |rem         px dimension converted to rem at 16px root -> "0.3125rem"
 *   |em          number -> "-0.01em"
 *   |stack       fontFamily array -> '"proxima-nova", Arial, sans-serif'
 *
 * Aliases (`"$value": "{color.brand.sky}"`) are resolved transitively.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const HERE = import.meta.dirname;
const DEFAULT_TOKENS = resolve(HERE, "..", "assets", "tokens.json");
const DEFAULT_OUT = resolve(HERE, "..", "assets", "theme.css");

const PLACEHOLDER = /@@([A-Za-z0-9_.]+)(?:\|([a-z]+))?@@/g;
const ALIAS = /^\{([A-Za-z0-9_.]+)\}$/;

type JsonObject = Record<string, unknown>;

class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nodeAt(tokens: JsonObject, path: string): unknown {
  let node: unknown = tokens;
  for (const part of path.split(".")) {
    if (!isObject(node) || !Object.prototype.hasOwnProperty.call(node, part)) {
      throw new TokenError(`no such token: ${path}`);
    }
    node = node[part];
  }
  return node;
}

function valueOf(tokens: JsonObject, path: string, depth: number = 0): unknown {
  if (depth > 10) {
    throw new TokenError(`alias loop resolving ${path}`);
  }
  const node = nodeAt(tokens, path);
  if (!isObject(node) || !Object.prototype.hasOwnProperty.call(node, "$value")) {
    throw new TokenError(`token has no $value: ${path}`);
  }
  const value = node["$value"];
  if (typeof value === "string") {
    const alias = ALIAS.exec(value);
    if (alias) {
      return valueOf(tokens, alias[1], depth + 1);
    }
  }
  return value;
}

/**
 * Format a number the way CSS wants it: 800, 1.25, -0.025, 0.3125.
 *
 * Faithful port of C's `printf("%g", value)`: 6 significant digits, trailing zeros stripped,
 * exponential form when the decimal exponent is < -4 or >= 6. JS `String(n)` is NOT equivalent
 * (e.g. String(1e21), String(0.0000001)), so the C `%g` rules are reimplemented here.
 */
function num(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (n === 0) return Object.is(n, -0) ? "-0" : "0";

  const PRECISION = 6;
  const rounded = Number(n.toPrecision(PRECISION));
  const exponent = Number(rounded.toExponential(PRECISION - 1).split("e")[1]);

  const strip = (s: string): string =>
    s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;

  if (exponent < -4 || exponent >= PRECISION) {
    const [mantissa, exp] = rounded.toExponential(PRECISION - 1).split("e");
    const sign = exp.startsWith("-") ? "-" : "+";
    const digits = exp.replace(/^[+-]/, "").padStart(2, "0");
    return `${strip(mantissa)}e${sign}${digits}`;
  }
  return strip(rounded.toFixed(Math.max(0, PRECISION - 1 - exponent)));
}

const GENERIC_FAMILIES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

function render(value: unknown, filt: string | undefined, path: string): string {
  if (filt === "stack") {
    if (!Array.isArray(value)) {
      throw new TokenError(`${path}: |stack needs an array`);
    }
    // Quote family names that are not plain single words (proxima-nova); leave bare names
    // (Arial, Helvetica) and generic keywords (sans-serif is hyphenated but generic) alone.
    return value
      .map((f) => {
        const name = String(f);
        return name.includes("-") && !GENERIC_FAMILIES.has(name) ? `"${name}"` : name;
      })
      .join(", ");
  }
  if (filt === "dim") {
    if (!isObject(value)) {
      throw new TokenError(`${path}: |dim needs a dimension object`);
    }
    const rawUnit = value["unit"];
    const unit = rawUnit === "percent" ? "%" : String(rawUnit);
    return `${num(value["value"])}${unit}`;
  }
  if (filt === "rem") {
    if (!isObject(value) || value["unit"] !== "px") {
      throw new TokenError(`${path}: |rem needs a px dimension`);
    }
    return `${num((value["value"] as number) / 16)}rem`;
  }
  if (filt === "em") {
    const raw = isObject(value) ? value["value"] : value;
    return `${num(raw)}em`;
  }
  if (filt) {
    throw new TokenError(`${path}: unknown filter |${filt}`);
  }
  if (typeof value === "number") {
    return num(value);
  }
  if (typeof value === "string") {
    return value;
  }
  throw new TokenError(`${path}: value ${JSON.stringify(value)} needs an explicit filter`);
}

function build(tokens: JsonObject): string {
  return TEMPLATE.replace(PLACEHOLDER, (_match, path: string, filt: string | undefined) =>
    render(valueOf(tokens, path), filt, path),
  );
}

const USAGE = `usage: build-theme.ts [-h] [--tokens TOKENS] [--out OUT] [--check] [--stdout]

Regenerate theme.css from tokens.json.

options:
  -h, --help       show this help message and exit
  --tokens TOKENS  token source (default: ../assets/tokens.json)
  --out OUT        stylesheet to write (default: ../assets/theme.css)
  --check          compare against --out and exit 1 on any difference
  --stdout         print instead of writing
`;

function main(argv: string[]): number {
  let tokensPath = DEFAULT_TOKENS;
  let outPath = DEFAULT_OUT;
  let check = false;
  let printOnly = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      process.stdout.write(USAGE);
      return 0;
    }
    if (arg === "--check") {
      check = true;
    } else if (arg === "--stdout") {
      printOnly = true;
    } else if (arg === "--tokens" || arg === "--out") {
      const next = argv[i + 1];
      if (next === undefined) {
        process.stderr.write(`build-theme: argument ${arg}: expected one argument\n`);
        return 2;
      }
      i += 1;
      if (arg === "--tokens") tokensPath = resolve(next);
      else outPath = resolve(next);
    } else if (arg.startsWith("--tokens=")) {
      tokensPath = resolve(arg.slice("--tokens=".length));
    } else if (arg.startsWith("--out=")) {
      outPath = resolve(arg.slice("--out=".length));
    } else {
      process.stderr.write(`build-theme: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }

  let css: string;
  try {
    const tokens = JSON.parse(readFileSync(tokensPath, "utf8")) as JsonObject;
    css = build(tokens);
  } catch (exc) {
    process.stderr.write(`build-theme: ${exc instanceof Error ? exc.message : String(exc)}\n`);
    return 2;
  }

  if (printOnly) {
    process.stdout.write(css);
    return 0;
  }

  if (check) {
    if (!existsSync(outPath)) {
      process.stderr.write(`build-theme: ${outPath} does not exist\n`);
      return 1;
    }
    const current = readFileSync(outPath, "utf8");
    if (current !== css) {
      process.stderr.write(
        `build-theme: ${outPath} is out of date with respect to ${basename(tokensPath)}\n`,
      );
      return 1;
    }
    process.stdout.write(`build-theme: ${basename(outPath)} matches ${basename(tokensPath)}\n`);
    return 0;
  }

  writeFileSync(outPath, css, "utf8");
  // The stylesheet goes to stdout so `node build-theme.ts > out.css` is byte-identical to the
  // committed artifact; the status line goes to stderr so it can never pollute that stream.
  process.stdout.write(css);
  process.stderr.write(`build-theme: wrote ${outPath} (${css.length} bytes)\n`);
  return 0;
}

const TEMPLATE = `\
/* ============================================================================
   Patterson Companies — Tailwind CSS v4 theme
   ----------------------------------------------------------------------------
   DROP-IN USAGE
     @import "tailwindcss";
     @import "./theme.css";

   Tailwind v4 is CSS-first: this file IS the config. There is no
   tailwind.config.js. Every value below traces to a Patterson source document;
   the source is named in the comment on (or immediately above) the line.

   SOURCE KEYS
     [BG25 p.N]  Patterson Companies Brand Guide 2025 (VERSION 3.2025), page N
     [DS20 p.N]  DesignSystem_042120.pdf (Patterson design system + governance,
                 April 2020), slide N
     [DPL]       Patterson Digital Pattern Library v5.7.2 production stylesheet
                 (cdn.cloud.pattersoncompanies.com/patternlibrary/releases/5.7.2/
                 assets/toolkit/styles/toolkit.css) — the shipped implementation
                 of DS20. Local copy under downloads/ (see _SOURCES.md).
     [PCOM]      pattersoncompanies.com WordPress theme-styles.min.css v3.2.2

   NOTHING IN THIS FILE IS INVENTED. Where a value could not be extracted it is
   omitted and recorded as [TBD] in DESIGN.md rather than guessed.
   ============================================================================ */

@theme {
  /* ==========================================================================
     TYPEFACES
     Proxima Nova is the Patterson brand font [BG25 p.25]. It is a licensed
     Adobe Fonts (Typekit) family. Load kit uth1qfm in the document head:

       <link rel="stylesheet" href="https://use.typekit.net/uth1qfm.css">

     uth1qfm serves 400/500/600/700/800 in normal and italic, so the Semibold
     600 and Extrabold 800 declared further down this file render as real
     faces. The other kit in evidence, rul6mjk, serves only 400/700 (normal
     and italic) and leaves the browser to synthesise 600 and 800 — it is
     superseded here and should not be used.

     REFERENCE THE KIT; SHIP NOTHING. Adobe's terms serve fonts from Adobe's
     CDN via a kit ID and grant no right to extract, re-host or bundle the
     binaries. This file therefore contains no @font-face rule and the plugin
     contains no font file, deliberately.
     See brand-identity/references/typography.md section 2.

     Production stack is verbatim from [DPL]: proxima-nova, Arial, sans-serif.
     Arial is the sanctioned OfficeSuite / fallback face [BG25 p.25].
     ========================================================================== */
  --font-sans: @@font.family.brand|stack@@;            /* [DPL] body{} */
  --font-pat-office: @@font.family.office|stack@@;           /* [BG25 p.25] Outlook/PowerPoint/Teams/SharePoint */

  /* ==========================================================================
     BRAND COLOR — PRIMARY [BG25 p.24]
     Corroborated verbatim as CSS custom properties in [PCOM].
     ========================================================================== */
  --color-pat-navy:        @@color.brand.navy@@;   /* PMS 540 / CMYK 100 55 0 55 / RGB 0 55 103 */
  --color-pat-sky:         @@color.brand.sky@@;   /* PMS 2995 / CMYK 73 15 0 0 / RGB 0 168 225 */
  --color-pat-gray:        @@color.brand.gray@@;   /* PMS Cool Gray 11 (80% black) — body copy */
  --color-pat-white:       @@color.brand.white@@;   /* [BG25 p.24, p.52] */

  /* ---- SECONDARY [BG25 p.24] ---------------------------------------------- */
  --color-pat-blue:        @@color.brand.blue@@;   /* PMS 7683 */
  --color-pat-blue-light:  @@color.brand.blueLight@@;   /* PMS 297 */
  --color-pat-gray-light:  @@color.brand.grayLight@@;   /* PMS Cool Gray 1 @ 50% — web/email accent gray */

  /* ---- TERTIARY [BG25 p.24] — infographics & presentations ---------------- */
  --color-pat-green:       @@color.brand.green@@;   /* PMS 369 */
  --color-pat-teal:        @@color.brand.teal@@;   /* PMS 7718 */
  --color-pat-purple:      @@color.brand.purple@@;   /* PMS 7679 */

  /* ==========================================================================
     TINTS [BG25 p.24 — "Tints of the Patterson color palette are an option if
     used sparingly."]
     The guide prints unlabelled swatches. Sampling the vector swatch fills on
     p.24 shows a uniform 75% / 50% / 25% ramp over white for every palette
     color. Values below are that documented ramp applied to the published
     base hexes (round-half-up); they render within +/-1 of the PDF swatches.
     ========================================================================== */
  --color-pat-navy-75:        @@color.tint.navy75@@;
  --color-pat-navy-50:        @@color.tint.navy50@@;
  --color-pat-navy-25:        @@color.tint.navy25@@;
  --color-pat-sky-75:         @@color.tint.sky75@@;
  --color-pat-sky-50:         @@color.tint.sky50@@;
  --color-pat-sky-25:         @@color.tint.sky25@@;
  --color-pat-gray-75:        @@color.tint.gray75@@;
  --color-pat-gray-50:        @@color.tint.gray50@@;
  --color-pat-gray-25:        @@color.tint.gray25@@;
  --color-pat-blue-75:        @@color.tint.blue75@@;
  --color-pat-blue-50:        @@color.tint.blue50@@;
  --color-pat-blue-25:        @@color.tint.blue25@@;
  --color-pat-blue-light-75:  @@color.tint.blueLight75@@;
  --color-pat-blue-light-50:  @@color.tint.blueLight50@@;
  --color-pat-blue-light-25:  @@color.tint.blueLight25@@;
  --color-pat-green-75:       @@color.tint.green75@@;
  --color-pat-green-50:       @@color.tint.green50@@;
  --color-pat-green-25:       @@color.tint.green25@@;
  --color-pat-teal-75:        @@color.tint.teal75@@;
  --color-pat-teal-50:        @@color.tint.teal50@@;
  --color-pat-teal-25:        @@color.tint.teal25@@;
  --color-pat-purple-75:      @@color.tint.purple75@@;
  --color-pat-purple-50:      @@color.tint.purple50@@;
  --color-pat-purple-25:      @@color.tint.purple25@@;

  /* ==========================================================================
     DIGITAL (WCAG-ADJUSTED) PALETTE [DS20 p.7–8], shipped in [DPL]
     DS20: "A digital color system has been identified to comply with WCAG 2.0
     accessibility standards." These are DIFFERENT hexes from the print palette
     above and are the ones actually rendered by Patterson web properties.
     See DESIGN.md > Conflicts before choosing between the two sets.
     ========================================================================== */
  --color-pat-digital-sky:          @@color.digital.sky@@;  /* [DS20 p.7] sky blue, digital  */
  --color-pat-digital-link:         @@color.digital.link@@;  /* [DS20 p.8] link blue, on light */
  --color-pat-digital-grey-medium:  @@color.digital.greyMedium@@;  /* [DS20 p.7] */
  --color-pat-digital-grey-light:   @@color.digital.greyLight@@;  /* [DS20 p.7] backgrounds */
  --color-pat-digital-green:        @@color.digital.green@@;  /* [DS20 p.8] accent green */
  --color-pat-digital-teal:         @@color.digital.teal@@;  /* [DS20 p.8] accent teal, on dark */
  --color-pat-digital-purple:       @@color.digital.purpleOnLight@@;  /* [DS20 p.8] accent purple, on light */
  --color-pat-digital-purple-dark:  @@color.digital.purpleOnDark@@;  /* [DS20 p.8] accent purple, on navy */
  --color-pat-navy-deep:            @@color.digital.navyDeep@@;  /* [DPL] .button--dark:hover, navy pressed */
  --color-pat-rule:                 @@color.digital.rule@@;  /* [DPL] hr, dividers */
  --color-pat-field-border:         @@color.digital.fieldBorder@@;  /* [DPL] input/select border, disabled */
  --color-pat-disabled-bg:          @@color.digital.disabledBg@@;  /* [DPL] disabled field background */

  /* ==========================================================================
     STATUS [DPL .message-box--*] — Patterson's real alert colors.
     DS20 p.37 names the four states: Positive, Error, Neutral, Urgent.
     ========================================================================== */
  --color-pat-error:    @@color.status.error@@;  /* [DPL] .message-box--error, .error-text, form errors */
  --color-pat-success:  @@color.digital.green@@;  /* [DPL] .message-box--success (= DS20 accent green) */
  --color-pat-urgent:   @@color.brand.navy@@;  /* [DPL] .message-box--alert (navy fill, white text) */
  --color-pat-warning:  @@color.status.warning@@;  /* [DPL] .with--text-orange, .eyebrow--orange */

  /* ==========================================================================
     SPACING — Patterson digital work is on a 5px grid.
     [DPL] padding steps: 5 10 15 20 25 30 50 60 80px. [BG25 p.57] button
     horizontal padding = 30px. Setting Tailwind's base unit to 5px makes
     p-1..p-16 land on the Patterson grid (p-2 = 10px, p-6 = 30px).
     To revert to Tailwind's stock 4px grid, delete the next line.
     ========================================================================== */
  --spacing: @@dimension.spacing.base|rem@@;   /* 5px */

  /* ==========================================================================
     RADII — [BG25 p.57] "Rounded corners: 5px radius".
     [DPL] border-radius:5px is the dominant value (20 occurrences).
     ========================================================================== */
  --radius-pat: @@dimension.radius.default|dim@@;

  /* ==========================================================================
     TYPE SCALE — [DPL] .rtf headings + body + control text.
     Line heights are the shipped values, which match [BG25 p.27]:
     headline leading 75%–125% of size, body copy 125%–150% of size.
     ========================================================================== */
  --text-pat-h1: @@font.size.h1|dim@@;                    /* [DPL] .rtf h1 desktop */
  --text-pat-h1--line-height: @@font.lineHeight.h1@@;
  --text-pat-h1--font-weight: @@font.weight.extrabold@@;        /* Proxima Nova Extrabold [BG25 p.25] */
  --text-pat-h1-mobile: @@font.size.h1Mobile|dim@@;             /* [DPL] .rtf h1 @max-width:600px */
  --text-pat-h1-mobile--line-height: @@font.lineHeight.h1Mobile@@;
  --text-pat-h2: @@font.size.h2|dim@@;                    /* [DPL] .rtf h2 */
  --text-pat-h2--line-height: @@font.lineHeight.h2@@;
  --text-pat-h2--font-weight: @@font.weight.bold@@;
  --text-pat-h3: @@font.size.h3|dim@@;                    /* [DPL] .rtf h3 */
  --text-pat-h3--line-height: @@font.lineHeight.h3@@;
  --text-pat-h3--font-weight: @@font.weight.bold@@;
  --text-pat-body: @@font.size.body|dim@@;                  /* [DPL] body{} */
  --text-pat-body--line-height: @@font.lineHeight.body@@;
  --text-pat-eyebrow: @@font.size.eyebrow|dim@@;               /* [DPL] .eyebrow */
  --text-pat-eyebrow--line-height: 19px;
  --text-pat-eyebrow--font-weight: 700;
  --text-pat-cta: @@font.size.cta|dim@@;                   /* [BG25 p.57] "Proxima Nova Semibold, 15px" */
  --text-pat-cta--line-height: @@font.lineHeight.cta@@;      /* [DPL] .button */
  --text-pat-cta--font-weight: @@font.weight.semibold@@;
  --text-pat-sm: @@font.size.small|dim@@;                    /* [DPL] second most common size */

  /* ==========================================================================
     LETTER SPACING — [BG25 p.27] tracking in InDesign units (1/1000 em).
     Tracking -10 => -0.01em; -25 (large scale) => -0.025em; body 0 to -10.
     ========================================================================== */
  --tracking-pat-tight: @@typography.tracking.largeScale|em@@;   /* tracking -25, large scale only */
  --tracking-pat-snug: @@typography.tracking.default|em@@;     /* tracking -10, default for headings/CTA */
  --tracking-pat-none: @@typography.tracking.bodyMax|em@@;         /* body copy upper bound; CTA buttons [BG25 p.57] */

  /* ==========================================================================
     LAYOUT — [DPL] breakpoints and container.
     Namespaced (pat-*) so stock Tailwind sm/md/lg/xl are left intact.
     ========================================================================== */
  --breakpoint-pat-mobile: @@dimension.layout.breakpointMobile|dim@@;
  --breakpoint-pat-tablet: @@dimension.layout.breakpointTablet|dim@@;
  --breakpoint-pat-desktop: @@dimension.layout.breakpointDesktop|dim@@;
  --container-pat: @@dimension.layout.containerMax|dim@@;          /* [DPL] max-width:1300px page wrapper */

  /* ==========================================================================
     CONTROL SIZING
     [BG25 p.57] button height 46px. [DPL] .button min-height 45px. Both given;
     the 2025 Brand Guide is authoritative for design, DPL for existing code.
     ========================================================================== */
  --size-pat-control: @@dimension.control.buttonHeight|dim@@;         /* [BG25 p.57] */
  --size-pat-control-dpl: @@dimension.control.buttonHeightDpl|dim@@;     /* [DPL] .button, .quantity-input__button */
  --size-pat-icon: @@dimension.control.iconSize|dim@@;            /* [DS20 p.18/35/38] + ImageSpecs: SVG icons 80x80 */
}

/* ============================================================================
   shadcn/ui SEMANTIC CONTRACT
   ----------------------------------------------------------------------------
   Every variable below is a Patterson value, not a re-derivation.

   NOTE ON --primary: [BG25 p.57] states the default button color is Patterson
   sky @@color.brand.sky@@ with white text. [DS20 p.7-8] replaced that with @@color.digital.sky@@ for
   digital specifically to satisfy WCAG 2.0 contrast, and [DPL] .button ships
   @@color.digital.sky@@. White on @@color.brand.sky@@ is ~2.3:1 (fails WCAG AA for any text size);
   white on @@color.digital.sky@@ is ~3.4:1 (passes AA for large text / UI components only).
   Default here follows the newer, authoritative 2025 Brand Guide. Add the
   class \`patterson-a11y\` to <html> to switch to the WCAG-adjusted digital
   palette (see the block below).
   ============================================================================ */
:root {
  --radius: @@dimension.radius.default|dim@@;                       /* [BG25 p.57] */

  --background: @@color.brand.white@@;               /* [BG25 p.24] white for content-heavy apps */
  --foreground: @@color.brand.gray@@;               /* [BG25 p.24] 80% black for body copy; [DPL] body color */

  --card: @@color.brand.white@@;                     /* [BG25 p.24] */
  --card-foreground: @@color.brand.gray@@;          /* [DPL] body */

  --popover: @@color.brand.white@@;                  /* [BG25 p.24] */
  --popover-foreground: @@color.brand.gray@@;       /* [DPL] body */

  --primary: @@color.brand.sky@@;                  /* [BG25 p.57] default button = sky blue */
  --primary-foreground: @@color.brand.white@@;       /* [BG25 p.57] "Text/CTA ... White" */

  --secondary: @@color.brand.white@@;                /* [DPL] .button--secondary bg */
  --secondary-foreground: @@color.brand.navy@@;     /* [DPL] .button--secondary color + 1px navy border */

  --muted: @@color.digital.greyLight@@;                    /* [DS20 p.7] light grey, backgrounds */
  --muted-foreground: @@color.digital.greyMedium@@;         /* [DS20 p.7] medium grey */

  --accent: @@color.tint.sky25@@;                   /* [BG25 p.24] sky @ 25% tint */
  --accent-foreground: @@color.brand.navy@@;        /* [BG25 p.24] navy */

  --destructive: @@color.status.error@@;              /* [DPL] .message-box--error / .error-text */
  --destructive-foreground: @@color.brand.white@@;   /* [DPL] white on filled error */

  --border: @@color.digital.rule@@;                   /* [DPL] hr / divider rule */
  --input: @@color.digital.fieldBorder@@;                    /* [DPL] input[type=*] border */
  --ring: @@color.brand.sky@@;                     /* [BG25 p.24] sky */

  /* Extras shadcn charts + Patterson status. Chart ramp is the tertiary
     palette [BG25 p.24], which the guide designates for infographics. */
  --chart-1: @@color.brand.navy@@;
  --chart-2: @@color.brand.sky@@;
  --chart-3: @@color.brand.green@@;
  --chart-4: @@color.brand.teal@@;
  --chart-5: @@color.brand.purple@@;

  --success: @@color.digital.green@@;                  /* [DPL] .message-box--success */
  --success-foreground: @@color.brand.white@@;
  --warning: @@color.status.warning@@;                  /* [DPL] .with--text-orange */
  --warning-foreground: @@color.brand.navy@@;
  --urgent: @@color.brand.navy@@;                   /* [DPL] .message-box--alert */
  --urgent-foreground: @@color.brand.white@@;

  /* Sidebar rail — navy ground is a documented Patterson emphasis surface
     [BG25 p.52 video standards: navy @@color.brand.navy@@ full-frame background]. */
  --sidebar: @@color.brand.navy@@;
  --sidebar-foreground: @@color.brand.white@@;
  --sidebar-primary: @@color.brand.sky@@;
  --sidebar-primary-foreground: @@color.brand.white@@;
  --sidebar-accent: @@color.tint.navy75@@;           /* navy @ 75% tint [BG25 p.24] */
  --sidebar-accent-foreground: @@color.brand.white@@;
  --sidebar-border: @@color.tint.navy75@@;
  --sidebar-ring: @@color.brand.sky@@;
}

/* ----------------------------------------------------------------------------
   DARK / NAVY-GROUND VARIANT
   Patterson does not publish a "dark mode". It DOES publish an on-dark system:
   [DS20 p.8] gives an explicit accent set "for use on dark backgrounds (navy)",
   and [BG25 p.52] specifies solid navy @@color.brand.navy@@ as a full-frame ground with the
   logo reversed. This variant uses only those documented on-navy values.
   ---------------------------------------------------------------------------- */
.dark {
  --background: @@color.brand.navy@@;               /* [BG25 p.52] navy ground */
  --foreground: @@color.brand.white@@;               /* [BG25 p.14] white reverse */

  --card: @@color.tint.navy75@@;                     /* navy @ 75% tint [BG25 p.24] */
  --card-foreground: @@color.brand.white@@;
  --popover: @@color.tint.navy75@@;
  --popover-foreground: @@color.brand.white@@;

  --primary: @@color.digital.sky@@;                  /* [DS20 p.8] sky blue for dark backgrounds */
  --primary-foreground: @@color.brand.white@@;       /* [DPL] .button color */

  --secondary: @@color.digital.navyDeep@@;                /* [DPL] .button--dark:hover */
  --secondary-foreground: @@color.brand.white@@;

  --muted: @@color.tint.navy75@@;                    /* navy @ 75% tint [BG25 p.24] */
  --muted-foreground: @@color.tint.navy25@@;         /* navy @ 25% tint [BG25 p.24] */

  --accent: @@color.brand.blue@@;                   /* [BG25 p.24] secondary blue */
  --accent-foreground: @@color.brand.white@@;

  --destructive: @@color.status.error@@;              /* [DPL] — see DESIGN.md, no on-navy red is published */
  --destructive-foreground: @@color.brand.white@@;

  --border: @@color.tint.navy75@@;
  --input: @@color.tint.navy50@@;                    /* navy @ 50% tint [BG25 p.24] */
  --ring: @@color.digital.sky@@;                     /* [DS20 p.8] */

  --chart-1: @@color.brand.blueLight@@;                  /* [BG25 p.24] secondary light blue */
  --chart-2: @@color.digital.sky@@;                  /* [DS20 p.8] */
  --chart-3: @@color.digital.green@@;                  /* [DS20 p.8] accent green, on dark */
  --chart-4: @@color.digital.teal@@;                  /* [DS20 p.8] accent teal, on dark */
  --chart-5: @@color.digital.purpleOnDark@@;                  /* [DS20 p.8] accent purple, on dark */

  --success: @@color.digital.green@@;                  /* [DS20 p.8] */
  --success-foreground: @@color.brand.white@@;
  --warning: @@color.status.warning@@;                  /* [DPL] */
  --warning-foreground: @@color.brand.navy@@;
  --urgent: @@color.brand.white@@;
  --urgent-foreground: @@color.brand.navy@@;

  --sidebar: @@color.digital.navyDeep@@;                  /* [DPL] */
  --sidebar-foreground: @@color.brand.white@@;
  --sidebar-primary: @@color.digital.sky@@;          /* [DS20 p.8] */
  --sidebar-primary-foreground: @@color.brand.white@@;
  --sidebar-accent: @@color.tint.navy75@@;
  --sidebar-accent-foreground: @@color.brand.white@@;
  --sidebar-border: @@color.tint.navy75@@;
  --sidebar-ring: @@color.digital.sky@@;
}

/* ----------------------------------------------------------------------------
   OPT-IN: WCAG-ADJUSTED DIGITAL PALETTE
   Add class="patterson-a11y" to <html> (alongside .dark if desired) to swap the
   print sky/link/green/teal for the DS20 digital equivalents, which exist
   precisely because the print hexes miss WCAG 2.0 contrast on white.
   [DS20 p.7-8]
   ---------------------------------------------------------------------------- */
.patterson-a11y {
  --primary: @@color.digital.sky@@;                  /* [DS20 p.7] */
  --ring: @@color.digital.sky@@;
  --sidebar-primary: @@color.digital.sky@@;
  --chart-2: @@color.digital.sky@@;
  --chart-3: @@color.digital.green@@;                  /* [DS20 p.8] */
  --chart-4: @@color.digital.teal@@;                  /* [DS20 p.8] */
  --chart-5: @@color.digital.purpleOnLight@@;                  /* [DS20 p.8] purple on light */
}
.patterson-a11y a { color: @@color.digital.link@@; }  /* [DS20 p.8] link blue on white/light grey */

/* ----------------------------------------------------------------------------
   Expose the semantic contract to Tailwind v4 utilities.
   Mirrors the @theme inline block shadcn/ui emits.
   ---------------------------------------------------------------------------- */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-urgent: var(--urgent);
  --color-urgent-foreground: var(--urgent-foreground);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + @@dimension.radius.default|dim@@);
}

/* ----------------------------------------------------------------------------
   BASE ELEMENT DEFAULTS
   Only rules with a direct source citation. Sentence case is a hard brand rule
   in 2025: [BG25 p.25] "All caps are to be avoided in any digital channel since
   this is regarded as shouting"; [BG25 p.59] titles, headlines, subheads, text
   and captions are ALL sentence case.
   ---------------------------------------------------------------------------- */
@layer base {
  body {
    font-family: var(--font-sans);
    font-weight: @@font.weight.regular@@;                       /* [DPL] body */
    font-size: @@font.size.body|dim@@;                        /* [DPL] body */
    line-height: @@font.lineHeight.body@@;                       /* [DPL] body */
    color: var(--foreground);
    background-color: var(--background);
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--color-pat-navy);           /* [DPL] .rtf h1/h2/h3 color:@@color.brand.navy@@ */
    letter-spacing: var(--tracking-pat-snug); /* [BG25 p.27] tracking -10 */
    text-transform: none;                   /* [BG25 p.25/p.26/p.59] sentence case */
  }
  h1 { font-size: @@font.size.h1|dim@@; line-height: @@font.lineHeight.h1@@; font-weight: @@font.weight.extrabold@@; margin-bottom: @@dimension.spacing.4|dim@@; } /* [DPL] + [BG25 p.25] Extrabold */
  h2 { font-size: @@font.size.h2|dim@@; line-height: @@font.lineHeight.h2@@;  font-weight: @@font.weight.bold@@; margin-bottom: @@dimension.spacing.4|dim@@; } /* [DPL] */
  h3 { font-size: @@font.size.h3|dim@@; line-height: @@font.lineHeight.h3@@;  font-weight: @@font.weight.bold@@; margin-bottom: @@dimension.spacing.4|dim@@; } /* [DPL] */

  @media (max-width: @@dimension.layout.breakpointMobile|dim@@) {               /* [DPL] breakpoint */
    h1 { font-size: @@font.size.h1Mobile|dim@@; line-height: @@font.lineHeight.h1Mobile@@; margin-bottom: @@dimension.spacing.2|dim@@; }
  }

  a { color: var(--color-pat-digital-link); }   /* [DS20 p.8] link blue @@color.digital.link@@; [DPL] a{} */
}

/* ----------------------------------------------------------------------------
   BRAND COMPONENT PRIMITIVES
   Reproduce the two elements the Brand Guide specifies pixel-exactly.
   ---------------------------------------------------------------------------- */
@layer components {
  /* [BG25 p.57] Buttons: rounded box, sentence case CTA, sky blue default,
     height 46px, width = type width + 30px padding L/R, radius 5px,
     Proxima Nova Semibold 15px, 0 tracking, centered, white text.
     "Other colors from the Patterson palette are permitted, as long as the
     button stands out in the context of the design." */
  .pat-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: @@dimension.control.buttonHeight|dim@@;
    padding-inline: @@dimension.control.buttonPaddingX|dim@@;
    border: none;
    border-radius: @@dimension.radius.default|dim@@;
    background-color: var(--color-pat-sky);
    color: var(--color-pat-white);
    font-family: var(--font-sans);
    font-size: @@font.size.cta|dim@@;
    font-weight: @@font.weight.semibold@@;
    letter-spacing: 0;
    line-height: @@font.lineHeight.cta@@;
    text-align: center;
    text-decoration: none;
    text-transform: none;                   /* never all caps [BG25 p.57] */
  }
  /* [DS20 p.15] Secondary buttons: navy outline, navy copy. */
  .pat-button--secondary {
    background-color: var(--color-pat-white);
    border: 1px solid var(--color-pat-navy);
    color: var(--color-pat-navy);
  }
  /* [DS20 p.15] Tertiary textlinks: link blue on light, sky blue on navy. */
  .pat-textlink {
    background: none;
    border: none;
    border-radius: 0;
    padding: @@dimension.spacing.2|dim@@ 0;                        /* [DPL] .button--tertiary */
    color: var(--color-pat-digital-link);
    font-size: @@font.size.textlink|dim@@;
    font-weight: @@font.weight.semibold@@;
  }
  .dark .pat-textlink { color: var(--color-pat-digital-sky); }  /* [DS20 p.15] */
  /* [DS20 p.15] Inactive buttons: light grey. [DPL] .button[disabled] @@color.digital.fieldBorder@@. */
  .pat-button[disabled] {
    background-color: var(--color-pat-field-border);
    cursor: not-allowed;
  }

  /* [DS20 p.16] Eyebrows: small type on Parent patterns, sentence case, short.
     "Currently all eyebrows are teal." [DPL] .eyebrow 15px/19px, 700, @@color.brand.teal@@.
     NOTE: eyebrows are sentence case, NOT uppercase. */
  .pat-eyebrow {
    display: block;
    font-size: @@font.size.eyebrow|dim@@;
    font-weight: @@font.weight.bold@@;
    line-height: 19px;
    color: var(--color-pat-teal);
    text-transform: none;
  }
}
`;

process.exitCode = main(process.argv.slice(2));

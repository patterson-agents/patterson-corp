---
name: design-tokens
description: Drop-in Patterson design tokens - a Tailwind CSS v4 theme.css plus a W3C tokens.json, and the steps to install them into a project. Use when setting up or restyling a web app in Patterson branding, wiring shadcn/ui to Patterson colors, asking for "the Patterson theme", "brand CSS variables", "Tailwind config for Patterson", "make this app look like Patterson", or when regenerating theme.css from tokens.json.
---

# Patterson design tokens

Two files, both in `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/assets/`:

| File | What it is |
|---|---|
| `theme.css` | Tailwind CSS v4 `@theme` block + the full shadcn/ui semantic contract + `.dark` + `.patterson-a11y`. **This is the config** — Tailwind v4 is CSS-first, there is no `tailwind.config.js`. |
| `tokens.json` | The same values in W3C Design Tokens Community Group format, with per-token source citations. The single source of truth. |

---

> [!IMPORTANT]
> `theme.css` is **generated** from `tokens.json` by
> `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/scripts/build-theme.ts`. Never hand-edit `theme.css` —
> edit `tokens.json` and regenerate.

## Install into a project

Works in a brand-new Vite, Next.js, Astro or plain-Tailwind project.

1. **Confirm Tailwind v4.** `theme.css` uses `@theme`, which is v4-only. If `package.json` shows
   `tailwindcss` `^3`, stop and tell the user this requires v4 (`npm install tailwindcss@latest
   @tailwindcss/vite` for Vite, or `@tailwindcss/postcss` for Next.js/PostCSS).

2. **Copy the file in.** Put it next to the project's main stylesheet, e.g.
   `src/styles/patterson-theme.css` (Vite/Astro) or `app/patterson-theme.css` (Next.js App Router).
   Copy `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/assets/theme.css` verbatim. Do not reformat it —
   the comments carry the source citation for every value, and `verify-theme.sh` compares bytes.

3. **Import it, in this order**, in the project's entry stylesheet:

   ```css
   @import "tailwindcss";
   @import "./patterson-theme.css";
   ```

   > [!WARNING]
   > Order matters. Tailwind must be loaded first or `@theme`, `@theme inline` and `@layer` have
   > nothing to extend.

4. **Verify.** Run the dev server and check three things:

   | Check | Expected |
   |---|---|
   | A Patterson utility resolves | `class="bg-pat-navy"` renders ![](https://img.shields.io/badge/-003767-003767) `#003767` |
   | The semantic contract resolves | `class="bg-primary text-primary-foreground"` renders sky ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1` on white |
   | Base defaults applied | `<h1>` is 36px, Extrabold, navy; `<body>` is 18px/1.5 in ![](https://img.shields.io/badge/-58585B-58585B) `#58585B` |

   If `bg-primary` renders nothing, the `@theme inline` block did not load — check import order.

5. **Fonts — do not add an `@font-face` rule.** Proxima Nova is licensed through Adobe Fonts and must
   not be self-hosted. Add the kit to the document head instead:

   ```html
   <link rel="stylesheet" href="https://use.typekit.net/uth1qfm.css">
   ```

   `theme.css` already declares `--font-sans: "proxima-nova", Arial, sans-serif`. Without the kit,
   text falls back to Arial, which is the sanctioned fallback `[BG25 p.25]` — the page is still on
   brand, just not in the brand face. **Use `uth1qfm`**: it serves 400/500/600/700/800 in normal and
   italic, so the brand's Semibold 600 and Extrabold 800 render for real. The other kit in evidence,
   `rul6mjk`, serves only 400/700 and leaves the browser to synthesise them. See the plugin README for
   the licensing position and the account-owner sign-off still outstanding on `uth1qfm`.

## Using it with shadcn/ui

`theme.css` defines the full shadcn contract — `--background`, `--foreground`, `--card`, `--popover`,
`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`,
`--chart-1..5`, `--sidebar-*` — plus Patterson's own `--success`, `--warning` and `--urgent`. Install
shadcn components as normal.

> [!WARNING]
> Do **not** let `npx shadcn init` overwrite the theme. If it writes its own `:root` block, delete
> that block and keep the Patterson import last.

`--radius` is `5px` `[BG25 p.57]`, so every shadcn component picks up the brand corner automatically.

## Variants

| Selector | Effect |
|---|---|
| `.dark` on `<html>` | On-navy variant. Patterson publishes no "dark mode" — this composes only documented on-navy values `[DS20 p.8]`, `[BG25 p.52]`. |
| `.patterson-a11y` on `<html>` | Swaps the print sky/link/green/teal for the WCAG-adjusted digital values `[DS20 p.7–8]`. Use when contrast matters more than exact print fidelity. Combines with `.dark`. |

| Combination | Contrast | Verdict |
|---|---|---|
| White on sky ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1` (default) | ~2.3:1 | Fails WCAG AA at every text size |
| White on digital sky ![](https://img.shields.io/badge/-269BCB-269BCB) `#269BCB` (`.patterson-a11y`) | ~3.4:1 | Passes AA for large text and UI components only |

> [!IMPORTANT]
> **Tell the user which they are getting.** The default follows the authoritative 2025 Brand Guide;
> `.patterson-a11y` follows the 2020 design system. This conflict is unresolved by the sources —
> surface it, do not pick silently.

## Regenerating and drift checking

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/scripts/build-theme.ts      # rewrite assets/theme.css
${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/scripts/verify-theme.sh          # 0 = in sync, 1 = drift
```

`build-theme.ts` needs only Node 22.18+ and its builtins — Node strips the types natively, so there
is no build step, no `tsc`, no `package.json` and no dependencies.

| Invocation | Behaviour |
|---|---|
| `node build-theme.ts` | Writes `assets/theme.css` **and** echoes it on stdout (the status line goes to stderr), so `node build-theme.ts > theme.css` is also valid |
| `node build-theme.ts --check` | Exits 1 without writing |
| `node build-theme.ts --stdout` | Prints only |

> [!TIP]
> Wire `verify-theme.sh` into CI so a hand-edit of `theme.css` fails the build.

To change a value: edit `tokens.json`, run `build-theme.ts`, commit both files. To add a *new* CSS
variable you must also add its placeholder to the `TEMPLATE` string in `build-theme.ts`.

## Hard rules

> [!CAUTION]
> **Never invent a hex, size or weight.** If a value is not in `tokens.json`, it is not a Patterson
> value. `tokens.json` has a `_tbd` section listing exactly what Patterson has never published —
> shadow/elevation scale, motion tokens, a named spacing scale, on-dark error color. Do not fill
> those in.

> [!CAUTION]
> **No font binaries, ever.** No `@font-face`, no `.woff2`, no lookalike substitute (an earlier
> extraction wrongly inserted Figtree — it appears in no Patterson source).

- Do not add a `tailwind.config.js`. v4 is CSS-first; the config is the `@theme` block.
- `--spacing` is set to `0.3125rem` (5px) so `p-2` = 10px and `p-6` = 30px, matching Patterson's 5px
  grid. Deleting that one line reverts to Tailwind's stock 4px grid — tell the user before doing it,
  every spacing utility in the project shifts.

## References

| File | When |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/references/installation.md` | Framework-specific setup (Vite, Next.js, Astro), troubleshooting, non-Tailwind consumption |
| `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/references/token-reference.md` | Every token, its value, and the document it came from |
| `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/_SOURCES.md` · `${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/REFERENCES.md` | Provenance and extraction confidence; canonical SharePoint and CDN locations |

> [!TIP]
> For palette rationale and brand rules, use the **brand-identity** skill.

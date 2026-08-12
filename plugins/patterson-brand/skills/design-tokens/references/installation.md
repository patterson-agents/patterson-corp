# Installing the Patterson theme

`assets/theme.css` is a Tailwind CSS **v4** theme. It is plain CSS: no build plugin, no
`tailwind.config.js`, no JS import.

---

## 1. Vite (React, Vue, Svelte, Solid)

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

Copy `theme.css` to `src/styles/patterson-theme.css`, then in `src/index.css`:

```css
@import "tailwindcss";
@import "./styles/patterson-theme.css";
```

> [!NOTE]
> Make sure `src/index.css` is imported once from your entry module (`main.tsx`).

## 2. Next.js (App Router, PostCSS)

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

Copy `theme.css` to `app/patterson-theme.css`, then in `app/globals.css`:

```css
@import "tailwindcss";
@import "./patterson-theme.css";
```

`app/layout.tsx` imports `./globals.css` as usual. Add the Adobe Fonts kit in the layout `<head>`:

```tsx
<link rel="stylesheet" href="https://use.typekit.net/uth1qfm.css" />
```

> [!CAUTION]
> Do **not** use `next/font/local` with a Proxima Nova file — that requires a font binary in the repo,
> which the licence does not permit.

## 3. Astro

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the Vite plugin in `astro.config.mjs`, copy `theme.css` to `src/styles/patterson-theme.css`, and
import both from a layout:

```astro
---
import "../styles/global.css"; // which itself imports tailwindcss then patterson-theme.css
---
```

## 4. Plain CSS, no Tailwind

You still get most of the value. The `:root`, `.dark`, `.patterson-a11y`, `@layer base` and
`@layer components` blocks are ordinary CSS and work standalone.

> [!NOTE]
> The `@theme` and `@theme inline` blocks will be ignored by browsers — they are Tailwind directives —
> so the `--color-pat-*` utility generators and any `bg-pat-navy` class will not exist. If you need
> those variables in plain CSS, either keep Tailwind, or read `tokens.json` and emit your own
> custom-property block.

## 5. Verifying the install

| Check | Expected |
|---|---|
| `<div class="bg-pat-navy h-10">` | Solid ![](https://img.shields.io/badge/-003767-003767) `#003767` |
| `<button class="bg-primary text-primary-foreground">` | Sky ![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1`, white label |
| `<h1>Hello</h1>` | 36px, weight 800, navy, letter-spacing `-0.01em` |
| `<body>` computed style | 18px / 1.5, color ![](https://img.shields.io/badge/-58585B-58585B) `#58585B`, `proxima-nova, Arial, sans-serif` |
| `<div class="p-6">` | 30px padding (not 24px) — confirms the 5px grid took effect |
| `<a href="#">link</a>` | ![](https://img.shields.io/badge/-147CBD-147CBD) `#147CBD` |
| `.pat-button` | 46px tall, 30px side padding, 5px radius, sentence case |

## 6. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| **`bg-primary` produces no style** | The `@theme inline` block did not load. Check that `@import "tailwindcss"` comes *before* the Patterson import, and that both live in a stylesheet the bundler actually processes. |
| **Everything is 4px-gridded** | `--spacing` was overridden by a later `@theme` block. The Patterson import must be last. |
| **Type renders in Arial** | The Adobe Fonts kit is not loaded, or the kit does not cover the domain. Adobe Fonts kits are domain-locked — a kit registered for `pattersoncompanies.com` will not serve `localhost` unless localhost was added to the kit's domain list. Arial is the sanctioned fallback, so this is a cosmetic failure, not a brand violation. |
| **`npx shadcn init` overwrote the colors** | shadcn writes its own `:root` and `.dark` blocks. Delete them and re-add the Patterson import as the last import. |

> [!WARNING]
> **Semibold (600) and Extrabold (800) look wrong.** You are loading kit `rul6mjk`, which serves only
> 400 and 700 (normal and italic), so the browser is synthesising 600 and 800. **Fix it by swapping
> the kit** — load `https://use.typekit.net/uth1qfm.css`, which serves 400/500/600/700/800 in normal
> and italic. **Never fix it by adding font files**: Adobe's terms forbid re-hosting the payloads. See
> the plugin README for the sign-off still outstanding on `uth1qfm`.

> [!IMPORTANT]
> **Dark mode looks unbranded.** Patterson does not publish a dark theme. `.dark` composes only
> documented on-navy values `[DS20 p.8]`, `[BG25 p.52]`. If the design needs a surface ramp Patterson
> has not published, say so and mark it `[TBD]` — do not invent one.

## 7. Consuming `tokens.json` directly

The token file is W3C Design Tokens Community Group format (draft). Aliases use the reference syntax
and resolve transitively:

```json
{ "$value": "{color.brand.sky}" }
```

Every token carries `$extensions."com.patterson.source"` naming the document and page it came from,
and some carry `com.patterson.conflict` where two Patterson sources disagree — read those before
consuming a value programmatically.

Style Dictionary, Terrazzo and similar tools can read it. `scripts/build-theme.ts` shows a minimal
resolver (~40 lines) if you would rather not add a dependency.

> [!IMPORTANT]
> The `_tbd` section at the bottom is not a token group. It is the explicit list of things Patterson
> has never published. Do not generate values for those.

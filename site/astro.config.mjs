// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';

// Patterson-branded Starlight documentation site.
//
// Branding is applied entirely through `src/styles/patterson.css`, which remaps
// Starlight's `--sl-*` custom properties onto Patterson brand tokens. No Starlight
// component is ejected, so the theme survives Starlight upgrades.
//
// https://astro.build/config
export default defineConfig({
  // The deployed origin. Drives canonical URLs, the sitemap, and social previews.
  // This site is served from the apex of its own custom domain, so no `base` is set.
  site: 'https://corp.patterson.sh',

  // Astro's default image service compiles sharp, which carries an open advisory.
  // The passthrough service copies images through untouched — no native binary,
  // no optimization. Docs sites rarely need the pipeline.
  image: { service: passthroughImageService() },

  integrations: [
    starlight({
      title: 'Patterson Corp',
      description:
        "The enterprise catalog of the Patterson agent platform: Patterson's institutional knowledge, encoded as installable agent plugins.",
      tagline: 'Trusted Expertise. Unrivaled Support.',
      logo: {
        light: './src/assets/patterson-logo-navy.svg',
        dark: './src/assets/patterson-logo-white.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/patterson.css', './src/styles/site.css'],
      // Almost every page on this site is generated from a Markdown file elsewhere in
      // the repository and carries its own `editUrl` frontmatter pointing at that
      // source. This base covers the few pages authored in `site/` itself.
      editLink: {
        baseUrl: 'https://github.com/patterson-agents/patterson-corp/edit/main/site/',
      },
      // Proxima Nova is served by Adobe Fonts kit uth1qfm. Load it from the kit
      // only — Adobe's terms do not permit re-hosting Typekit payloads, so never
      // commit font binaries or @font-face declarations for it.
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://use.typekit.net/uth1qfm.css',
          },
        },
      ],
      social: [
        {
          icon: 'external',
          label: 'Patterson Companies',
          href: 'https://www.pattersoncompanies.com',
        },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
      expressiveCode: {
        // Copy button on code frames; Patterson borders and radius come from
        // src/styles/patterson.css.
        frames: { showCopyToClipboardButton: true },
      },
      // Every group below autogenerates from a directory that
      // `scripts/build-site-content.ts` writes, so a new skill, decision or
      // capability specification appears in the sidebar with no config change --
      // and a build without that script having run fails loudly rather than
      // publishing a half-empty site.
      sidebar: [
        { label: 'Overview', link: '/' },
        { label: 'Architecture', items: [{ autogenerate: { directory: 'architecture' } }] },
        { label: 'Plugins', items: [{ autogenerate: { directory: 'plugins' } }] },
        { label: 'Decisions', items: [{ autogenerate: { directory: 'decisions' } }] },
        { label: 'Specifications', items: [{ autogenerate: { directory: 'specifications' } }] },
        { label: 'Governance', items: [{ autogenerate: { directory: 'governance' } }] },
        { label: 'Provenance', link: '/provenance/' },
      ],
    }),
  ],
});

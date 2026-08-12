#!/usr/bin/env node
/**
 * build-site-content.ts -- derive the documentation site's pages from this repository's
 * canonical Markdown.
 *
 * Usage:  node scripts/build-site-content.ts
 *
 * The Markdown under plugins/, docs/, openspec/ and the root governance files is the single
 * source of truth. Nothing here rewrites it and nothing here forks it: every generated page is
 * a mechanical transform of one source file -- frontmatter injected, the leading H1 lifted into
 * the page title, GitHub alerts turned into Starlight asides, and repository-relative links
 * repointed at GitHub or at the site's own asset paths. Each page carries a comment naming the
 * file it came from.
 *
 * The output is deliberately NOT tracked (see .gitignore). It is regenerated in CI before
 * `bun run build`, so tracked bytes stay flat as the catalog grows and a page can never drift
 * from the source it was derived from.
 *
 * Re-runnable: every generated directory is removed and rebuilt on each invocation, so a
 * renamed or deleted source cannot leave a stale page behind.
 *
 * Zero third-party dependencies: `node:fs`, `node:path` and `node:url` only, erasable-syntax
 * TypeScript, exactly like every other script in this repository.
 *
 * Exit: 0 = pages written   2 = could not evaluate (a required source is missing)
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DOCS_OUT = path.join(ROOT, "site", "src", "content", "docs");
const PUBLIC_OUT = path.join(ROOT, "site", "public");

/** Canonical browse location for a repository-relative path. */
const BLOB = "https://github.com/patterson-agents/patterson-corp/blob/main/";

/** Directories this script owns end-to-end. Removed and rebuilt on every run. */
const GENERATED_DIRS = [
  "architecture",
  "plugins",
  "decisions",
  "specifications",
  "governance",
];
/** Single-file outputs this script owns. */
const GENERATED_FILES = ["provenance.md"];
/** Public asset trees mirrored out of docs/ so images resolve in dev and in production alike. */
const PUBLIC_MIRRORS = ["assets", "diagrams"];

let pagesWritten = 0;
const notices: string[] = [];

// ---------------------------------------------------------------------------
// Small filesystem helpers
// ---------------------------------------------------------------------------

function read(relPath: string): string {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

function listDir(relPath: string): string[] {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).sort();
}

function isDir(relPath: string): boolean {
  const abs = path.join(ROOT, relPath);
  return existsSync(abs) && statSync(abs).isDirectory();
}

function writePage(outRel: string, contents: string): void {
  const abs = path.join(DOCS_OUT, outRel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, contents, "utf8");
  pagesWritten += 1;
}

// ---------------------------------------------------------------------------
// Markdown transforms
// ---------------------------------------------------------------------------

type Frontmatter = { data: Record<string, string>; body: string };

/**
 * Split a leading `---` frontmatter block off a document. Only flat `key: value` scalars are
 * read -- that is all any source file in this repository uses.
 */
function splitFrontmatter(src: string): Frontmatter {
  if (!src.startsWith("---\n")) return { data: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: src };
  const block = src.slice(4, end);
  const rest = src.slice(end + 4).replace(/^\n/, "");
  const data: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match) data[match[1]] = match[2].trim();
  }
  return { data, body: rest };
}

/** Lift the first level-1 heading out of a body, returning it as the page title. */
function liftTitle(body: string): { title: string | undefined; body: string } {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#\s+/.test(line)) {
      const title = line.replace(/^#\s+/, "").trim();
      lines.splice(i, 1);
      // Drop a blank line left behind by the removal.
      if (lines[i] === "") lines.splice(i, 1);
      return { title, body: lines.join("\n") };
    }
    if (line.trim() !== "" && !/^(<|!\[|\[)/.test(line.trim())) break;
  }
  return { title: undefined, body };
}

/** GitHub's heading-anchor slug, closely enough for the links these documents use. */
function anchorSlug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** A URL-safe file slug. */
function fileSlug(text: string): string {
  return anchorSlug(text).replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Turn GitHub alert blockquotes into Starlight asides. The repository uses GFM alerts
 * throughout (AGENTS.md mandates them in place of emoji), and they render as literal
 * "[!NOTE]" text if left alone.
 */
const ASIDE_KIND: Record<string, { type: string; title?: string }> = {
  NOTE: { type: "note" },
  TIP: { type: "tip" },
  IMPORTANT: { type: "note", title: "Important" },
  WARNING: { type: "caution", title: "Warning" },
  CAUTION: { type: "danger", title: "Caution" },
};

function convertAlerts(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    // Alerts nested in a list item are indented; the aside that replaces one keeps that
    // indentation so it stays inside the item it belonged to.
    const match = /^(\s*)>\s*\[!([A-Z]+)\]\s*$/.exec(lines[i]);
    const kind = match ? ASIDE_KIND[match[2]] : undefined;
    if (!match || !kind) {
      out.push(lines[i]);
      continue;
    }
    const indent = match[1];
    const inner: string[] = [];
    let j = i + 1;
    while (j < lines.length && new RegExp(`^${indent}\\s*>`).test(lines[j])) {
      inner.push(indent + lines[j].replace(/^\s*>\s?/, ""));
      j += 1;
    }
    out.push(indent + (kind.title ? `:::${kind.type}[${kind.title}]` : `:::${kind.type}`));
    for (const innerLine of inner) out.push(innerLine);
    out.push(`${indent}:::`);
    i = j - 1;
  }
  return out.join("\n");
}

/** Remove a level-2 section (heading plus body) by heading text. */
function removeSection(body: string, headingText: string): string {
  const lines = body.split("\n");
  const start = lines.findIndex(
    (line) => /^##\s+/.test(line) && line.replace(/^##\s+/, "").trim().toLowerCase() === headingText.toLowerCase(),
  );
  if (start === -1) return body;
  let end = start + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) end += 1;
  lines.splice(start, end - start);
  return lines.join("\n");
}

/** Strip a leading centered HTML banner block (the README/plugin-README masthead). */
function stripBanner(body: string): { title: string | undefined; body: string } {
  if (!body.trimStart().startsWith("<div align=\"center\">")) return { title: undefined, body };
  const close = body.indexOf("</div>");
  if (close === -1) return { title: undefined, body };
  const banner = body.slice(0, close);
  const heading = /^#\s+(.+)$/m.exec(banner);
  let rest = body.slice(close + "</div>".length).replace(/^\s*\n/, "");
  rest = rest.replace(/^\s*---\s*\n/, "");
  return { title: heading ? heading[1].trim() : undefined, body: rest };
}

/**
 * Where a repository path is published on this site, if it is published at all. A link between
 * two files that both became pages stays inside the site instead of bouncing the reader out to
 * GitHub; anything with no page here (a script, a test fixture, `_SOURCES.md`) returns
 * undefined and falls through to the canonical blob URL.
 */
function sitePathFor(repoPath: string): string | undefined {
  const skillReference = /^plugins\/([^/]+)\/skills\/([^/]+)\/references\/(.+)\.md$/.exec(repoPath);
  if (skillReference) {
    return `/plugins/${skillReference[1]}/${skillReference[2]}/${fileSlug(skillReference[3])}/`;
  }
  const skill = /^plugins\/([^/]+)\/skills\/([^/]+)(\/SKILL\.md|\/)?$/.exec(repoPath);
  if (skill) return `/plugins/${skill[1]}/${skill[2]}/`;
  const plugin = /^plugins\/([^/]+)(\/README\.md|\/)?$/.exec(repoPath);
  if (plugin) return `/plugins/${plugin[1]}/`;
  const decision = /^docs\/decisions\/(.+)\.md$/.exec(repoPath);
  if (decision) return `/decisions/${fileSlug(decision[1])}/`;
  const specification = /^openspec\/specs\/([^/]+)\/([^/]+)\/spec\.md$/.exec(repoPath);
  if (specification) return `/specifications/${specification[1]}/${specification[2]}/`;
  const governance = GOVERNANCE.find((entry) => entry.file === repoPath);
  if (governance) return `/governance/${governance.slug}/`;
  return undefined;
}

/**
 * Repoint repository-relative links. Anything under docs/assets or docs/diagrams becomes a
 * site-absolute path (those trees are mirrored into site/public and are also published at the
 * same paths by the composed Pages artifact); a file that has its own page here becomes an
 * internal link; everything else becomes a GitHub blob URL, so a link to a file with no page
 * still resolves to the canonical source.
 */
function rewriteLinks(body: string, sourceRel: string): string {
  const baseDir = path.posix.dirname(sourceRel.split(path.sep).join("/"));

  const resolveTarget = (target: string): string | undefined => {
    const trimmed = target.trim();
    if (trimmed === "") return undefined;
    if (/^(https?:|mailto:|#|\/)/.test(trimmed)) return undefined;
    const hashAt = trimmed.indexOf("#");
    const filePart = hashAt === -1 ? trimmed : trimmed.slice(0, hashAt);
    const hash = hashAt === -1 ? "" : trimmed.slice(hashAt);
    if (filePart === "") return undefined;
    const resolved = path.posix.normalize(path.posix.join(baseDir, filePart));
    if (resolved.startsWith("..")) return undefined;
    for (const mirror of PUBLIC_MIRRORS) {
      if (resolved.startsWith(`docs/${mirror}/`)) return `/${resolved.slice("docs/".length)}${hash}`;
    }
    const onSite = sitePathFor(resolved);
    if (onSite) return `${onSite}${hash}`;
    return `${BLOB}${resolved}${hash}`;
  };

  let out = body.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (whole, target: string, title: string | undefined) => {
    const replaced = resolveTarget(target);
    return replaced === undefined ? whole : `](${replaced}${title ?? ""})`;
  });

  out = out.replace(/(\s(?:src|srcset|href)=")([^"]+)(")/g, (whole, lead: string, target: string, tail: string) => {
    const replaced = resolveTarget(target);
    return replaced === undefined ? whole : `${lead}${replaced}${tail}`;
  });

  return out;
}

/** Derive a one-line description from the first prose paragraph, cut on a word boundary. */
function deriveDescription(body: string): string | undefined {
  const paragraph: string[] = [];
  let inFence = false;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const isProse = line !== "" && !/^(#|<|>|\||:::|!\[|[-*+]\s|\d+\.\s|---)/.test(line);
    if (isProse) {
      paragraph.push(line);
      continue;
    }
    if (paragraph.length > 0) break;
  }
  if (paragraph.length === 0) return undefined;
  const plain = paragraph
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length < 20) return undefined;
  if (plain.length <= 180) return plain;
  const cut = plain.slice(0, 180);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 120 ? lastSpace : 180).replace(/[,;:]$/, "").trimEnd()}...`;
}

/** YAML double-quoted scalar. JSON string escaping is a valid subset. */
function yamlString(value: string): string {
  return JSON.stringify(value);
}

type PageOptions = {
  out: string;
  title: string;
  description?: string;
  sourceRel?: string;
  order?: number;
  label?: string;
  body: string;
};

function emitPage(options: PageOptions): void {
  const lines = ["---", `title: ${yamlString(options.title)}`];
  if (options.description) lines.push(`description: ${yamlString(options.description)}`);
  if (options.order !== undefined || options.label !== undefined) {
    lines.push("sidebar:");
    if (options.order !== undefined) lines.push(`  order: ${options.order}`);
    if (options.label !== undefined) lines.push(`  label: ${yamlString(options.label)}`);
  }
  if (options.sourceRel) lines.push(`editUrl: ${yamlString(BLOB + options.sourceRel)}`);
  lines.push("---", "");
  if (options.sourceRel) {
    lines.push(
      `<!-- Generated from ${options.sourceRel} by scripts/build-site-content.ts. Edit the source, not this file. -->`,
      "",
    );
  }
  lines.push(options.body.replace(/\s*$/, ""), "");
  writePage(options.out, lines.join("\n"));
}

/** The standard pipeline applied to a document that becomes one page. */
function transform(source: string, sourceRel: string): { title?: string; body: string } {
  const { data, body: afterFrontmatter } = splitFrontmatter(source);
  const banner = stripBanner(afterFrontmatter);
  let body = banner.body;
  let title = banner.title;
  if (title === undefined) {
    const lifted = liftTitle(body);
    title = lifted.title;
    body = lifted.body;
  }
  body = removeSection(body, "Table of contents");
  body = removeSection(body, "Contents");
  body = convertAlerts(body);
  body = rewriteLinks(body, sourceRel);
  const description = data.description ?? deriveDescription(body);
  return { title, body: `${body}\n\n${sourceFooter(sourceRel)}`, ...(description ? { description } : {}) } as {
    title?: string;
    body: string;
    description?: string;
  };
}

function sourceFooter(sourceRel: string): string {
  return `---\n\n_Source of truth: [\`${sourceRel}\`](${BLOB}${sourceRel}) in the \`patterson-corp\` repository._`;
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

/**
 * The architecture narrative. `layered-settings.md` is one long document; it is split on its
 * own level-2 section boundaries into the pages below. Any level-2 section this table does not
 * claim still becomes a page of its own, so a new section in the source can never be dropped
 * silently.
 */
const ARCHITECTURE_SPLIT = [
  { slug: "six-layer-model", title: "The six-layer model", sections: ["The six-layer model"] },
  { slug: "four-constraints", title: "Four verified constraints", sections: ["Four verified constraints"] },
  {
    slug: "layers-in-this-repository",
    title: "The four layers in this repository",
    sections: ["The four layers in this repository", "Numeric prefixes and gap allocation"],
  },
  {
    slug: "deployment-and-open-questions",
    title: "Deployment and open questions",
    sections: ["Deployment", "Open questions", "Citations", "Related"],
  },
];

type Section = { heading: string; body: string };

function splitSections(body: string): { preamble: string; sections: Section[] } {
  const lines = body.split("\n");
  const sections: Section[] = [];
  const preamble: string[] = [];
  let current: Section | undefined;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s+/.test(line)) {
      current = { heading: line.replace(/^##\s+/, "").trim(), body: "" };
      sections.push(current);
      continue;
    }
    if (current) current.body += `${line}\n`;
    else preamble.push(line);
  }
  return { preamble: preamble.join("\n"), sections };
}

function buildArchitecture(): void {
  const sourceRel = "docs/architecture/layered-settings.md";
  if (!existsSync(path.join(ROOT, sourceRel))) {
    notices.push(`architecture: ${sourceRel} not found -- section skipped`);
    return;
  }
  const raw = read(sourceRel);
  const lifted = liftTitle(splitFrontmatter(raw).body);
  const { preamble, sections } = splitSections(lifted.body);
  const byHeading = new Map<string, Section>();
  for (const section of sections) byHeading.set(section.heading, section);

  // Which page each level-2 and level-3 anchor ends up on, so in-document links keep working
  // once the document is four pages instead of one.
  const anchorPage = new Map<string, string>();
  const claimed = new Set<string>(["Contents", "Source shorthand"]);
  anchorPage.set(anchorSlug("Source shorthand"), "/architecture/");
  for (const page of [{ slug: "", sections: ["Source shorthand"] }, ...ARCHITECTURE_SPLIT]) {
    for (const heading of page.sections) {
      const section = byHeading.get(heading);
      if (!section) continue;
      claimed.add(heading);
      anchorPage.set(anchorSlug(heading), `/architecture/${page.slug}/`);
      for (const line of section.body.split("\n")) {
        const match = /^#{3,6}\s+(.+)$/.exec(line);
        if (match) anchorPage.set(anchorSlug(match[1]), `/architecture/${page.slug}/`);
      }
    }
  }

  const leftovers = sections.filter((section) => !claimed.has(section.heading));
  for (const section of leftovers) {
    const slug = fileSlug(section.heading);
    anchorPage.set(anchorSlug(section.heading), `/architecture/${slug}/`);
    notices.push(`architecture: unclaimed section "${section.heading}" published as its own page`);
  }

  const repointAnchors = (text: string, selfPath: string): string =>
    text.replace(/\]\(#([^)]+)\)/g, (whole, anchor: string) => {
      const target = anchorPage.get(anchor);
      if (!target || target === selfPath) return whole;
      return `](${target}#${anchor})`;
    });

  const renderPage = (
    slug: string,
    title: string,
    headings: string[],
    order: number,
    lead: string,
    label?: string,
  ): void => {
    const parts: string[] = [];
    if (lead.trim() !== "") parts.push(lead.trim());
    for (const heading of headings) {
      const section = byHeading.get(heading);
      if (!section) {
        notices.push(`architecture: section "${heading}" is missing from the source`);
        continue;
      }
      // A page carrying one section whose heading is already the page title does not repeat
      // it; a page carrying several keeps every heading so the on-page contents still works.
      const omitHeading = headings.length === 1 && heading === title && lead.trim() === "";
      parts.push(omitHeading ? section.body.replace(/\s*$/, "") : `## ${heading}\n${section.body.replace(/\s*$/, "")}`);
    }
    const selfPath = slug === "index" ? "/architecture/" : `/architecture/${slug}/`;
    let body = parts.join("\n\n");
    body = convertAlerts(body);
    body = rewriteLinks(body, sourceRel);
    body = repointAnchors(body, selfPath);
    emitPage({
      out: `architecture/${slug}.md`,
      title,
      description: deriveDescription(body),
      sourceRel,
      order,
      ...(label ? { label } : {}),
      body: `${body}\n\n${sourceFooter(sourceRel)}`,
    });
  };

  // The document's own preamble and its citation legend become the section landing page, so
  // each split page below carries exactly the section it is named for.
  renderPage("index", lifted.title ?? "Layered managed settings", ["Source shorthand"], 0, preamble, "Overview");

  let order = 1;
  for (const page of ARCHITECTURE_SPLIT) {
    renderPage(page.slug, page.title, page.sections, order, "");
    order += 1;
  }
  for (const section of leftovers) {
    renderPage(fileSlug(section.heading), section.heading, [section.heading], order, "");
    order += 1;
  }

  // Every other document under docs/architecture/ becomes a page of its own.
  for (const entry of listDir("docs/architecture")) {
    if (!entry.endsWith(".md") || entry === "layered-settings.md") continue;
    const otherRel = `docs/architecture/${entry}`;
    const result = transform(read(otherRel), otherRel);
    emitPage({
      out: `architecture/${fileSlug(entry.replace(/\.md$/, ""))}.md`,
      title: result.title ?? entry,
      description: (result as { description?: string }).description,
      sourceRel: otherRel,
      order,
      body: result.body,
    });
    order += 1;
  }

  buildDiagrams(order);
}

/** Scope every selector in a stylesheet under a prefix. */
function scopeCss(css: string, prefix: string): string {
  return css.replace(/(^|\})([^{}]*)\{/g, (whole, boundary: string, selectors: string) => {
    const scoped = selectors
      .split(",")
      .map((selector) => selector.trim())
      .filter((selector) => selector !== "")
      .map((selector) => `${prefix} ${selector}`)
      .join(", ");
    if (scoped === "") return whole;
    return `${boundary}\n      ${scoped} {`;
  });
}

/**
 * The diagrams page inlines each SVG rather than linking it, so the diagrams are searchable
 * text and scale with the page. Each file's internal <style> block is scoped under the
 * figure's id first: the three diagrams reuse class names (`.hd`, `.ln`) with different
 * declarations, and an SVG <style> inlined into HTML is document-wide.
 */
function buildDiagrams(order: number): void {
  const files = listDir("docs/diagrams").filter((entry) => entry.endsWith(".svg"));
  if (files.length === 0) {
    notices.push("architecture: no diagrams found under docs/diagrams");
    return;
  }
  const parts: string[] = [
    "The diagrams below are the ones used across this documentation and in the repository's own",
    "README files. Each is a single SVG file under [`docs/diagrams/`](" + BLOB + "docs/diagrams)",
    "and is published unchanged.",
    "",
  ];
  for (const file of files) {
    const slug = fileSlug(file.replace(/\.svg$/, ""));
    const svgRaw = read(`docs/diagrams/${file}`);
    const titleMatch = /<title>([^<]*)<\/title>/.exec(svgRaw);
    const labelMatch = /aria-label="([^"]*)"/.exec(svgRaw);
    const heading = titleMatch ? titleMatch[1] : slug;
    let svg = svgRaw.replace(/<style>([\s\S]*?)<\/style>/g, (whole, css: string) =>
      `<style>${scopeCss(css, `#diagram-${slug}`)}</style>`,
    );
    // Drop the fixed pixel size so the viewBox drives a responsive render.
    svg = svg.replace(/^(\s*<svg\b[^>]*?)>/, (whole, openTag: string) =>
      `${openTag.replace(/\s+width="[^"]*"/, "").replace(/\s+height="[^"]*"/, "")}>`,
    );
    parts.push(`## ${heading}`, "");
    parts.push(`<figure id="diagram-${slug}" class="pat-diagram">`, "");
    parts.push(svg.trim(), "");
    if (labelMatch) parts.push(`<figcaption>${labelMatch[1]}</figcaption>`);
    parts.push("</figure>", "");
    parts.push(
      `Source: [\`docs/diagrams/${file}\`](${BLOB}docs/diagrams/${file}). ` +
        `Also published at [\`/diagrams/${file}\`](/diagrams/${file}).`,
      "",
    );
  }
  emitPage({
    out: "architecture/diagrams.md",
    title: "Diagrams",
    description:
      "The layered ownership model, the marketplace topology, and the anatomy of a capability, inlined from the repository's SVG sources.",
    order,
    body: parts.join("\n"),
  });
}

function buildPlugins(): void {
  const pluginNames = listDir("plugins").filter((entry) => isDir(`plugins/${entry}`));
  const rows: string[] = [];

  for (const plugin of pluginNames) {
    const manifestRel = `plugins/${plugin}/.claude-plugin/plugin.json`;
    let description = "";
    if (existsSync(path.join(ROOT, manifestRel))) {
      const manifest = JSON.parse(read(manifestRel)) as { description?: string; version?: string };
      description = manifest.description ?? "";
      rows.push(
        `| [\`${plugin}\`](/plugins/${plugin}/) | ${manifest.version ?? ""} | ${description} |`,
      );
    }

    const readmeRel = `plugins/${plugin}/README.md`;
    if (existsSync(path.join(ROOT, readmeRel))) {
      const result = transform(read(readmeRel), readmeRel);
      emitPage({
        out: `plugins/${plugin}/index.md`,
        title: result.title ?? plugin,
        description: (result as { description?: string }).description ?? description,
        sourceRel: readmeRel,
        order: 0,
        label: "Overview",
        body: result.body,
      });
    }

    const skills = listDir(`plugins/${plugin}/skills`).filter((entry) =>
      isDir(`plugins/${plugin}/skills/${entry}`),
    );
    let skillOrder = 1;
    for (const skill of skills) {
      const skillRel = `plugins/${plugin}/skills/${skill}/SKILL.md`;
      if (existsSync(path.join(ROOT, skillRel))) {
        const result = transform(read(skillRel), skillRel);
        emitPage({
          out: `plugins/${plugin}/${skill}/index.md`,
          title: result.title ?? skill,
          description: (result as { description?: string }).description,
          sourceRel: skillRel,
          order: 0,
          label: "The skill",
          body: result.body,
        });
      }
      let refOrder = 1;
      for (const reference of listDir(`plugins/${plugin}/skills/${skill}/references`)) {
        if (!reference.endsWith(".md")) continue;
        const refRel = `plugins/${plugin}/skills/${skill}/references/${reference}`;
        const result = transform(read(refRel), refRel);
        emitPage({
          out: `plugins/${plugin}/${skill}/${fileSlug(reference.replace(/\.md$/, ""))}.md`,
          title: result.title ?? reference,
          description: (result as { description?: string }).description,
          sourceRel: refRel,
          order: refOrder,
          body: result.body,
        });
        refOrder += 1;
      }
      skillOrder += 1;
    }
  }

  const body = [
    "Each plugin below installs on its own. Nothing here is bundled: a team that wants the",
    "engineering standards and not the brand system installs one and not the other.",
    "",
    "| Plugin | Version | What it is |",
    "|---|---|---|",
    ...rows,
    "",
    "```text",
    "/plugin marketplace add patterson-agents/patterson-corp",
    ...pluginNames.map((plugin) => `/plugin install ${plugin}@patterson-corp`),
    "```",
    "",
    "Every skill page on this site is generated from that skill's own `SKILL.md`, and every",
    "reference page from the `references/` file beside it. The repository is the source of",
    "truth; this site is a reading surface for it.",
  ].join("\n");

  emitPage({
    out: "plugins/index.md",
    title: "Plugin catalog",
    description: "The installable plugins in the patterson-corp enterprise catalog, and the skills inside each.",
    order: 0,
    label: "Catalog",
    body,
  });
}

function buildDecisions(): void {
  const files = listDir("docs/decisions").filter((entry) => entry.endsWith(".md"));
  let order = 1;
  const rows: string[] = [];
  for (const file of files) {
    const sourceRel = `docs/decisions/${file}`;
    const result = transform(read(sourceRel), sourceRel);
    const slug = fileSlug(file.replace(/\.md$/, ""));
    const title = result.title ?? file;
    const statusMatch = /\*\*Status:\*\*\s*(.+)/.exec(read(sourceRel));
    rows.push(`| [${title}](/decisions/${slug}/) | ${statusMatch ? statusMatch[1].trim() : ""} |`);
    emitPage({
      out: `decisions/${slug}.md`,
      title,
      description: (result as { description?: string }).description,
      sourceRel,
      order,
      body: result.body,
    });
    order += 1;
  }
  emitPage({
    out: "decisions/index.md",
    title: "Architecture decisions",
    description:
      "Every architectural decision on record, with the context that produced it and the consequences accepted alongside it.",
    order: 0,
    label: "All decisions",
    body: [
      "A decision record is written once and then left alone. When a later decision changes",
      "the answer, it supersedes the record rather than editing it, so the reasoning that was",
      "true at the time stays readable.",
      "",
      "| Decision | Status |",
      "|---|---|",
      ...rows,
      "",
      "Numbering is not contiguous. A gap means a number was allocated to a decision that was",
      "never recorded, not that a record is missing from this list.",
    ].join("\n"),
  });
}

function buildSpecifications(): void {
  const groups = listDir("openspec/specs").filter((entry) => isDir(`openspec/specs/${entry}`));
  const rows: string[] = [];
  for (const group of groups) {
    const capabilities = listDir(`openspec/specs/${group}`).filter((entry) =>
      existsSync(path.join(ROOT, `openspec/specs/${group}/${entry}/spec.md`)),
    );
    let order = 1;
    for (const capability of capabilities) {
      const sourceRel = `openspec/specs/${group}/${capability}/spec.md`;
      const result = transform(read(sourceRel), sourceRel);
      const title = result.title ?? `${group}/${capability}`;
      const requirementCount = (read(sourceRel).match(/^###\s+Requirement:/gm) ?? []).length;
      rows.push(
        `| [\`${group}/${capability}\`](/specifications/${group}/${capability}/) | ${requirementCount} |`,
      );
      emitPage({
        out: `specifications/${group}/${capability}.md`,
        title,
        description: (result as { description?: string }).description,
        sourceRel,
        order,
        label: capability,
        body: result.body,
      });
      order += 1;
    }
  }
  emitPage({
    out: "specifications/index.md",
    title: "Capability specifications",
    description:
      "The behavior contracts this catalog holds itself to, one specification per capability, grouped by the area each governs.",
    order: 0,
    label: "All capabilities",
    body: [
      "Every substantive change here is proposed and specified before it is built. A change",
      "proposal carries a delta; once it lands, the delta folds into the capability",
      "specification below and the proposal is archived. What you are reading is the current",
      "state, not the history that produced it.",
      "",
      "| Capability | Requirements |",
      "|---|---|",
      ...rows,
      "",
      "Requirements are written as observable scenarios so that satisfying one is a matter of",
      "evidence rather than opinion.",
    ].join("\n"),
  });
}

const GOVERNANCE = [
  { file: "CONTRIBUTING.md", slug: "contributing" },
  { file: "CODE_OF_CONDUCT.md", slug: "code-of-conduct" },
  { file: "SECURITY.md", slug: "security" },
  { file: "AGENTS.md", slug: "agents" },
];

function buildGovernance(): void {
  let order = 1;
  const rows: string[] = [];
  for (const entry of GOVERNANCE) {
    if (!existsSync(path.join(ROOT, entry.file))) {
      notices.push(`governance: ${entry.file} not found -- page skipped`);
      continue;
    }
    const result = transform(read(entry.file), entry.file);
    const title = result.title ?? entry.file;
    rows.push(`| [${title}](/governance/${entry.slug}/) | \`${entry.file}\` |`);
    emitPage({
      out: `governance/${entry.slug}.md`,
      title,
      description: (result as { description?: string }).description,
      sourceRel: entry.file,
      order,
      body: result.body,
    });
    order += 1;
  }
  emitPage({
    out: "governance/index.md",
    title: "Governance",
    description:
      "How work enters this repository, how it is reviewed, how vulnerabilities are reported, and what is expected of everyone taking part.",
    order: 0,
    label: "Overview",
    body: [
      "Contribution here is deliberately slow at the front and fast at the back: a change is",
      "proposed and specified before it is written, and once it is specified the review is",
      "about whether the code matches the spec.",
      "",
      "| Document | In the repository |",
      "|---|---|",
      ...rows,
    ].join("\n"),
  });
}

function buildProvenance(): void {
  const rows: string[] = [];
  let tbdTotal = 0;
  for (const plugin of listDir("plugins").filter((entry) => isDir(`plugins/${entry}`))) {
    for (const skill of listDir(`plugins/${plugin}/skills`).filter((entry) =>
      isDir(`plugins/${plugin}/skills/${entry}`),
    )) {
      const base = `plugins/${plugin}/skills/${skill}`;
      const sources = existsSync(path.join(ROOT, `${base}/_SOURCES.md`))
        ? `[\`_SOURCES.md\`](${BLOB}${base}/_SOURCES.md)`
        : "not recorded";
      const references = existsSync(path.join(ROOT, `${base}/REFERENCES.md`))
        ? `[\`REFERENCES.md\`](${BLOB}${base}/REFERENCES.md)`
        : "not recorded";
      let tbd = 0;
      for (const walked of walk(base)) {
        if (!walked.endsWith(".md")) continue;
        tbd += (read(walked).match(/\[TBD/g) ?? []).length;
      }
      tbdTotal += tbd;
      rows.push(
        `| [\`${skill}\`](/plugins/${plugin}/${skill}/) | \`${plugin}\` | ${sources} | ${references} | ${tbd} |`,
      );
    }
  }

  const body = [
    "Every assertion in this catalog traces to a source. Each skill carries two provenance",
    "files: `_SOURCES.md` records where the content came from and how confident the extraction",
    "is, and `REFERENCES.md` records where the canonical original lives.",
    "",
    "| Skill | Plugin | Where it came from | Canonical location | Open `[TBD]` |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "## Silence is recorded, not filled",
    "",
    `A \`[TBD]\` marker is working as designed. There are **${tbdTotal}** of them across the`,
    "catalog today. Each one marks a place where encoded knowledge appeared to require",
    "something Patterson has not actually stated.",
    "",
    "The platform never manufactures organizational policy. When a source is silent, the",
    "silence is written down and escalated rather than resolved locally, because a plausible",
    "invented answer is harder to find and correct later than an honest gap. A `[TBD]` is a",
    "finding to raise with the owning team, not a defect to close.",
    "",
    "```bash",
    "grep -rn '\\[TBD' plugins/",
    "```",
    "",
    "Patterson logos and brand imagery are proprietary. Proxima Nova is licensed through Adobe",
    "Fonts and no font binaries are distributed here or served from this site: the typeface",
    "loads from the Adobe Fonts kit at runtime.",
  ].join("\n");

  emitPage({
    out: "provenance.md",
    title: "Provenance",
    description:
      "Where every assertion in the catalog came from, and the open questions recorded rather than invented.",
    body,
  });
}

/** Every file under a repository-relative directory, recursively. */
function walk(relDir: string): string[] {
  const abs = path.join(ROOT, relDir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(abs)) {
    const childRel = `${relDir}/${entry}`;
    if (isDir(childRel)) out.push(...walk(childRel));
    else out.push(childRel);
  }
  return out;
}

/** Mirror docs/assets and docs/diagrams into site/public so images resolve during dev. */
function mirrorPublicAssets(): void {
  for (const mirror of PUBLIC_MIRRORS) {
    const target = path.join(PUBLIC_OUT, mirror);
    rmSync(target, { recursive: true, force: true });
    const sourceDir = `docs/${mirror}`;
    if (!isDir(sourceDir)) continue;
    mkdirSync(target, { recursive: true });
    for (const entry of listDir(sourceDir)) {
      const from = path.join(ROOT, sourceDir, entry);
      if (statSync(from).isFile()) copyFileSync(from, path.join(target, entry));
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main(): number {
  if (!existsSync(DOCS_OUT)) {
    process.stderr.write(
      "error: site/src/content/docs not found -- run this from a checkout with site/ scaffolded\n",
    );
    return 2;
  }

  for (const dir of GENERATED_DIRS) rmSync(path.join(DOCS_OUT, dir), { recursive: true, force: true });
  for (const file of GENERATED_FILES) rmSync(path.join(DOCS_OUT, file), { force: true });

  mirrorPublicAssets();
  buildArchitecture();
  buildPlugins();
  buildDecisions();
  buildSpecifications();
  buildGovernance();
  buildProvenance();

  for (const notice of notices) process.stdout.write(`note: ${notice}\n`);
  process.stdout.write(`build-site-content: ${pagesWritten} page(s) written to site/src/content/docs\n`);
  return 0;
}

process.exitCode = main();

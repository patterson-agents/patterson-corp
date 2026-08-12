#!/usr/bin/env node
/**
 * check-security-config.ts -- audits which GitHub security scanning controls a repository
 * has configured in its files.
 *
 * Usage:  node check-security-config.ts <path-to-repository-root>
 *
 * Text-based (regex) scanner. Deliberately has NO third-party dependencies and no build
 * step: it runs on plain Node (>= 22.18) via native TypeScript type stripping, and it does
 * not parse YAML, because a YAML library is not guaranteed to be installed in a Patterson
 * agent-configuration repository -- those repositories carry no package.json, no
 * tsconfig.json and no node_modules by design. It therefore reasons over raw lines, not a
 * parsed document tree, and every pattern below is written conservatively: a false positive
 * on a security control is more damaging than a miss, because it teaches readers to ignore
 * the output.
 *
 * SCOPE LIMIT -- read before treating a clean run as a hardened repository.
 *   This auditor can only see files in the repository. It cannot verify any server-side
 *   setting: whether secret scanning is actually enabled, whether push protection is on,
 *   whether GitHub Advanced Security is enabled for this repository, whether a code-scanning
 *   workflow ever ran, or whether the CodeQL extractor found any files. Those live in the
 *   repository's security settings and are checked with `gh api`, by a human, or in the
 *   GitHub UI. Nothing in this script performs a network call.
 *
 * Output: one finding per line, "LEVEL|file|line|rule|message"
 *         LEVEL is ERROR, WARN or INFO. line 0 means the finding is file-scope.
 *         file paths are relative to the audited repository root.
 * Exit:   0 = pass (no ERROR findings)   1 = ERROR findings present   2 = could not evaluate
 *
 * Related standard: CI/CD Pipeline Standards
 * https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=c70e79833b650f107f43b50236e45a7d
 * No ServiceNow article covers GitHub security scanning; see ../_SOURCES.md.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const WORKFLOW_EXT = [".yml", ".yaml"];
const SKIP_DIRS = new Set([".git", "node_modules", ".terraform", "dist", "build"]);
const MAX_DEPTH = 12;

/**
 * Every Unicode line boundary. The two paragraph/line separators are built at runtime
 * rather than written as literals, because an unescaped U+2028 in a source file terminates
 * the regex literal that contains it.
 */
const LINE_BREAK = new RegExp(
  "\\r\\n|[\\n\\r\\v\\f\\x1c\\x1d\\x1e\\x85" + String.fromCharCode(0x2028, 0x2029) + "]",
);

/** Evidence that CodeQL analysis runs. */
const CODEQL_EVIDENCE = /github\/codeql-action\/(init|analyze)|\bcodeql\b/i;
/** Evidence that *some* result is uploaded to code scanning, which is not the same thing. */
const SARIF_UPLOAD = /upload-sarif|sarif_file/i;
/** The javascript-typescript extractor, however it is spelled in the language matrix. */
const JS_TS_LANGUAGE = /javascript|typescript/i;

const ECOSYSTEM = /package-ecosystem\s*:\s*['"]?([a-z0-9_-]+)/i;

/**
 * Directories that conventionally hold deliberately synthetic credentials. Deliberately
 * narrow: only the two layouts this repository actually uses. A repository that keeps
 * fixtures elsewhere must add its own exclusions by hand -- this script does not guess,
 * because guessing wide would suppress the very rule it is checking.
 */
const FIXTURE_DIR_SUFFIXES = ["hooks/tests", "tests/fixtures"];

/** Locations GitHub accepts for a security policy. */
const SECURITY_POLICY_PATHS = ["SECURITY.md", ".github/SECURITY.md", "docs/SECURITY.md"];

type Finding = string;

/** Stat a path, returning undefined instead of throwing when it does not exist. */
function tryStat(target: string): import("node:fs").Stats | undefined {
  try {
    return statSync(target);
  } catch {
    return undefined;
  }
}

function isFile(target: string): boolean {
  return tryStat(target)?.isFile() === true;
}

/** Split text on every Unicode line boundary, dropping a single trailing empty line. */
function splitLines(text: string): string[] {
  if (text === "") return [];
  const parts = text.split(LINE_BREAK);
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function readLines(target: string): string[] | undefined {
  try {
    return splitLines(readFileSync(target, "utf8"));
  } catch {
    return undefined;
  }
}

function emit(
  out: Finding[],
  level: string,
  filePath: string,
  line: number,
  rule: string,
  message: string,
): void {
  // The message must never contain a pipe, or the five-field contract breaks.
  out.push(`${level}|${filePath}|${line}|${rule}|${message.replace(/\|/g, "/")}`);
}

function toPosix(rel: string): string {
  return rel.split(path.sep).join("/");
}

/** Strip a trailing YAML comment and surrounding quotes from a scalar. */
function cleanScalar(raw: string): string {
  let value = raw.trim();
  const hash = value.indexOf(" #");
  if (hash >= 0) value = value.slice(0, hash).trim();
  value = value.replace(/^['"]/, "").replace(/['"]$/, "");
  return value.trim();
}

/** The first existing path from a candidate list, relative to root. */
function firstExisting(root: string, candidates: string[]): string | undefined {
  for (const rel of candidates) {
    if (isFile(path.join(root, rel))) return rel;
  }
  return undefined;
}

/** Every .yml/.yaml file directly under .github/workflows. */
function workflowFiles(root: string): string[] {
  const dir = path.join(root, ".github", "workflows");
  if (tryStat(dir)?.isDirectory() !== true) return [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isFile() && WORKFLOW_EXT.some((ext) => e.name.endsWith(ext)))
    .map((e) => path.join(".github", "workflows", e.name))
    .sort();
}

/** Directories under root whose path ends with a known fixture-directory suffix. */
function fixtureDirs(root: string): string[] {
  const found: string[] = [];
  const walk = (dir: string, depth: number): void => {
    if (depth > MAX_DEPTH) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      const rel = toPosix(path.relative(root, full));
      if (FIXTURE_DIR_SUFFIXES.some((suffix) => rel === suffix || rel.endsWith(`/${suffix}`))) {
        found.push(rel);
      }
      walk(full, depth + 1);
    }
  };
  walk(root, 0);
  return found.sort();
}

/**
 * Entries under a top-level `paths-ignore:` key. Line-oriented, not a YAML parse: the block
 * runs from the key until a line that is neither a list item, blank, nor a comment.
 */
function pathsIgnoreEntries(lines: string[]): string[] {
  const entries: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    if (/^\s*paths-ignore\s*:/.test(line)) {
      inBlock = true;
      continue;
    }
    if (!inBlock) continue;
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item) {
      const value = cleanScalar(item[1]);
      if (value !== "") entries.push(value);
      continue;
    }
    inBlock = false;
  }
  return entries;
}

/** Does any exclusion glob plausibly cover this directory? Prefix match, globs stripped. */
function isCovered(dir: string, entries: string[]): boolean {
  return entries.some((entry) => {
    const base = entry.replace(/\*+$/, "").replace(/\/+$/, "");
    if (base === "") return true;
    return dir === base || dir.startsWith(`${base}/`);
  });
}

function checkCodeScanning(root: string, out: Finding[]): void {
  const workflows = workflowFiles(root);
  let codeqlFile: string | undefined;
  let sarifFile: string | undefined;
  let languageDeclared = false;

  for (const rel of workflows) {
    const lines = readLines(path.join(root, rel));
    if (lines === undefined) continue;
    const blob = lines.join("\n");
    if (codeqlFile === undefined && CODEQL_EVIDENCE.test(blob)) {
      codeqlFile = rel;
      languageDeclared = JS_TS_LANGUAGE.test(blob);
    }
    if (sarifFile === undefined && SARIF_UPLOAD.test(blob)) sarifFile = rel;
  }

  if (codeqlFile === undefined) {
    const detail =
      sarifFile === undefined
        ? "no workflow under .github/workflows runs CodeQL analysis"
        : `${sarifFile} uploads SARIF to code scanning but no workflow runs CodeQL analysis`;
    emit(
      out,
      "ERROR",
      ".github/workflows/codeql.yml",
      0,
      "code-scanning/missing",
      `${detail}. Install the codeql.yml template from this skill's assets/ directory.`,
    );
    return;
  }

  if (!languageDeclared) {
    emit(
      out,
      "WARN",
      codeqlFile,
      0,
      "code-scanning/no-language",
      "CodeQL runs here but no javascript or typescript language is declared. With no " +
        "package manifest the extractor can succeed having analysed zero files, so confirm " +
        "the 'files analysed' count in the first run rather than trusting a green check.",
    );
  }
}

function checkDependabot(root: string, out: Finding[]): void {
  const rel = firstExisting(root, [".github/dependabot.yml", ".github/dependabot.yaml"]);
  if (rel === undefined) {
    emit(
      out,
      "ERROR",
      ".github/dependabot.yml",
      0,
      "dependabot/missing",
      "no Dependabot configuration found. Install the dependabot.yml template from this " +
        "skill's assets/ directory.",
    );
    return;
  }

  const lines = readLines(path.join(root, rel));
  if (lines === undefined) {
    emit(
      out,
      "ERROR",
      rel,
      0,
      "dependabot/unreadable",
      "Dependabot configuration could not be read",
    );
    return;
  }

  let hasActions = false;
  lines.forEach((line, idx) => {
    if (/^\s*#/.test(line)) return;
    const match = ECOSYSTEM.exec(line);
    if (match === null) return;
    const ecosystem = match[1].toLowerCase();
    if (ecosystem === "github-actions") {
      hasActions = true;
      return;
    }
    if (ecosystem === "npm" && !isFile(path.join(root, "package.json"))) {
      emit(
        out,
        "WARN",
        rel,
        idx + 1,
        "dependabot/npm-without-manifest",
        "the npm ecosystem is declared but this repository has no package.json. Dependabot " +
          "reports an error on every run for an ecosystem with no manifest to read.",
      );
    }
  });

  if (!hasActions) {
    emit(
      out,
      "ERROR",
      rel,
      0,
      "dependabot/no-github-actions",
      "Dependabot does not cover the github-actions ecosystem. Pinned action versions are " +
        "this repository's real third-party dependency surface.",
    );
  }
}

/** Join a path list for a single-line message, capped so one finding stays readable. */
function summarise(items: string[], cap: number): string {
  if (items.length <= cap) return items.join(", ");
  return `${items.slice(0, cap).join(", ")}, and ${items.length - cap} more`;
}

function checkSecretScanning(root: string, fixtures: string[], out: Finding[]): void {
  const rel = firstExisting(root, [".github/secret_scanning.yml", ".github/secret_scanning.yaml"]);
  const fixtureList = summarise(fixtures, 3);

  if (rel === undefined) {
    // Escalate only when the repository actually carries fixture directories: those are what
    // turn a missing exclusion file into a blocked push rather than a missing nicety.
    const level = fixtures.length > 0 ? "ERROR" : "WARN";
    const detail =
      fixtures.length > 0
        ? `fixture directories are present (${fixtureList}) and would trip push protection`
        : "no fixture directories were detected, so this is advisory";
    emit(
      out,
      level,
      ".github/secret_scanning.yml",
      0,
      "secret-scanning/missing",
      `no secret-scanning exclusion file found; ${detail}. Install the secret_scanning.yml ` +
        "template from this skill's assets/ directory BEFORE enabling push protection.",
    );
    return;
  }

  const lines = readLines(path.join(root, rel));
  if (lines === undefined) {
    emit(
      out,
      "ERROR",
      rel,
      0,
      "secret-scanning/unreadable",
      "secret-scanning exclusion file could not be read",
    );
    return;
  }

  const entries = pathsIgnoreEntries(lines);
  if (entries.length === 0) {
    if (fixtures.length > 0) {
      emit(
        out,
        "ERROR",
        rel,
        0,
        "secret-scanning/no-exclusions",
        "this file declares no paths-ignore entries, but fixture directories are present " +
          `(${fixtureList}). Enabling push protection would block on the repository's own ` +
          "synthetic test credentials.",
      );
    }
    return;
  }

  for (const dir of fixtures) {
    if (!isCovered(dir, entries)) {
      emit(
        out,
        "WARN",
        rel,
        0,
        "secret-scanning/fixture-not-excluded",
        `fixture directory ${dir} is not covered by any paths-ignore entry. Glob semantics ` +
          "are not fully evaluated here, so confirm the exclusion by hand.",
      );
    }
  }
}

function checkSecurityPolicy(root: string, out: Finding[]): void {
  if (firstExisting(root, SECURITY_POLICY_PATHS) !== undefined) return;
  emit(
    out,
    "ERROR",
    "SECURITY.md",
    0,
    "security-policy/missing",
    "no security policy found at SECURITY.md, .github/SECURITY.md or docs/SECURITY.md. " +
      "GitHub surfaces this file in the repository's Security tab and in the private " +
      "vulnerability reporting flow.",
  );
}

/** Findings that are true on every run, because this script reads files and nothing else. */
function emitStandingCaveats(out: Finding[]): void {
  emit(
    out,
    "WARN",
    ".",
    0,
    "push-protection/unverifiable",
    "whether secret scanning, push protection and GitHub Advanced Security are actually " +
      "enabled is a server-side setting that no file in this repository records. This " +
      "auditor performs no network call; verify with gh api or the repository settings UI.",
  );
  emit(
    out,
    "INFO",
    ".",
    0,
    "coverage/dast-open",
    "DAST is not covered by any control this auditor can check. Trivy and GitLeaks are not " +
      "DAST; DAST requires exercising a running application. The row is open and addressed " +
      "to AppSec. See references/required-scans-mapping.md.",
  );
}

function main(argv: string[]): number {
  if (argv.length !== 2) {
    process.stderr.write("usage: check-security-config.ts <path-to-repository-root>\n");
    return 2;
  }
  const root = argv[1];
  const stats = tryStat(root);
  if (stats === undefined) {
    process.stderr.write(`error: path not found: ${root}\n`);
    return 2;
  }
  if (!stats.isDirectory()) {
    process.stderr.write(`error: not a directory (expected a repository root): ${root}\n`);
    return 2;
  }

  const out: Finding[] = [];
  const fixtures = fixtureDirs(root);

  checkCodeScanning(root, out);
  checkDependabot(root, out);
  checkSecretScanning(root, fixtures, out);
  checkSecurityPolicy(root, out);
  emitStandingCaveats(out);

  for (const line of out) process.stdout.write(line + "\n");
  return out.some((l) => l.startsWith("ERROR|")) ? 1 : 0;
}

process.exitCode = main(process.argv.slice(1));

#!/usr/bin/env node
/**
 * house-standards-guard.ts -- patterson-engineering PreToolUse hook for Bash|Write|Edit.
 *
 * Hard-blocks one Patterson house rule:
 *   The June 2026 supply-chain denylist: the four AUR-attack packages and their publisher
 *   are blocked anywhere in a Bash command, and in written content outside docs/tests.
 *
 * Toolchain choice is deliberately NOT enforced here. Language and package-manager
 * selection belong to each repository, not to an org-wide hook.
 *
 * OFF SWITCH
 *   Set PATTERSON_ENGINEERING_HOOKS=off to disable ALL blocking. Would-block notes still
 *   print to stderr. Any other value (or unset) leaves blocking enabled.
 *
 * Reads the PreToolUse JSON payload on stdin. Emits a deny decision as JSON on stdout.
 * Runs on plain Node (>= 22.18) via native type stripping. No build step, no dependencies.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";

// Denylisted names are assembled from halves so this file never contains one as a
// contiguous literal -- otherwise the guard would block edits to its own source and any
// forbidden-string scan would flag it (same trick as verify-all.sh's "Figtre[e]").
const DENYLIST: string[] = [
  "atomic-" + "lockfile",
  "js-" + "digest",
  "lockfile" + "-js",
  "nextfile" + "-js",
  "herb" + "sobering",
];

const PYTHON_TOOL = /^(python[0-9.]*|pip[0-9]*|pipx|uv|poetry|conda|virtualenv)$/;
const FOREIGN_PM = /^(npm|pnpm|yarn|npx)$/;
const PY_EXT = /\.(py|pyw|pyi)$/i;
const FOREIGN_LOCKFILES = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

// Tokens that are transparent to command position: the real command follows them.
const WRAPPERS = new Set(["sudo", "env", "exec", "nohup", "time", "nice", "stdbuf", "xargs"]);
const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

// Paths where denylisted names in CONTENT are expected (policy docs, test fixtures).
const CONTENT_EXEMPT_PATH =
  /(^|[\\/])(tests?|__tests__|fixtures?|testdata|spec|examples?|docs?)([\\/]|$)|\.(md|mdx|rst|txt)$/i;

const OFF_SWITCH_NOTE =
  "To disable this hook for a demo or a known false positive, set " +
  "PATTERSON_ENGINEERING_HOOKS=off in the environment.";

/** Serialise a value as JSON using ", " and ": " as separators. */
function pyDumps(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return "[" + value.map(pyDumps).join(", ") + "]";
  return (
    "{" +
    Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => JSON.stringify(k) + ": " + pyDumps(v))
      .join(", ") +
    "}"
  );
}

function deny(reason: string): void {
  process.stdout.write(
    pyDumps({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }) + "\n",
  );
}

/** First word of each shell segment, after assignments and transparent wrappers. */
function commandPositionTokens(command: string): string[] {
  const tokens: string[] = [];
  const segments = command.split(/\|\||&&|;|\||\r?\n|\$\(|`|[{}()]/);
  for (const segment of segments) {
    const words = segment.trim().split(/\s+/).filter((w) => w.length > 0);
    let i = 0;
    let isQuery = false;
    while (i < words.length) {
      const word = words[i];
      if (ENV_ASSIGNMENT.test(word) || word.startsWith("-")) {
        i += 1;
        continue;
      }
      const base = path.basename(word).toLowerCase();
      if (base === "command") {
        // `command -v python` is an existence query, not an invocation.
        if (words.slice(i + 1).some((w) => w === "-v" || w === "-V")) isQuery = true;
        i += 1;
        continue;
      }
      if (WRAPPERS.has(base)) {
        i += 1;
        continue;
      }
      if (!isQuery) tokens.push(base);
      break;
    }
  }
  return tokens;
}

function checkBash(command: string): string | null {
  const lower = command.toLowerCase();
  for (const name of DENYLIST) {
    if (lower.includes(name)) {
      return (
        `BLOCKED by patterson-engineering: '${name}' is on the Patterson supply-chain ` +
        "denylist (June 2026 AUR attack: malicious npm packages pulled in via install hooks). " +
        "Never install or reference these packages or this publisher.\n" +
        OFF_SWITCH_NOTE
      );
    }
  }
  return null;
}

function checkContent(targetPath: string, text: string): string | null {
  if (CONTENT_EXEMPT_PATH.test(targetPath)) return null;
  const lower = text.toLowerCase();
  for (const name of DENYLIST) {
    if (lower.includes(name)) {
      return (
        `BLOCKED by patterson-engineering: the content being written to ` +
        `${targetPath || "<unknown file>"} references '${name}', which is on the Patterson ` +
        "supply-chain denylist (June 2026 AUR attack). Do not add these packages or this " +
        "publisher to any manifest or script.\n" +
        OFF_SWITCH_NOTE
      );
    }
  }
  return null;
}

/** Return [file_path, text_being_written] for Write/Edit payloads. */
function extract(ti: Record<string, unknown>): [string, string] {
  const filePath = ti["file_path"];
  const altPath = ti["path"];
  let target = "";
  if (typeof filePath === "string" && filePath) target = filePath;
  else if (typeof altPath === "string" && altPath) target = altPath;

  const chunks: string[] = [];
  for (const key of ["content", "new_string", "new_str"]) {
    const val = ti[key];
    if (typeof val === "string") chunks.push(val);
  }
  const edits = ti["edits"];
  if (Array.isArray(edits)) {
    for (const e of edits) {
      if (e && typeof e === "object" && !Array.isArray(e)) {
        const ns = (e as Record<string, unknown>)["new_string"];
        if (typeof ns === "string") chunks.push(ns);
      }
    }
  }
  return [target, chunks.join("\n")];
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function main(): void {
  const off = (process.env.PATTERSON_ENGINEERING_HOOKS ?? "").trim().toLowerCase() === "off";

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(readStdin());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    payload = parsed as Record<string, unknown>;
  } catch {
    return; // never break the session on a parse problem
  }

  const toolName = typeof payload["tool_name"] === "string" ? payload["tool_name"] : "";
  const rawTi = payload["tool_input"];
  const ti: Record<string, unknown> =
    rawTi && typeof rawTi === "object" && !Array.isArray(rawTi)
      ? (rawTi as Record<string, unknown>)
      : {};

  let reason: string | null = null;
  if (toolName === "Bash") {
    const command = typeof ti["command"] === "string" ? ti["command"] : "";
    if (command) reason = checkBash(command);
  } else {
    const [target, text] = extract(ti);
    if (text) reason = checkContent(target, text);
  }

  if (reason !== null) {
    if (off) {
      process.stderr.write(
        "[patterson-engineering] WOULD BLOCK (hooks off): " + reason.split("\n")[0] + "\n",
      );
    } else {
      deny(reason);
    }
  }
}

// FAIL OPEN. A hook that throws must never block a developer: every exit path is 0.
try {
  main();
} catch {
  // deliberately silent
}
process.exitCode = 0;

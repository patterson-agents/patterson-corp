#!/usr/bin/env node
/**
 * no-tmp-guard.ts -- patterson-engineering PreToolUse hook for Bash|Write|Edit.
 *
 * Blocks use of the shared system temp directories (/tmp, /var/tmp, /dev/shm).
 * Patterson work products stay local to the project root: `.tmp/` for scratch
 * (gitignored), `.claude/` for agent configuration, `.config/` for tool
 * configuration. Files under a system temp directory are invisible to the
 * repository, do not survive with the workspace, and leak work into a location
 * shared with every other process on the machine.
 *
 * What is checked:
 *   - Bash: any reference to a system temp directory in the command text. This is
 *     deliberately broad -- the rule is "not for anything", so reads are blocked
 *     alongside writes.
 *   - Write/Edit: a target file path under a system temp directory.
 *
 * Written CONTENT is not scanned: prose that documents these paths (like this
 * file, or the rule text itself) is legitimate.
 *
 * OFF SWITCH
 *   Set PATTERSON_ENGINEERING_HOOKS=off to disable blocking, same as the other
 *   patterson-engineering guards. Would-block notes still print to stderr.
 *
 * Reads the PreToolUse JSON payload on stdin. Emits a deny decision as JSON on
 * stdout. Runs on plain Node (>= 22.18) via native type stripping. No build
 * step, no dependencies.
 */
import { readFileSync } from "node:fs";

// A system temp path: /tmp, /var/tmp, or /dev/shm as a whole path segment --
// followed by a separator, a quote, whitespace, or the end of the string, so
// names like /tmpfoo or a project-local .tmp/ never match.
const TMP_PATH = /(^|[\s"'`=:(])\/(tmp|var\/tmp|dev\/shm)(\/|["'`\s):]|$)/;

const OFF_SWITCH_NOTE =
  "To disable this hook for a demo or a known false positive, set " +
  "PATTERSON_ENGINEERING_HOOKS=off in the environment.";

const REMEDY =
  "Nothing is created or stored under a system temp directory in Patterson " +
  "workspaces. Use a path inside the project root instead: .tmp/ for scratch " +
  "files (gitignored), .claude/ for agent configuration, .config/ for tool " +
  "configuration.";

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

function checkBash(command: string): string | null {
  if (TMP_PATH.test(command)) {
    return (
      "BLOCKED by patterson-engineering: this command references a system temp " +
      "directory. " +
      REMEDY +
      "\n" +
      OFF_SWITCH_NOTE
    );
  }
  return null;
}

function checkTargetPath(targetPath: string): string | null {
  if (/^\/(tmp|var\/tmp|dev\/shm)(\/|$)/.test(targetPath)) {
    return (
      `BLOCKED by patterson-engineering: '${targetPath}' is under a system temp ` +
      "directory. " +
      REMEDY +
      "\n" +
      OFF_SWITCH_NOTE
    );
  }
  return null;
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
    const filePath = ti["file_path"] ?? ti["path"] ?? ti["notebook_path"];
    if (typeof filePath === "string" && filePath) reason = checkTargetPath(filePath);
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

main();

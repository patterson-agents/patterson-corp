#!/usr/bin/env node
/**
 * secrets-scan-guard.ts -- patterson-engineering PreToolUse hook for Write|Edit.
 *
 * Runs the pending file content through two real secret scanners before the write
 * lands: TruffleHog (detector-based, verification-capable) and Trivy's secret
 * rules. Either scanner reporting a finding denies the tool call. This complements
 * pretooluse-guard.ts, whose built-in regexes catch the highest-frequency Patterson
 * patterns without any external tooling.
 *
 * Works on BOTH agent surfaces:
 *   - Claude Code:  payload fields `tool_name` / `tool_input` (registered in
 *     hooks/hooks.json and the workspace .claude/settings.json)
 *   - GitHub Copilot: payload fields `toolName` / `toolArgs` (registered in
 *     .github/hooks/secrets-scan.json), which emits the same
 *     `permissionDecision: deny` JSON contract.
 *
 * FAIL-OPEN BY DESIGN
 *   If trufflehog or trivy is not installed, or a scanner errors or times out, the
 *   call proceeds and a note is printed to stderr. The scanners are an extra net,
 *   not the only one: pretooluse-guard.ts, the pre-commit stage, and GitHub push
 *   protection all still apply. Install both with mise: `mise use trufflehog trivy`.
 *
 * EXEMPT PATHS
 *   Test fixtures and docs legitimately carry synthetic secrets (the hook test
 *   payloads are the canonical example, excluded from GitHub secret scanning via
 *   .github/secret_scanning.yml). The same path classes are exempt here.
 *
 * OFF SWITCH
 *   Set PATTERSON_ENGINEERING_HOOKS=off to disable blocking, same as the other
 *   patterson-engineering guards. Would-block notes still print to stderr.
 *
 * Reads the PreToolUse JSON payload on stdin. Emits a deny decision as JSON on
 * stdout. Scratch content is staged under the project-local .tmp/ (never a system
 * temp directory, per the no-tmp rule). Runs on plain Node (>= 22.18) via native
 * type stripping. No build step, no dependencies.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as path from "node:path";

const CONTENT_EXEMPT_PATH =
  /(^|[\\/])(tests?|__tests__|fixtures?|testdata|spec|examples?|docs?)([\\/]|$)|\.(md|mdx|rst|txt)$/i;

const SCAN_TIMEOUT_MS = 20000;

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
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    }) + "\n",
  );
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** Return [file_path, text_being_written] from Claude or Copilot tool input. */
function extract(ti: Record<string, unknown>): [string, string] {
  let target = "";
  for (const key of ["file_path", "path", "notebook_path", "filePath"]) {
    const val = ti[key];
    if (typeof val === "string" && val) {
      target = val;
      break;
    }
  }
  const chunks: string[] = [];
  for (const key of ["content", "new_string", "new_str", "newString", "text"]) {
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

interface ScanResult {
  findings: string[];
  skipped: string | null;
}

/** True when a spawn error means the binary is simply not installed. */
function isNotInstalled(err: NodeJS.ErrnoException | undefined): boolean {
  return err !== undefined && err.code === "ENOENT";
}

function runTrufflehog(scanPath: string): ScanResult {
  const res = spawnSync(
    "trufflehog",
    ["filesystem", "--no-update", "--json", "--fail", "--results=verified,unknown", scanPath],
    { timeout: SCAN_TIMEOUT_MS, encoding: "utf8" },
  );
  if (isNotInstalled(res.error)) {
    return { findings: [], skipped: "trufflehog not installed (mise use trufflehog)" };
  }
  if (res.error) return { findings: [], skipped: "trufflehog failed to run: " + res.error.message };
  // --fail exits 183 when findings exist; 0 means clean.
  if (res.status === 0) return { findings: [], skipped: null };
  const findings: string[] = [];
  for (const line of (res.stdout ?? "").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>;
      const detector = obj["DetectorName"];
      if (typeof detector === "string") {
        const verified = obj["Verified"] === true ? " (VERIFIED live credential)" : "";
        findings.push("trufflehog: " + detector + verified);
      }
    } catch {
      /* non-JSON line */
    }
  }
  if (findings.length === 0 && res.status === 183) findings.push("trufflehog: secret detected");
  return { findings, skipped: null };
}

function runTrivy(scanPath: string): ScanResult {
  const res = spawnSync(
    "trivy",
    ["fs", "--scanners", "secret", "--format", "json", "--quiet", "--exit-code", "1", scanPath],
    { timeout: SCAN_TIMEOUT_MS, encoding: "utf8" },
  );
  if (isNotInstalled(res.error)) {
    return { findings: [], skipped: "trivy not installed (mise use trivy)" };
  }
  if (res.error) return { findings: [], skipped: "trivy failed to run: " + res.error.message };
  if (res.status === 0) return { findings: [], skipped: null };
  const findings: string[] = [];
  try {
    const report = JSON.parse(res.stdout ?? "{}") as Record<string, unknown>;
    const results = report["Results"];
    if (Array.isArray(results)) {
      for (const r of results) {
        const secrets = (r as Record<string, unknown>)["Secrets"];
        if (Array.isArray(secrets)) {
          for (const s of secrets) {
            const title = (s as Record<string, unknown>)["Title"];
            const rule = (s as Record<string, unknown>)["RuleID"];
            findings.push("trivy: " + (typeof title === "string" ? title : String(rule ?? "secret")));
          }
        }
      }
    }
  } catch {
    /* unparseable output */
  }
  if (findings.length === 0 && res.status !== 0) findings.push("trivy: secret detected");
  return { findings, skipped: null };
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

  // Claude Code uses tool_name/tool_input; Copilot uses toolName/toolArgs.
  const toolName =
    typeof payload["tool_name"] === "string"
      ? payload["tool_name"]
      : typeof payload["toolName"] === "string"
        ? payload["toolName"]
        : "";
  const rawTi = payload["tool_input"] ?? payload["toolArgs"];
  const ti: Record<string, unknown> =
    rawTi && typeof rawTi === "object" && !Array.isArray(rawTi)
      ? (rawTi as Record<string, unknown>)
      : {};

  const [target, text] = extract(ti);
  if (!text) return; // nothing being written (reads, bash, etc.)
  if (target && CONTENT_EXEMPT_PATH.test(target)) return; // fixtures and docs

  // Stage the pending content in the project-local scratch dir; never a system temp dir.
  const cwd =
    typeof payload["cwd"] === "string" && payload["cwd"]
      ? (payload["cwd"] as string)
      : process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const scratchDir = path.join(cwd, ".tmp", "secrets-scan");
  const ext = target ? path.extname(target) || ".txt" : ".txt";
  const scratchFile = path.join(scratchDir, "pending-" + process.pid + ext);

  let findings: string[] = [];
  const skips: string[] = [];
  try {
    mkdirSync(scratchDir, { recursive: true });
    writeFileSync(scratchFile, text, "utf8");
    for (const result of [runTrufflehog(scratchFile), runTrivy(scratchFile)]) {
      findings = findings.concat(result.findings);
      if (result.skipped) skips.push(result.skipped);
    }
  } catch (err) {
    process.stderr.write(
      "[patterson-engineering] secrets-scan-guard skipped (fail-open): " + String(err) + "\n",
    );
    return;
  } finally {
    try {
      rmSync(scratchDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }

  for (const s of skips) {
    process.stderr.write("[patterson-engineering] secrets-scan-guard: " + s + " -- fail-open\n");
  }

  if (findings.length > 0) {
    const reason =
      "BLOCKED by patterson-engineering: the content being written to " +
      (target || "<unknown file>") +
      " contains what a secret scanner identifies as a credential:\n  - " +
      findings.slice(0, 5).join("\n  - ") +
      "\nSecrets never land in a Patterson repository. Reference the value from the " +
      "environment or a key vault, or use an obvious placeholder like <YOUR-API-KEY>. " +
      "If this is a synthetic test fixture, it belongs under a tests/ or fixtures/ path.\n" +
      OFF_SWITCH_NOTE;
    if (off) {
      process.stderr.write(
        "[patterson-engineering] WOULD BLOCK (hooks off): " + reason.split("\n")[0] + "\n",
      );
    } else {
      deny(reason);
    }
  }

  void toolName;
}

main();

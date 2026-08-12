#!/usr/bin/env node
/**
 * pretooluse-guard.ts -- patterson-engineering PreToolUse hook for Write|Edit.
 *
 * BLOCKS exactly two unambiguous violations:
 *   1. A high-confidence hardcoded secret being written to a file.
 *   2. A Dockerfile FROM referencing a base image that is not on the approved list
 *      (hooks/approved-base-images.txt, next to this script's parent directory).
 *
 * Everything else is ADVISORY: a note on stderr and exit 0.
 *
 * OFF SWITCH
 *   Set PATTERSON_ENGINEERING_HOOKS=off to disable ALL blocking. Advisory notes still
 *   print. Any other value (or unset) leaves blocking enabled.
 *
 * Reads the PreToolUse JSON payload on stdin. Emits a deny decision as JSON on stdout.
 * Runs on plain Node (>= 22.18) via native type stripping. No build step, no dependencies.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";

const SCRIPT_PATH = path.resolve(process.argv[1] ?? "");
const HOOKS_DIR = path.dirname(path.dirname(SCRIPT_PATH));
const ALLOWLIST_PATH = path.join(HOOKS_DIR, "approved-base-images.txt");

const CICD_KB =
  "https://patterson.service-now.com/esc?id=kb_article_view" +
  "&sys_kb_id=c70e79833b650f107f43b50236e45a7d";
const COMPUTE_KB =
  "https://patterson.service-now.com/esc?id=kb_article_view" +
  "&sys_kb_id=937eb90b3b650f107f43b50236e45a16";

type Labelled = [RegExp, string];

// --- High-confidence secret patterns only. A false positive here is worse than a miss. ---
const SECRET_PATTERNS: Labelled[] = [
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key ID"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, "GitHub personal access token"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, "Slack token"],
  [/\bnpm_[A-Za-z0-9]{36}\b/, "npm access token"],
  [/\bAIza[0-9A-Za-z_\-]{35}\b/, "Google API key"],
  [/\bsk-[A-Za-z0-9]{32,}\b/, "OpenAI-style API secret key"],
  [/-----BEGIN\s+(RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/, "private key block"],
  [
    /DefaultEndpointsProtocol=https?;[^\n]{0,200}?AccountKey=[A-Za-z0-9+/]{60,}/i,
    "Azure Storage connection string with an account key",
  ],
  [
    /Endpoint=sb:\/\/[^\n]{0,200}?SharedAccessKey=[A-Za-z0-9+/]{30,}/i,
    "Azure Service Bus / Event Hub connection string with a shared access key",
  ],
  [
    /\b(Server|Data Source)\s*=[^;\n]{1,80};[^\n]{0,200}?\bPassword\s*=\s*(?![\s;"']|\$|\{|<|%)[^;\n"']{8,}/i,
    "database connection string with an embedded password",
  ],
];

// Anything matching these on the same line is treated as a placeholder, not a real secret.
const PLACEHOLDER_HINTS =
  /\b(example|sample|placeholder|redacted|dummy|fake|test|fixture|changeme|your[-_]?(key|token|secret)|xxxx|<[a-z0-9_-]+>)\b/i;
const TEMPLATE_REF = /\$\{|\$\(|\{\{|%[A-Z_]+%/;

// Paths where secret-like strings are expected and must not be blocked.
const EXEMPT_PATH =
  /(^|[\\/])(tests?|__tests__|fixtures?|testdata|spec|examples?|docs?)([\\/]|$)|\.(md|mdx|rst|txt)$/i;

const FROM_LINE = /^\s*FROM\s+(?<image>\S+)(\s+[Aa][Ss]\s+(?<alias>\S+))?\s*$/;
const STAGE_ALIAS = /^\s*FROM\s+\S+\s+AS\s+(\S+)\s*$/i;

// --- Advisory-only patterns (never block). ---
const ADVISORY: Labelled[] = [
  [
    /azurerm_public_ip|Microsoft\.Network\/publicIPAddresses/i,
    "public IP resource detected. Azure Compute Standards: VMs and VMSS must never have public IPs. " +
      "Run skills/azure-compute-standards/scripts/check-compute.ts.",
  ],
  [
    /azurerm_container_group|Microsoft\.ContainerInstance/i,
    "Azure Container Instances detected. ACI is not used in the Patterson environment at all.",
  ],
  [
    /shared_access_key_enabled\s*=\s*true|allowSharedKeyAccess\s*:\s*true/i,
    "storage shared keys enabled. Storage & Data Standards: shared keys must be disabled unless approved.",
  ],
  [
    /min(imum)?_?tls_?version\s*[:=]\s*["']?(TLS)?1[._](0|1)/i,
    "minimum TLS below 1.2. Storage & Data Standards: TLS 1.2 minimum, 1.3+ where supported.",
  ],
  [
    /privileged\s*[:=]\s*true/i,
    "privileged container. Azure Compute Standards: images and base layers must not run as privileged.",
  ],
];

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

/** Split text on every Unicode line boundary, dropping a single trailing empty line. */
function splitLines(text: string): string[] {
  if (text === "") return [];
  const parts = text.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/);
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
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

function loadAllowlist(): string[] {
  const prefixes: string[] = [];
  try {
    const raw = readFileSync(ALLOWLIST_PATH, "utf8");
    for (const rawLine of splitLines(raw)) {
      const line = rawLine.trim();
      if (line && !line.startsWith("#")) prefixes.push(line);
    }
  } catch {
    // Missing or unreadable allowlist: behave as if empty.
  }
  return prefixes;
}

/** Return [file_path, text_being_written]. */
function extract(payload: Record<string, unknown>): [string, string] {
  const rawTi = payload["tool_input"];
  const ti: Record<string, unknown> =
    rawTi && typeof rawTi === "object" && !Array.isArray(rawTi)
      ? (rawTi as Record<string, unknown>)
      : {};
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

function checkSecrets(targetPath: string, text: string): string | null {
  if (EXEMPT_PATH.test(targetPath)) return null;
  for (const line of splitLines(text)) {
    if (PLACEHOLDER_HINTS.test(line) || TEMPLATE_REF.test(line)) continue;
    for (const [pattern, label] of SECRET_PATTERNS) {
      if (pattern.test(line)) return label;
    }
  }
  return null;
}

function checkDockerfile(targetPath: string, text: string, allowlist: string[]): string | null {
  const base = path.basename(targetPath);
  if (
    !(
      base === "Dockerfile" ||
      base.startsWith("Dockerfile.") ||
      base.endsWith(".Dockerfile") ||
      base === "Containerfile"
    )
  ) {
    return null;
  }
  const aliases = new Set<string>();
  for (const line of splitLines(text)) {
    const m = STAGE_ALIAS.exec(line);
    if (m) aliases.add(m[1].toLowerCase());
  }
  for (const line of splitLines(text)) {
    const m = FROM_LINE.exec(line);
    if (!m) continue;
    const image = m.groups?.image ?? "";
    if (aliases.has(image.toLowerCase())) continue; // multi-stage reference, not a base image
    if (image.includes("$")) continue; // build-arg templated; cannot evaluate, do not block
    if (allowlist.some((p) => image.startsWith(p))) continue;
    return image;
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

function parsePayload(): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(readStdin());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null; // never break the session on a parse problem
  }
}

function main(): void {
  const off = (process.env.PATTERSON_ENGINEERING_HOOKS ?? "").trim().toLowerCase() === "off";
  const enforceImages =
    (process.env.PATTERSON_ENGINEERING_BASE_IMAGE_ENFORCE ?? "").trim().toLowerCase() === "on";

  const payload = parsePayload();
  if (payload === null) return;

  const [targetPath, text] = extract(payload);
  if (!text) return;

  const notes: string[] = [];

  const secret = checkSecrets(targetPath, text);
  if (secret) {
    const reason =
      `BLOCKED by patterson-engineering: a ${secret} appears in the content being written to ` +
      `${targetPath || "<unknown file>"}.\n` +
      "CI/CD Pipeline Standards: secrets must never be in code. Use a dedicated secrets " +
      "manager (Vault or a cloud-native secrets manager) and reference the secret at runtime.\n" +
      `Standard: ${CICD_KB}\n` +
      "To disable this hook for a demo or a known false positive, set " +
      "PATTERSON_ENGINEERING_HOOKS=off in the environment.";
    if (off) {
      notes.push(`[patterson-engineering] WOULD BLOCK (hooks off): ${secret} in ${targetPath}`);
    } else {
      deny(reason);
      return;
    }
  }

  const image = checkDockerfile(targetPath, text, loadAllowlist());
  if (image) {
    const reason =
      `BLOCKED by patterson-engineering: Dockerfile base image '${image}' is not on the approved ` +
      "base image list.\n" +
      "Azure Compute Standards: only security-approved images may be used; unmodified Microsoft " +
      "marketplace images qualify. CI/CD Pipeline Standards additionally require approved base images.\n" +
      "Approved prefixes are listed in hooks/approved-base-images.txt inside this plugin. " +
      "[TBD: the standards do not enumerate an approved container registry list; confirm the " +
      "internal registry with Infra CloudOps and AppSec and add it to that file.]\n" +
      `Standard: ${COMPUTE_KB}\n` +
      "To disable this hook for a demo or a known false positive, set " +
      "PATTERSON_ENGINEERING_HOOKS=off in the environment.";
    if (off) {
      notes.push(`[patterson-engineering] WOULD BLOCK (hooks off): base image ${image}`);
    } else if (enforceImages) {
      deny(reason);
      return;
    } else {
      // Advisory by default. The Azure Compute Standards require "approved base images"
      // but never enumerate an approved container registry or image list, so blocking
      // here would enforce a rule Patterson has not actually written. Opt in with
      // PATTERSON_ENGINEERING_BASE_IMAGE_ENFORCE=on once Infra CloudOps and AppSec have
      // confirmed the allowlist in hooks/approved-base-images.txt.
      notes.push(
        `[patterson-engineering] advisory: Dockerfile base image '${image}' is not on the ` +
          "approved base image list (hooks/approved-base-images.txt). The standards do not " +
          "yet enumerate approved container images, so this is a warning, not a block. " +
          `Set PATTERSON_ENGINEERING_BASE_IMAGE_ENFORCE=on to enforce. Standard: ${COMPUTE_KB}`,
      );
    }
  }

  for (const [pattern, message] of ADVISORY) {
    if (pattern.test(text)) {
      notes.push(`[patterson-engineering] advisory: ${message}`);
    }
  }

  for (const note of notes) process.stderr.write(note + "\n");
}

// FAIL OPEN. A hook that throws must never block a developer: every exit path is 0.
try {
  main();
} catch {
  // deliberately silent
}
process.exitCode = 0;

#!/usr/bin/env node
/**
 * check-tooling.ts -- Patterson Approved Software checker.
 *
 * Usage:
 *   node check-tooling.ts <tool-name>     e.g. node check-tooling.ts trivy
 *   node check-tooling.ts <path>          a manifest, lockfile, CI file, Dockerfile or directory
 *
 * Reports each detected tool as approved / approved-with-approval / unknown, with the
 * owning team where the standard states one. No third-party dependencies and no build step:
 * runs on plain Node (>= 22.18) via native TypeScript type stripping.
 *
 * Output: "LEVEL|file|line|rule|message"
 *   LEVEL  OK    = approved, no approval needed
 *          WARN  = approved but requires approval before use
 *          ERROR = not listed in the standard (unknown), or an approved tool used outside
 *                  its stated conditions
 * Exit:   0 = pass (no ERROR findings)   1 = ERROR findings present   2 = could not evaluate
 *
 * Standard: Approved Software
 * https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

// Ownership. The standard states: "AppSec owns the security tools; Infra CloudOps owns
// source control, Terraform, and observability." Owners below are assigned from that
// sentence. Where a tool falls into neither category the owner is marked [TBD].
const APPSEC = "AppSec";
const CLOUDOPS = "Infra CloudOps";
const TBD_OWNER = "[TBD: owner not specified in the Approved Software standard]";

type Status = "approved" | "approval-required" | "approved-with-cost";

// name -> [status, owner, note]
const REGISTRY: Record<string, [Status, string, string]> = {
  // --- Approved, no approval needed ---
  github: ["approved", CLOUDOPS, "Enterprise managed org only. PUBLIC REPOS REQUIRE APPROVAL."],
  terraform: ["approved", CLOUDOPS, "Approved modules only."],
  trivy: [
    "approved",
    APPSEC,
    "Container security. The standard notes: 'Checkmarx will replace this tool.'",
  ],
  gitleaks: ["approved", APPSEC, "Secret scanning."],

  // --- Approved, approval REQUIRED ---
  "azure-devops": ["approval-required", CLOUDOPS, "Source control / pipelines."],
  "visual-studio": [
    "approval-required",
    TBD_OWNER,
    "Professional for non-Principal engineers; Enterprise for Principal and above.",
  ],
  lucid: ["approval-required", TBD_OWNER, "Lucid Suite (diagramming)."],
  launchdarkly: ["approval-required", TBD_OWNER, "Feature flagging."],
  tonic: ["approval-required", TBD_OWNER, "Data de-identification."],
  jfrog: ["approval-required", APPSEC, "3rd-party package security."],
  checkmarx: ["approval-required", APPSEC, "SAST, SCA, API and IaC scanning."],
  qualys: ["approval-required", APPSEC, "Vulnerability scanning."],
  dynatrace: ["approval-required", CLOUDOPS, "APM."],
  pagerduty: ["approval-required", CLOUDOPS, "Alerting and on-call."],
  "azure-app-insights": ["approval-required", CLOUDOPS, "Application Insights."],
  confluence: ["approval-required", TBD_OWNER, "Documentation."],
  snagit: ["approval-required", TBD_OWNER, "Screen capture."],

  // --- Approved, no approval needed, but carries a cost ---
  "log-analytics-workspace": [
    "approved-with-cost",
    CLOUDOPS,
    "No approval required, but it has a cost.",
  ],
};

// Detection aliases -> canonical registry key. Insertion order is significant: it decides
// which alias reports first when several match the same line.
const ALIASES: [string, string][] = [
  ["github", "github"],
  ["gh", "github"],
  ["actions/checkout", "github"],
  ["github actions", "github"],
  ["github-actions", "github"],
  ["terraform", "terraform"],
  ["hashicorp/terraform", "terraform"],
  ["opentofu", "terraform"],
  ["tofu", "terraform"],
  ["trivy", "trivy"],
  ["aquasecurity/trivy-action", "trivy"],
  ["aquasec/trivy", "trivy"],
  ["gitleaks", "gitleaks"],
  ["zricethezav/gitleaks", "gitleaks"],
  ["gitleaks-action", "gitleaks"],
  ["azure devops", "azure-devops"],
  ["azure-devops", "azure-devops"],
  ["azuredevops", "azure-devops"],
  ["azure pipelines", "azure-devops"],
  ["ado", "azure-devops"],
  ["dev.azure.com", "azure-devops"],
  ["visual studio", "visual-studio"],
  ["visual-studio", "visual-studio"],
  ["devenv", "visual-studio"],
  ["lucid", "lucid"],
  ["lucidchart", "lucid"],
  ["lucidspark", "lucid"],
  ["lucid suite", "lucid"],
  ["launchdarkly", "launchdarkly"],
  ["launchdarkly-js-client-sdk", "launchdarkly"],
  ["ld-client", "launchdarkly"],
  ["tonic", "tonic"],
  ["tonic.ai", "tonic"],
  ["jfrog", "jfrog"],
  ["artifactory", "jfrog"],
  ["xray", "jfrog"],
  ["checkmarx", "checkmarx"],
  ["cxflow", "checkmarx"],
  ["cx-flow", "checkmarx"],
  ["kics", "checkmarx"],
  ["checkmarx-ast", "checkmarx"],
  ["cxone", "checkmarx"],
  ["qualys", "qualys"],
  ["dynatrace", "dynatrace"],
  ["oneagent", "dynatrace"],
  ["pagerduty", "pagerduty"],
  ["pd", "pagerduty"],
  ["applicationinsights", "azure-app-insights"],
  ["application insights", "azure-app-insights"],
  ["app insights", "azure-app-insights"],
  ["appinsights", "azure-app-insights"],
  ["microsoft.applicationinsights", "azure-app-insights"],
  ["confluence", "confluence"],
  ["snagit", "snagit"],
  ["log analytics", "log-analytics-workspace"],
  ["loganalytics", "log-analytics-workspace"],
  ["log-analytics-workspace", "log-analytics-workspace"],
  ["azurerm_log_analytics_workspace", "log-analytics-workspace"],
];

const ALIAS_LOOKUP: Record<string, string> = {};
for (const [alias, key] of ALIASES) ALIAS_LOOKUP[alias] = key;

// Tools frequently seen in repos that are NOT in the standard. Naming them explicitly
// produces a clearer message than a bare "unknown".
const KNOWN_UNLISTED = [
  "snyk",
  "sonarqube",
  "sonarcloud",
  "semgrep",
  "codeql",
  "grype",
  "clair",
  "anchore",
  "trufflehog",
  "datadog",
  "new relic",
  "newrelic",
  "splunk",
  "sentry",
  "gitlab",
  "bitbucket",
  "jenkins",
  "circleci",
  "travis",
  "pulumi",
  "ansible",
  "chef",
  "puppet",
  "opsgenie",
  "victorops",
  "grafana",
  "prometheus",
  "elastic",
  "nexus",
];
const KNOWN_UNLISTED_SET = new Set(KNOWN_UNLISTED);

const SCAN_EXTS = [
  ".yml",
  ".yaml",
  ".json",
  ".tf",
  ".txt",
  ".toml",
  ".csproj",
  ".props",
  ".ps1",
  ".sh",
];
const SCAN_NAMES = new Set([
  "Dockerfile",
  "Makefile",
  "Justfile",
  "justfile",
  "requirements.txt",
  "package.json",
  "bun.lock",
  "package-lock.json",
  "yarn.lock",
  "go.mod",
]);
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".terraform",
  "vendor",
  ".venv",
  "dist",
  "build",
]);

/** Escape the regex metacharacters that matter here. */
function reEscape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const UNLISTED_PATTERNS: [string, RegExp][] = KNOWN_UNLISTED.map((u) => [
  u,
  new RegExp(`(?<![a-z0-9_-])${reEscape(u)}(?![a-z0-9_-])`),
]);

/** Stat a path, returning undefined instead of throwing when it does not exist. */
function tryStat(target: string): import("node:fs").Stats | undefined {
  try {
    return statSync(target);
  } catch {
    return undefined;
  }
}

/** Split text on every Unicode line boundary, dropping a single trailing empty line. */
function splitLines(text: string): string[] {
  if (text === "") return [];
  const parts = text.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/);
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function emit(
  out: string[],
  level: string,
  filePath: string,
  line: number,
  rule: string,
  message: string,
): void {
  out.push(`${level}|${filePath}|${line}|${rule}|${message}`);
}

function report(out: string[], key: string, filePath: string, line: number): void {
  const [status, owner, note] = REGISTRY[key];
  if (status === "approved") {
    emit(
      out,
      "OK",
      filePath,
      line,
      `approved-software/${key}`,
      `APPROVED (no approval needed). Owner: ${owner}. ${note}`,
    );
  } else if (status === "approved-with-cost") {
    emit(
      out,
      "OK",
      filePath,
      line,
      `approved-software/${key}`,
      `APPROVED (no approval needed, carries a cost). Owner: ${owner}. ${note}`,
    );
  } else {
    emit(
      out,
      "WARN",
      filePath,
      line,
      `approved-software/${key}`,
      `APPROVED BUT APPROVAL REQUIRED before use. Owner: ${owner}. ${note}`,
    );
  }
}

function scanText(filePath: string, lines: string[], out: string[], seen: Set<string>): void {
  lines.forEach((ln, idx) => {
    const line = idx + 1;
    const low = ln.toLowerCase();
    for (const [alias, key] of ALIASES) {
      if (low.includes(alias) && !seen.has(key)) {
        seen.add(key);
        report(out, key, filePath, line);
      }
    }
    for (const [unlisted, pattern] of UNLISTED_PATTERNS) {
      const token = "unlisted:" + unlisted;
      if (pattern.test(low) && !seen.has(token)) {
        seen.add(token);
        emit(
          out,
          "ERROR",
          filePath,
          line,
          "approved-software/unlisted",
          `'${unlisted}' is NOT listed in the Approved Software standard. Submit it for review ` +
            "before use, or replace it with an approved equivalent.",
        );
      }
    }
  });
}

function endsWithAny(name: string, exts: string[]): boolean {
  return exts.some((e) => name.endsWith(e));
}

function collect(target: string): string[] {
  if (tryStat(target)?.isFile()) return [target];
  const files: string[] = [];
  const walk = (dir: string): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (SCAN_NAMES.has(entry.name) || endsWithAny(entry.name, SCAN_EXTS)) {
        files.push(full);
      }
    }
  };
  walk(target);
  return files.sort();
}

function lookupName(name: string, out: string[]): void {
  const key = ALIAS_LOOKUP[name.trim().toLowerCase()];
  if (key) {
    report(out, key, "<argument>", 0);
    return;
  }
  const low = name.trim().toLowerCase();
  if (KNOWN_UNLISTED_SET.has(low)) {
    emit(
      out,
      "ERROR",
      "<argument>",
      0,
      "approved-software/unlisted",
      `'${name}' is NOT listed in the Approved Software standard. Submit it for review before use, ` +
        "or replace it with an approved equivalent.",
    );
    return;
  }
  emit(
    out,
    "ERROR",
    "<argument>",
    0,
    "approved-software/unknown",
    `'${name}' is not listed in the Approved Software standard. Status unknown; request review ` +
      "before use. [TBD: the standard does not enumerate a general-purpose allow rule for " +
      "unlisted tools]",
  );
}

function main(argv: string[]): number {
  if (argv.length !== 2) {
    process.stderr.write("usage: check-tooling.ts <tool-name|file|directory>\n");
    return 2;
  }
  const target = argv[1];
  const out: string[] = [];
  if (tryStat(target) !== undefined) {
    const files = collect(target);
    if (files.length === 0) {
      process.stderr.write(`error: no scannable manifest/CI files found under ${target}\n`);
      return 2;
    }
    for (const f of files) {
      let lines: string[];
      try {
        lines = splitLines(readFileSync(f, "utf8"));
      } catch (exc) {
        emit(out, "ERROR", f, 0, "unreadable", `could not read file: ${String(exc)}`);
        continue;
      }
      scanText(f, lines, out, new Set<string>());
    }
    if (out.length === 0) {
      emit(
        out,
        "OK",
        target,
        0,
        "approved-software/none-detected",
        "no tooling from the Approved Software standard was detected in the scanned files.",
      );
    }
  } else {
    if (target.includes(path.sep) || target.startsWith(".")) {
      process.stderr.write(`error: path not found: ${target}\n`);
      return 2;
    }
    lookupName(target, out);
  }

  for (const line of out) process.stdout.write(line + "\n");
  return out.some((l) => l.startsWith("ERROR|")) ? 1 : 0;
}

process.exitCode = main(process.argv.slice(1));

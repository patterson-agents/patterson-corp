#!/usr/bin/env node
/**
 * check-pipeline.ts -- Patterson CI/CD Pipeline Standards validator.
 *
 * Usage:  node check-pipeline.ts <path-to-pipeline-yaml-or-directory>
 *
 * Text-based (regex) scanner. Deliberately has NO third-party dependencies and no build
 * step: it runs on plain Node (>= 22.18) via native TypeScript type stripping, and it does
 * not parse YAML, because a YAML library is not guaranteed to be installed.
 * It therefore reasons over raw lines, not a parsed document tree.
 *
 * Output: one finding per line, "LEVEL|file|line|rule|message"
 * Exit:   0 = pass (no ERROR findings)   1 = ERROR findings present   2 = could not evaluate
 *
 * Standard: CI/CD Pipeline Standards
 * https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=c70e79833b650f107f43b50236e45a7d
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const PIPELINE_EXT = [".yml", ".yaml"];
const SKIP_DIRS = new Set([".git", "node_modules", ".terraform"]);

// Required CI scan categories -> regexes that count as evidence the scan runs.
const REQUIRED_SCANS: Record<string, [string, string]> = {
  sast: [
    "\\bsast\\b|checkmarx|\\bcx[-_ ]?(one|sast|flow)\\b|codeql|sonarqube|semgrep",
    "SAST scanning",
  ],
  sca: [
    "\\bsca\\b|checkmarx|dependency[-_ ]?(check|scan|review)|\\bsnyk\\b|\\bosv[-_ ]?scanner\\b|component[-_ ]analysis",
    "SCA / dependency scanning",
  ],
  dast: [
    "\\bdast\\b|\\bzap\\b|owasp[-_ ]?zap|burp|dynamic[-_ ]?(application[-_ ])?scan",
    "DAST scanning",
  ],
  "secret-scanning": [
    "gitleaks|secret[-_ ]?scan|trufflehog|detect[-_ ]?secrets|push[-_ ]?protection",
    "Secret scanning",
  ],
  "api-scanning": [
    "api[-_ ]?scan|api[-_ ]?security|checkmarx[-_ ]?api|\\bapisec\\b|openapi[-_ ]?scan",
    "API scanning",
  ],
  "container-scanning": [
    "\\btrivy\\b|checkmarx[-_ ]?(container|kics)|container[-_ ]?scan|image[-_ ]?scan|\\bgrype\\b|\\bclair\\b",
    "Container scanning (Trivy or Checkmarx)",
  ],
  "iac-scanning": [
    "\\bkics\\b|iac[-_ ]?scan|checkmarx[-_ ]?iac|\\bcheckov\\b|\\btfsec\\b|terrascan",
    "IaC scanning (Checkmarx)",
  ],
};

// Evidence that a *federated* (OIDC / workload identity) credential is in use.
const FEDERATED_EVIDENCE =
  /WorkloadIdentityFederation|workload[-_ ]?identity|id-token\s*:\s*write|federated[-_ ]?credential|oidc|AZURE_CLIENT_ID/i;

// Evidence of a *secret-based* (non-federated) service connection.
const NON_FEDERATED: [RegExp, string][] = [
  [/ServicePrincipalKey/i, "Azure DevOps ServicePrincipalKey authentication scheme"],
  [
    /authenticationScheme\s*:\s*['"]?ServicePrincipal/i,
    "ServicePrincipal (secret) authentication scheme",
  ],
  [/\bcreds\s*:\s*\$\{\{\s*secrets\./i, "azure/login with a full credentials JSON secret"],
  [/\bclient[-_ ]?secret\b/i, "client secret referenced for service connection auth"],
  [/\bARM_CLIENT_SECRET\b/, "ARM_CLIENT_SECRET (secret-based Azure auth)"],
];

// High-confidence inline secret literals. Deliberately conservative: anything that looks
// like a variable reference, template expression or obvious placeholder is excluded, because
// a false positive on a pipeline file is more damaging than a miss.
const PLACEHOLDER =
  /^(changeme|change[-_]me|placeholder|redacted|example|dummy|todo|x{3,}|\*{3,}|<[^>]+>)$/i;
const SECRET_ASSIGN =
  /\b(password|pwd|passwd|client[-_]?secret|api[-_]?key|access[-_]?key)\s*[:=]\s*["']?(?<value>[^\s"'{}$%<>][^\s"'{}$%<>]{7,})/i;
const INLINE_SECRET: [RegExp, string][] = [
  [
    /(AccountKey|SharedAccessKey)\s*=\s*[A-Za-z0-9+/]{20,}/i,
    "inline storage/service bus key in a connection string",
  ],
  [/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/, "GitHub personal access token"],
  [
    /\b(Server|Data Source)\s*=[^;]{1,80};[^\n]{0,200}?\bPassword\s*=\s*[^;\s${]{6,}/i,
    "database connection string with an embedded password",
  ],
];

const APPROVER_PATTERNS: RegExp[] = [
  /minimumApproverCount\s*:\s*(\d+)/i,
  /required_approving_review_count\s*[:=]\s*(\d+)/i,
  /required[-_ ]?approvals?\s*[:=]\s*(\d+)/i,
  /\bapprovals?\s*:\s*(\d+)\b/i,
];

const BUILD_STEP =
  /^\s*-?\s*(script|run|task)\s*:.*\b(docker\s+build|dotnet\s+build|dotnet\s+publish|mvn\s+package|npm\s+run\s+build|gradle\s+build|make\s+build|buildx\s+build)\b/i;

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
      } else if (endsWithAny(entry.name, PIPELINE_EXT)) {
        files.push(full);
      }
    }
  };
  walk(target);
  return files.sort();
}

function checkFile(filePath: string, out: string[]): void {
  let lines: string[];
  try {
    lines = splitLines(readFileSync(filePath, "utf8"));
  } catch (exc) {
    emit(out, "ERROR", filePath, 0, "unreadable", `could not read file: ${String(exc)}`);
    return;
  }
  const blob = lines.join("\n");

  // 1. Required scan stages.
  for (const rule of Object.keys(REQUIRED_SCANS).sort()) {
    const [pattern, label] = REQUIRED_SCANS[rule];
    if (!new RegExp(pattern, "i").test(blob)) {
      emit(
        out,
        "ERROR",
        filePath,
        0,
        `required-scan/${rule}`,
        `${label} not found in this pipeline. CI/CD Pipeline Standards require SAST, SCA, DAST, ` +
          "secret scanning, API scanning, container scanning and IaC scanning.",
      );
    }
  }

  // 2. Container scanner must be Trivy or Checkmarx specifically.
  if (/\b(grype|clair|anchore)\b/i.test(blob) && !/\btrivy\b|checkmarx/i.test(blob)) {
    lines.forEach((ln, idx) => {
      if (/\b(grype|clair|anchore)\b/i.test(ln)) {
        emit(
          out,
          "ERROR",
          filePath,
          idx + 1,
          "container-scanner/not-approved",
          "container scanning must use Trivy or Checkmarx; found a different scanner",
        );
      }
    });
  }

  // 3. Approver policy.
  let foundApprover = false;
  lines.forEach((ln, idx) => {
    for (const pat of APPROVER_PATTERNS) {
      const m = pat.exec(ln);
      if (m) {
        foundApprover = true;
        const count = Number.parseInt(m[1], 10);
        if (Number.isNaN(count)) continue;
        if (count < 2) {
          emit(
            out,
            "ERROR",
            filePath,
            idx + 1,
            "pr-policy/approvers",
            `approver count is ${count}; the standard requires 2 approvers on pull requests`,
          );
        }
      }
    }
  });
  if (!foundApprover) {
    emit(
      out,
      "WARN",
      filePath,
      0,
      "pr-policy/approvers-unverifiable",
      "no approver-count setting found in this file. The 2-approver requirement is normally " +
        "enforced by branch policy, not by the pipeline file; verify it in the repo settings.",
    );
  }

  // 4. Service connection credential type.
  const federated = FEDERATED_EVIDENCE.test(blob);
  lines.forEach((ln, idx) => {
    for (const [pat, label] of NON_FEDERATED) {
      if (pat.test(ln)) {
        emit(
          out,
          "ERROR",
          filePath,
          idx + 1,
          "service-connection/not-federated",
          `${label}. Service connections must use federated credentials only ` +
            "(exceptions: b2c or vendor integration).",
        );
      }
    }
  });
  if (!federated && /azureSubscription|azure\/login|azurerm/i.test(blob)) {
    emit(
      out,
      "WARN",
      filePath,
      0,
      "service-connection/federation-unconfirmed",
      "Azure authentication is used but no federated-credential marker " +
        "(WorkloadIdentityFederation, OIDC id-token, workload identity) was found.",
    );
  }

  // 5. Inline secrets.
  lines.forEach((ln, idx) => {
    for (const [pat, label] of INLINE_SECRET) {
      if (pat.test(ln)) {
        emit(
          out,
          "ERROR",
          filePath,
          idx + 1,
          "secrets/inline",
          `${label}. Secrets must never be in code; use a dedicated secrets manager ` +
            "(Vault or cloud-native).",
        );
      }
    }
    const m = SECRET_ASSIGN.exec(ln);
    if (m && !PLACEHOLDER.test(m.groups?.value ?? "")) {
      emit(
        out,
        "ERROR",
        filePath,
        idx + 1,
        "secrets/inline",
        `hardcoded credential literal assigned to '${m[1]}'. Secrets must never be in code; ` +
          "use a dedicated secrets manager (Vault or cloud-native).",
      );
    }
  });

  // 6. Build-once, promote-many.
  const buildLines: number[] = [];
  lines.forEach((ln, idx) => {
    if (BUILD_STEP.test(ln)) buildLines.push(idx + 1);
  });
  if (buildLines.length > 1) {
    emit(
      out,
      "WARN",
      filePath,
      buildLines[1],
      "build/one-build-many-artifacts",
      `${buildLines.length} build steps detected. The standard is one build, one or more artifacts: ` +
        "build once and promote the same artifact through every environment.",
    );
  }

  // 7. Unit tests.
  if (!/\b(test|pytest|dotnet\s+test|npm\s+test|go\s+test|mvn\s+test|jest|xunit)\b/i.test(blob)) {
    emit(
      out,
      "WARN",
      filePath,
      0,
      "build/unit-tests",
      "no unit-test step detected; unit testing is required by the standard",
    );
  }

  // 8. Deployment strategy + rollback + smoke test.
  if (/\b(deploy|deployment)\b/i.test(blob)) {
    if (!/blue[-_ ]?green|canary|rolling/i.test(blob)) {
      emit(
        out,
        "WARN",
        filePath,
        0,
        "deploy/strategy",
        "no approved deployment strategy (blue-green, canary, rolling) named in this pipeline",
      );
    }
    if (!/rollback/i.test(blob)) {
      emit(
        out,
        "WARN",
        filePath,
        0,
        "deploy/rollback",
        "no rollback step found; automated rollback is required",
      );
    }
    if (!/smoke[-_ ]?test|post[-_ ]?deploy(ment)?[-_ ]?(check|verify|test)/i.test(blob)) {
      emit(
        out,
        "WARN",
        filePath,
        0,
        "deploy/smoke-test",
        "no post-deployment smoke test found; smoke testing after deploy is required",
      );
    }
  }
}

function main(argv: string[]): number {
  if (argv.length !== 2) {
    process.stderr.write("usage: check-pipeline.ts <pipeline.yml|directory>\n");
    return 2;
  }
  const target = argv[1];
  if (tryStat(target) === undefined) {
    process.stderr.write(`error: path not found: ${target}\n`);
    return 2;
  }
  const files = collect(target);
  if (files.length === 0) {
    process.stderr.write(`error: no .yml/.yaml pipeline files found under ${target}\n`);
    return 2;
  }
  const out: string[] = [];
  for (const f of files) checkFile(f, out);
  for (const line of out) process.stdout.write(line + "\n");
  return out.some((l) => l.startsWith("ERROR|")) ? 1 : 0;
}

process.exitCode = main(process.argv.slice(1));

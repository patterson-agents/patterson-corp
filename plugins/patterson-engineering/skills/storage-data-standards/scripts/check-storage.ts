#!/usr/bin/env node
/**
 * check-storage.ts -- Patterson Storage & Data Standards validator.
 *
 * Usage:  node check-storage.ts <path-to-iac-file-or-directory>
 *
 * Scans Terraform (.tf), Bicep (.bicep) and ARM (.json) for storage and data-service
 * violations. Regex-based, no third-party dependencies, no build step: runs on plain
 * Node (>= 22.18) via native TypeScript type stripping.
 *
 * Output: "LEVEL|file|line|rule|message"
 * Exit:   0 = pass (no ERROR findings)   1 = ERROR findings present   2 = could not evaluate
 *
 * Standard: Storage & Data Standards
 * https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=fdc09a4d93548f908037f8bd1dba10ed
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const EXTS = [".tf", ".tfvars", ".bicep", ".json"];
const SKIP_DIRS = new Set([".git", "node_modules", ".terraform", "vendor", ".venv"]);

const VALID_CLASSIFICATIONS = ["public", "internal", "confidential", "restricted"];

const STORAGE_RESOURCE =
  /resource\s+"azurerm_(storage_account|mssql_database|mssql_server|cosmosdb_account|postgresql_flexible_server|mysql_flexible_server|managed_disk)"|Microsoft\.(Storage\/storageAccounts|Sql\/servers|DocumentDB\/databaseAccounts|DBforPostgreSQL\/flexibleServers|DBforMySQL\/flexibleServers)/i;

interface LineRule {
  rule: string;
  level: string;
  pattern: RegExp;
  message: string;
}

const LINE_RULES: LineRule[] = [
  {
    rule: "network/public-access",
    level: "ERROR",
    pattern:
      /public_network_access_enabled\s*=\s*true|publicNetworkAccess\s*:\s*'?Enabled'?|allow_blob_public_access\s*=\s*true|allowBlobPublicAccess\s*:\s*true/i,
    message:
      "public network access is enabled. Public network access must be disabled unless approved; " +
      "private endpoints are required for production sensitive workloads.",
  },
  {
    rule: "identity/shared-keys",
    level: "ERROR",
    pattern: /shared_access_key_enabled\s*=\s*true|allowSharedKeyAccess\s*:\s*true/i,
    message:
      "storage account shared keys are enabled. Shared keys must be disabled unless approved; " +
      "use Entra ID / AD wherever supported.",
  },
  {
    rule: "encryption/https-only",
    level: "ERROR",
    pattern:
      /(enable_)?https_traffic_only(_enabled)?\s*=\s*false|supportsHttpsTrafficOnly\s*:\s*false/i,
    message: "HTTPS-only transport is disabled. Encryption in transit is mandatory.",
  },
  {
    rule: "encryption/tls",
    level: "ERROR",
    pattern: /min(imum)?_?tls_?version\s*[:=]\s*["']?(TLS)?1[._](0|1)["']?/i,
    message:
      "minimum TLS version is below 1.2. TLS 1.2 is the minimum, 1.3+ where supported.",
  },
  {
    rule: "encryption/at-rest-disabled",
    level: "ERROR",
    pattern:
      /(infrastructure_encryption_enabled|encryption[_-]?at[_-]?rest|transparent_data_encryption_enabled|requireInfrastructureEncryption)\s*[:=]\s*false/i,
    message:
      "encryption at rest is explicitly disabled. Encryption at rest is mandatory.",
  },
];

const SAS_MARKER =
  /\b(sas_token|generate_sas|shared_access_signature|listServiceSas|azurerm_storage_account_sas|signedPermission)\b/i;
const SAS_EXPIRY = /\b(expiry|signedExpiry|end\s*=)/i;

const CMK =
  /customer_managed_key|key_vault_key_id|keyVaultProperties|keySource\s*:\s*'Microsoft\.Keyvault'/i;
const PRIVATE_ENDPOINT =
  /azurerm_private_endpoint|Microsoft\.Network\/privateEndpoints|privateEndpointConnections/i;
const SOFT_DELETE = /delete_retention_policy|deleteRetentionPolicy|blob_soft_delete/i;
const BACKUP = /backup|recovery_services|azurerm_backup_|commvault|retention/i;
const REDUNDANCY =
  /account_replication_type\s*=\s*"(LRS|ZRS|GRS|GZRS|RAGRS|RAGZRS)"|sku\s*[:=]\s*["']?Standard_(LRS|ZRS|GRS|GZRS)/i;

const CLASS_TAG =
  /["']?(data[_-]?classification|classification)["']?\s*[:=]\s*["']([^"']+)["']/i;

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
      } else if (endsWithAny(entry.name, EXTS)) {
        files.push(full);
      }
    }
  };
  walk(target);
  return files.sort();
}

/** First 1-based line index matching the pattern, or 0 when none matches. */
function firstMatchingLine(lines: string[], pattern: RegExp): number {
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return 0;
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

  for (const { rule, level, pattern, message } of LINE_RULES) {
    lines.forEach((ln, idx) => {
      const stripped = ln.replace(/^\s+/, "");
      if (stripped.startsWith("#") || stripped.startsWith("//")) return;
      if (pattern.test(ln)) emit(out, level, filePath, idx + 1, rule, message);
    });
  }

  if (!STORAGE_RESOURCE.test(blob)) return;

  // Data classification tag.
  const m = CLASS_TAG.exec(blob);
  if (!m) {
    emit(
      out,
      "ERROR",
      filePath,
      0,
      "classification/missing-tag",
      "no data-classification tag found on a storage/data resource. Classification " +
        "(Public, Internal, Confidential, Restricted) must be documented and tagged on storage " +
        "resources where possible.",
    );
  } else {
    const value = m[2].trim().toLowerCase();
    if (!VALID_CLASSIFICATIONS.includes(value)) {
      const lineNo = firstMatchingLine(lines, CLASS_TAG);
      emit(
        out,
        "ERROR",
        filePath,
        lineNo,
        "classification/invalid-value",
        `classification '${m[2]}' is not one of Public, Internal, Confidential, Restricted.`,
      );
    } else if (value === "confidential" || value === "restricted") {
      if (!PRIVATE_ENDPOINT.test(blob)) {
        emit(
          out,
          "ERROR",
          filePath,
          0,
          "classification/private-endpoint",
          `resource is classified ${m[2]} but no private endpoint is defined. Restricted and ` +
            "Confidential data require private endpoints.",
        );
      }
      if (!CMK.test(blob)) {
        emit(
          out,
          "WARN",
          filePath,
          0,
          "classification/cmk",
          `resource is classified ${m[2]} but no Key Vault managed key is configured. ` +
            "Key Vault managed keys are required where applicable; CMK is required for " +
            "high-sensitivity data.",
        );
      }
    }
  }

  // SAS tokens.
  if (SAS_MARKER.test(blob) && !SAS_EXPIRY.test(blob)) {
    const lineNo = firstMatchingLine(lines, SAS_MARKER);
    emit(
      out,
      "ERROR",
      filePath,
      lineNo,
      "identity/sas-no-expiry",
      "SAS token generated with no expiry set. SAS tokens require an expiry and least privilege.",
    );
  }

  // Advisory checks.
  if (!REDUNDANCY.test(blob)) {
    emit(
      out,
      "WARN",
      filePath,
      0,
      "redundancy/unspecified",
      "no replication/redundancy setting found. Choose LRS, ZRS, GRS or GZRS aligned to " +
        "criticality and RPO/RTO.",
    );
  }
  if (!BACKUP.test(blob)) {
    emit(
      out,
      "WARN",
      filePath,
      0,
      "backup/unspecified",
      "no backup or retention configuration found in this file. Backup must be enabled for all " +
        "critical data services; production standard is immutable and air-gapped, weekly full plus " +
        "daily differential/incremental, 30-day retention.",
    );
  }
  if (
    /azurerm_storage_account|Microsoft\.Storage\/storageAccounts/i.test(blob) &&
    !SOFT_DELETE.test(blob)
  ) {
    emit(
      out,
      "INFO",
      filePath,
      0,
      "backup/blob-soft-delete",
      "blob soft delete not configured; it is recommended by the standard.",
    );
  }
}

function main(argv: string[]): number {
  if (argv.length !== 2) {
    process.stderr.write("usage: check-storage.ts <file|directory>\n");
    return 2;
  }
  const target = argv[1];
  if (tryStat(target) === undefined) {
    process.stderr.write(`error: path not found: ${target}\n`);
    return 2;
  }
  const files = collect(target);
  if (files.length === 0) {
    process.stderr.write(`error: no .tf/.bicep/.json files found under ${target}\n`);
    return 2;
  }
  const out: string[] = [];
  for (const f of files) checkFile(f, out);
  for (const line of out) process.stdout.write(line + "\n");
  return out.some((l) => l.startsWith("ERROR|")) ? 1 : 0;
}

process.exitCode = main(process.argv.slice(1));

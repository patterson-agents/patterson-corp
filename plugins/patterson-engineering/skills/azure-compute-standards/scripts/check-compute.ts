#!/usr/bin/env node
/**
 * check-compute.ts -- Patterson Azure Compute Standards validator.
 *
 * Usage:  node check-compute.ts <path-to-iac-file-or-directory>
 *
 * Scans Terraform (.tf), Bicep (.bicep), ARM (.json) and Kubernetes manifests (.yaml/.yml)
 * for compute-standard violations. Regex-based, no third-party dependencies, no build step:
 * runs on plain Node (>= 22.18) via native TypeScript type stripping.
 *
 * Output: "LEVEL|file|line|rule|message"
 * Exit:   0 = pass (no ERROR findings)   1 = ERROR findings present   2 = could not evaluate
 *
 * Standard: Azure Compute Standards
 * https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=937eb90b3b650f107f43b50236e45a16
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const EXTS = [".tf", ".tfvars", ".bicep", ".json", ".yaml", ".yml"];
const SKIP_DIRS = new Set([".git", "node_modules", ".terraform", "vendor", ".venv"]);

interface LineRule {
  rule: string;
  level: string;
  pattern: RegExp;
  message: string;
}

const LINE_RULES: LineRule[] = [
  {
    rule: "network/public-ip",
    level: "ERROR",
    pattern:
      /resource\s+"azurerm_public_ip"|Microsoft\.Network\/publicIPAddresses|public_ip_address_id\s*=\s*(?!null)|publicIPAddress\s*:/i,
    message:
      "public IP resource or association found. VMs and VMSS must never have public IPs.",
  },
  {
    rule: "network/accelerated-networking",
    level: "WARN",
    pattern:
      /enable_accelerated_networking\s*=\s*false|accelerated_networking\s*=\s*false|enableAcceleratedNetworking\s*:\s*false/i,
    message: "Accelerated Networking is disabled; the standard requires it enabled.",
  },
  {
    rule: "compute/aci",
    level: "ERROR",
    pattern: /azurerm_container_group|Microsoft\.ContainerInstance/i,
    message:
      "Azure Container Instances detected. ACI is not used in the Patterson environment at all.",
  },
  {
    rule: "aks/nodeport",
    level: "ERROR",
    pattern: /type\s*:\s*NodePort|"type"\s*:\s*"NodePort"/i,
    message:
      "Kubernetes Service of type NodePort. AKS must use an internal load balancer only; NodePort is prohibited.",
  },
  {
    rule: "aks/local-accounts",
    level: "ERROR",
    pattern: /local_account_disabled\s*=\s*false|disableLocalAccounts\s*:\s*false/i,
    message: "AKS local accounts are enabled. Local accounts must be disabled.",
  },
  {
    rule: "aks/azure-rbac",
    level: "ERROR",
    pattern: /azure_rbac_enabled\s*=\s*false|enableAzureRBAC\s*:\s*false/i,
    message: "AKS Azure RBAC is disabled. Azure RBAC must be enabled.",
  },
  {
    rule: "aks/automount-token",
    level: "ERROR",
    pattern: /automountServiceAccountToken\s*:\s*true/i,
    message:
      "automountServiceAccountToken is true. Automounting API credentials must be disabled.",
  },
  {
    rule: "aks/privileged",
    level: "ERROR",
    pattern: /privileged\s*[:=]\s*true/i,
    message:
      "privileged container/image detected. Images and base layers must not run as privileged.",
  },
  {
    rule: "aks/cap-sys-admin",
    level: "ERROR",
    pattern: /CAP_SYS_ADMIN|SYS_ADMIN/i,
    message: "CAP_SYS_ADMIN capability requested. Prohibited on AKS.",
  },
  {
    rule: "aks/readonly-rootfs",
    level: "ERROR",
    pattern: /readOnlyRootFilesystem\s*:\s*false/i,
    message:
      "readOnlyRootFilesystem is false. AKS workloads require an immutable read-only root filesystem.",
  },
  {
    rule: "aks/default-namespace",
    level: "ERROR",
    pattern: /namespace\s*:\s*["']?default["']?\s*$/i,
    message:
      "workload targets the 'default' namespace. Use of the default namespace is prohibited.",
  },
  {
    rule: "appservice/wildcard-cors",
    level: "ERROR",
    pattern:
      /allowed_origins\s*=\s*\[\s*"\*"|allowedOrigins\s*:\s*\[\s*'\*'|"allowedOrigins"\s*:\s*\[\s*"\*"/i,
    message: "wildcard ('*') CORS origin. Wildcard CORS is prohibited.",
  },
  {
    rule: "tls/below-1-2",
    level: "ERROR",
    pattern: /min(imum)?_?tls_?version\s*[:=]\s*["']?(TLS)?1[._](0|1)["']?/i,
    message: "minimum TLS version is below 1.2. TLS 1.2 is the minimum.",
  },
  {
    rule: "appservice/ftp",
    level: "ERROR",
    pattern:
      /ftps_state\s*=\s*"(AllAllowed|FtpsOnly)"|ftpsState\s*:\s*'(AllAllowed|FtpsOnly)'/i,
    message:
      "SFTP/FTPS is enabled on the App Service. SFTP and FTPS must be disabled; HTTPS TCP/443 only.",
  },
  {
    rule: "appservice/https-only",
    level: "ERROR",
    pattern: /https_only\s*=\s*false|httpsOnly\s*:\s*false/i,
    message: "HTTPS-only is disabled. App Services must serve HTTPS on TCP/443 only.",
  },
  {
    rule: "appservice/remote-debugging",
    level: "ERROR",
    pattern: /remote_debugging_enabled\s*=\s*true|remoteDebuggingEnabled\s*:\s*true/i,
    message: "remote debugging is enabled. It must be off.",
  },
  {
    rule: "appservice/basic-auth",
    level: "ERROR",
    pattern:
      /(ftp|scm)_publish_basic_authentication_enabled\s*=\s*true|allow(Scm)?BasicAuth\w*\s*:\s*true/i,
    message: "basic authentication is enabled. Basic auth must be off.",
  },
  {
    rule: "appservice/32-bit",
    level: "ERROR",
    pattern: /use_32_bit_worker(_process)?\s*=\s*true|use32BitWorkerProcess\s*:\s*true/i,
    message: "32-bit worker process. App Services must be 64-bit only.",
  },
  {
    rule: "appservice/http2",
    level: "WARN",
    pattern: /http2_enabled\s*=\s*false|http20Enabled\s*:\s*false/i,
    message: "HTTP 2.0 is disabled. The standard requires HTTP 2.0.",
  },
  {
    rule: "aca/public-endpoint",
    level: "ERROR",
    pattern: /(ingress\s*\{[^}]*external_enabled\s*=\s*true)|external\s*:\s*true/i,
    message:
      "Container App ingress is external. ACA must have no public endpoints and no public IPs.",
  },
  {
    rule: "acr/public",
    level: "ERROR",
    pattern: /(azurerm_container_registry[\s\S]{0,400}?public_network_access_enabled\s*=\s*true)/i,
    message:
      "Azure Container Registry allows public network access. ACR must be private, with a private endpoint " +
      "for all communication.",
  },
];

// VM-block security settings that must be present and true.
const VM_REQUIRED: [string, string, string][] = [
  ["vm/secure-boot", "secure_boot_enabled\\s*=\\s*true|secureBootEnabled\\s*:\\s*true", "Secure Boot"],
  ["vm/vtpm", "vtpm_enabled\\s*=\\s*true|vTpmEnabled\\s*:\\s*true", "vTPM"],
  [
    "vm/encryption-at-host",
    "encryption_at_host_enabled\\s*=\\s*true|encryptionAtHost\\s*:\\s*true",
    "encryption at host",
  ],
  [
    "vm/managed-identity",
    "identity\\s*\\{[^}]*SystemAssigned|type\\s*:\\s*'SystemAssigned'",
    "system-assigned managed identity",
  ],
];

const VM_RESOURCE =
  /resource\s+"azurerm_(linux|windows)_virtual_machine(_scale_set)?"|Microsoft\.Compute\/virtualMachine(ScaleSet)?s/i;
const SUBNET_RESOURCE =
  /resource\s+"azurerm_subnet"|Microsoft\.Network\/virtualNetworks\/subnets/i;
const NSG_ASSOC =
  /azurerm_subnet_network_security_group_association|network_security_group|networkSecurityGroup/i;

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
    // Patterns that deliberately span lines are matched against the whole blob.
    if (pattern.flags.includes("s") || pattern.source.includes("[\\s\\S]")) {
      if (pattern.test(blob)) emit(out, level, filePath, 0, rule, message);
      continue;
    }
    lines.forEach((ln, idx) => {
      const stripped = ln.replace(/^\s+/, "");
      if (stripped.startsWith("#") || stripped.startsWith("//")) return;
      if (pattern.test(ln)) emit(out, level, filePath, idx + 1, rule, message);
    });
  }

  if (VM_RESOURCE.test(blob)) {
    for (const [rule, pattern, label] of VM_REQUIRED) {
      if (!new RegExp(pattern, "is").test(blob)) {
        emit(
          out,
          "ERROR",
          filePath,
          0,
          rule,
          `VM/VMSS defined but ${label} is not enabled. All VMs must be Gen 2 with Secure Boot, ` +
            "Integrity Monitoring, vTPM and encryption at host, plus a system-assigned " +
            "managed identity.",
        );
      }
    }
    if (!/V2|Gen2|generation\s*=\s*["']?V2/i.test(blob)) {
      emit(
        out,
        "WARN",
        filePath,
        0,
        "vm/generation",
        "could not confirm Generation 2. VMs must be Gen 2.",
      );
    }
    if (!/integrity_?monitoring/i.test(blob)) {
      emit(
        out,
        "WARN",
        filePath,
        0,
        "vm/integrity-monitoring",
        "Integrity Monitoring not found; it must be enabled on all VMs.",
      );
    }
  }

  if (SUBNET_RESOURCE.test(blob) && !NSG_ASSOC.test(blob)) {
    emit(
      out,
      "ERROR",
      filePath,
      0,
      "network/missing-nsg",
      "a subnet is defined with no NSG association in this file. Never deploy into a subnet " +
        "without an NSG. (If the NSG is associated in a different file, verify manually.)",
    );
  }
}

function main(argv: string[]): number {
  if (argv.length !== 2) {
    process.stderr.write("usage: check-compute.ts <file|directory>\n");
    return 2;
  }
  const target = argv[1];
  if (tryStat(target) === undefined) {
    process.stderr.write(`error: path not found: ${target}\n`);
    return 2;
  }
  const files = collect(target);
  if (files.length === 0) {
    process.stderr.write(`error: no .tf/.bicep/.json/.yaml files found under ${target}\n`);
    return 2;
  }
  const out: string[] = [];
  for (const f of files) checkFile(f, out);
  for (const line of out) process.stdout.write(line + "\n");
  return out.some((l) => l.startsWith("ERROR|")) ? 1 : 0;
}

process.exitCode = main(process.argv.slice(1));

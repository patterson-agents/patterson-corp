---
name: azure-compute-standards
description: Applies the Patterson Azure Compute Standards to VMs, VMSS, AVD, Windows 365, AKS, Container Apps, Container Instances, ACR and App Service Plans. Use when writing or reviewing Terraform, Bicep or Kubernetes manifests for compute, picking a VM size or VDI profile, hardening a VM or AKS cluster, configuring an App Service, Function or Logic App — and when asked "what VM size should I use", "can this VM have a public IP", "can we use ACI", "is this AKS cluster compliant", "what TLS version", or "which base image is allowed".
---

# Azure Compute Standards

VMs, VMSS, AVD, Windows 365, Container Apps, Container Instances, AKS and App Service Plans
(Logic Apps, App Services, Functions).

Authoritative source: ServiceNow IT Standards & Guidelines, **Azure Compute Standards**
(`sys_kb_id=937eb90b3b650f107f43b50236e45a16`). Owner: Infra CloudOps.

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. Where the standard is
> silent, say `[TBD]`.

## Global rules

- **Monthly patch cycle.**
- **Scan vendor images before entry.**
- **Images and base layers must NOT run as privileged.**

## Images

- Security-approved images only.
- **Unmodified Microsoft marketplace images qualify** automatically.
- **Custom images** need periodic security review, plus **monthly patch and recapture**.

> [!WARNING]
> `[TBD: the standards do not enumerate an approved *container* base image or registry list. The
> plugin hook's allowlist at hooks/approved-base-images.txt encodes only the Microsoft-image rule
> plus placeholders — confirm the internal registry with Infra CloudOps and AppSec.]`

## Virtual machines

### Sizing — cite the table, do not improvise

| Workload class | Series |
|---|---|
| Generally Optimized | **DDSv5** |
| Memory Optimized | **EDsv5** |
| Compute Optimized | **Fsv2** |

T-shirt sizes run **xsmall … xxlarge** within each series. Pick the class first, then the size.

### VDI profiles

| Profile | vCPU | Memory | Storage |
|---|---|---|---|
| Light | 2 | 8 GiB | 32 GB |
| Medium | 4 | 16 GiB | 32 GB |
| Heavy | 8 | 32 GiB | 32 GB |

### VM security — all of these, every VM

Generation 2 · Secure Boot · Integrity Monitoring · vTPM · encryption at host.

### VM networking

- **No public IPs. Ever.**
- **Accelerated Networking on.**
- **Never deploy into a subnet without an NSG.**

### VM identity

**System-assigned managed identity on all VMs and VMSS.**

## AKS

Azure RBAC enabled · local accounts disabled · ephemeral disks · labeled node pools · no user
workloads on system node pools · disable automounting API credentials · no `CAP_SYS_ADMIN` ·
immutable read-only root filesystem · no `default` namespace · **no database deployments** · no
public IPs on node pools · **internal load balancer only** · **no NodePort** · workload identity for
Azure access.

## Container Apps (ACA)

Inside ACA Environments · no public endpoints · no public IPs · KEDA event-driven scaling.

## Container Instances (ACI)

> [!CAUTION]
> **Not used in the environment at all.** Any ACI resource is a violation — propose Container Apps
> or AKS instead.

## ACR

Private only. **Private endpoint for all communication.**

## App Service / Functions / Logic Apps

- App Service **Environments**; horizontal scaling; **≥2 instances in production**.
- Disable **SFTP and FTPS**. **HTTPS on TCP/443 only.**
- Remote debugging **off**. **HTTP 2.0** on. **TLS 1.2 minimum.**
- SKU: **I1/I2/I3 in production, I1 in non-production.**
- **No wildcard CORS.** **64-bit only.** **Basic auth off.**
- Custom domains for public workloads. Managed identity where possible.
- **Remove unused API endpoints.**
- **Logic Apps in production: single tenant only.**

## Validator

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/azure-compute-standards/scripts/check-compute.ts" <path>
```

Takes a file or directory of `.tf`, `.bicep`, `.json`, `.yaml`, `.yml`. Prints
`LEVEL|file|line|rule|message`.

| Exit code | Meaning |
|---|---|
| `0` | No errors |
| `1` | `ERROR` findings |
| `2` | Could not evaluate |

Only `ERROR` affects the exit code.

**What it catches:** public IP resources and associations; a subnet with no NSG association *in the
same file*; ACI resources; `NodePort` services; AKS local accounts or Azure RBAC disabled;
`automountServiceAccountToken: true`; `privileged: true`; `CAP_SYS_ADMIN`;
`readOnlyRootFilesystem: false`; the `default` namespace; wildcard CORS; TLS below 1.2; FTPS/SFTP
enabled; `https_only = false`; remote debugging; basic auth; 32-bit workers; HTTP/2 disabled;
external ACA ingress; public ACR; and, when a VM or VMSS is declared, missing Secure Boot, vTPM,
encryption at host or system-assigned managed identity.

**What it does NOT catch.** It is a regex scanner, not an IaC evaluator, so: it cannot resolve
variables, locals, modules or `for_each`, so a violation expressed as
`public_ip_address_id = var.pip` reads as a violation and one hidden behind a module does not read
at all; it cannot see an NSG associated in a *different* file, so `network/missing-nsg` is reported
per-file and needs human confirmation; it cannot check VM **size** against the T-shirt table, VDI
profile conformance, instance **counts**, App Service **SKU tier**, monthly patch cadence, image
provenance or review status, ephemeral disks, node pool labels, whether user workloads land on
system node pools, whether a database is deployed into AKS, or whether unused API endpoints were
removed. It cannot evaluate deployed Azure state at all — only files.

> [!CAUTION]
> Treat a clean run as "nothing obvious found", not as "compliant".

Fixtures and a test harness: [`tests/run-tests.sh`](tests/run-tests.sh).

## Reference material

| File | Contents |
|---|---|
| [`references/vm-standards.md`](references/vm-standards.md) | Sizing table, VDI profiles, security, networking, identity |
| [`references/aks-and-containers.md`](references/aks-and-containers.md) | AKS, ACA, ACI, ACR |
| [`references/app-service-standards.md`](references/app-service-standards.md) | App Service, Functions, Logic Apps |
| [`references/images-and-patching.md`](references/images-and-patching.md) | Global rules, image approval, patch cycle |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |

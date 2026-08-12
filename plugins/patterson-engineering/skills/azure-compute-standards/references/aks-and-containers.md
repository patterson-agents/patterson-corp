# AKS, Container Apps, Container Instances and ACR

Source: Azure Compute Standards, `sys_kb_id=937eb90b3b650f107f43b50236e45a16`.

---

## Table of contents

- [AKS](#aks)
- [Container Apps (ACA)](#container-apps-aca)
- [Container Instances (ACI)](#container-instances-aci)
- [Azure Container Registry (ACR)](#azure-container-registry-acr)

## AKS

| # | Requirement |
|---|---|
| 1 | Azure RBAC **enabled** |
| 2 | Local accounts **disabled** |
| 3 | **Ephemeral disks** |
| 4 | **Labeled node pools** |
| 5 | **No user workloads on system node pools** |
| 6 | **Disable automounting API credentials** (`automountServiceAccountToken: false`) |
| 7 | **No `CAP_SYS_ADMIN`** |
| 8 | **Immutable read-only root filesystem** |
| 9 | **No `default` namespace** |
| 10 | **No database deployments** |
| 11 | **No public IPs on node pools** |
| 12 | **Internal load balancer only** |
| 13 | **No NodePort** |
| 14 | **Workload identity** for Azure access |

> [!TIP]
> Rule 10 is easy to miss: databases do not run in AKS. Route a request to deploy PostgreSQL, SQL
> Server or Redis into the cluster to the managed Azure data service instead, and apply the Storage
> & Data Standards to it.

Rule 14 aligns with the CI/CD standard's federated-credentials-only rule: no secrets in the cluster
to reach Azure.

`[TBD: the standard does not name the required node pool labels or their values.]`
`[TBD: the standard does not state a Kubernetes version floor or an upgrade cadence.]`

## Container Apps (ACA)

- Deployed **inside ACA Environments**.
- **No public endpoints.**
- **No public IPs.**
- **KEDA** event-driven scaling.

`[TBD: the standard does not state minimum replica counts for production ACA, unlike App Service
where ≥2 instances is required.]`

## Container Instances (ACI)

> [!CAUTION]
> **ACI is not used in the environment at all.** This is absolute. There is no approval path stated.
> If a design uses ACI, the finding is not "needs approval" — it is "not used here".

Propose Container Apps (event-driven or HTTP workloads) or AKS (orchestrated workloads).

## Azure Container Registry (ACR)

- **Private only.**
- **Private endpoint for all communication.**

`public_network_access_enabled = true` on an ACR is a violation.

`[TBD: the standard does not state a required ACR SKU, retention policy, or image signing
requirement.]`

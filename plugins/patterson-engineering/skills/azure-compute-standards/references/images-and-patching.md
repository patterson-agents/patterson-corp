# Images, patching and privilege

Source: Azure Compute Standards, `sys_kb_id=937eb90b3b650f107f43b50236e45a16`.

---

## Global rules

1. **Monthly patch cycle.**
2. **Scan vendor images before entry.**
3. **Images and base layers must NOT run as privileged.**

Rule 3 applies to container base layers as well as VM images. In Kubernetes terms:
`securityContext.privileged: true` is a violation, and it compounds with the AKS rules on
`CAP_SYS_ADMIN` and read-only root filesystems.

## Image approval

| Image type | Requirement |
|---|---|
| Microsoft marketplace, **unmodified** | Qualifies as security-approved automatically |
| Microsoft marketplace, **modified** | Becomes a custom image — see below |
| Custom image | **Periodic security review** plus **monthly patch and recapture** |
| Any vendor image | **Scanned before entry** |

> [!NOTE]
> "Recapture" means the image is rebuilt and re-published monthly, not merely patched in place on
> running instances.

## Container base images

> [!WARNING]
> `[TBD: the standards do not enumerate an approved container base image or registry list. The
> Compute standard's image rules are written for VM images and the marketplace; the CI/CD standard
> requires "approved base images" without defining the list.]`

The plugin's PreToolUse hook enforces an allowlist at `hooks/approved-base-images.txt`, which
currently contains only:

| Entry | Why |
|---|---|
| `mcr.microsoft.com/` | The narrowest reading of "unmodified Microsoft images qualify" |
| `scratch` | An empty base layer |
| commented placeholders | For the internal registry, once it is confirmed |

Confirm the real list with Infra CloudOps and AppSec, then edit that file. Until then, the hook will
block common public images such as `node:24`. The off-switch is `PATTERSON_ENGINEERING_HOOKS=off`.

## Scanning

Container scanning uses **Trivy or Checkmarx** (CI/CD Pipeline Standards). Trivy is approved with no
approval needed; the Approved Software standard notes "Checkmarx will replace this tool".
Vulnerability scanning across the estate is **Qualys**, running nightly and creating ServiceNow
tickets (Monitoring & Alerting standard).

`[TBD: the standard does not state a severity threshold that blocks an image from entry.]`

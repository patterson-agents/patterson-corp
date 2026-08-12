# Build, artifacts and deployment

Source: CI/CD Pipeline Standards, `sys_kb_id=c70e79833b650f107f43b50236e45a7d`.

---

## Build

| Rule | Detail |
|---|---|
| Build model | **One build, one or more artifacts** |
| Promotion | Build the code **once** and promote **the same artifact** through every environment |
| Testing | **Unit testing** is required |
| Storage | Artifacts go to a **centralized artifact repository** |

> [!IMPORTANT]
> Rebuilding per environment is a violation, even if the source commit is identical.

`[TBD: the standard does not name the centralized artifact repository product or location. JFrog
Artifactory appears in the Approved Software standard as approval-required 3rd-party package
security, which is not the same statement.]`

## Deployment

| Control | Requirement |
|---|---|
| Strategies | **blue-green**, **canary**, **rolling** |
| Rollback | **Automated rollback is required** |
| Post-deploy | **Smoke test** after every deployment |

`[TBD: the standard does not state which strategy applies to which environment tier, nor the
rollback trigger conditions or the required smoke-test coverage.]`

## Interaction with the Azure Environment Standards

Promotion runs Sandbox → Dev → Test → Stage → Production. Change control tightens at each step
(Minimal, Minimal, Moderate, High, Strict) and **playbooks are required for Production only**.
Production and non-production workloads must never share a subscription. See the
`azure-environment-standards` skill.

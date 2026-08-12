# Version control, PR policy and pipeline-as-code

Source: CI/CD Pipeline Standards, `sys_kb_id=c70e79833b650f107f43b50236e45a7d`.

---

## Version control

| Rule | Detail |
|---|---|
| Permitted platforms | **Azure DevOps** or **GitHub** |
| Organisation model | **One organisation for all teams** |
| Team separation | With *teams* inside the single org — not separate orgs or projects |

The standard explicitly rules out separate orgs or separate projects per team.

> [!NOTE]
> GitHub is approved with no approval needed, but **enterprise managed org only**, and **public
> repositories require approval** (Approved Software standard). Azure DevOps is approved but
> **requires approval** before use (Approved Software standard).

## Pull request policy

- **2 approvers** required.
- Required status checks on the PR:
  1. validation pipeline
  2. container scanning
  3. SAST
  4. SCA
  5. DAST

`[TBD: the standard does not state whether the 2 approvers may include the author, whether code
owners are required, or whether stale-review dismissal is mandatory.]`

## Pipeline as code

| Rule | Detail |
|---|---|
| Format | **yaml** |
| Location | **In the application repository** |
| Permitted split | The **GitOps pipeline may live in a different repository** — the only one allowed |
| Templates | **Standardized templates** must be used |

`[TBD: the standard does not name the location, version or contents of the standardized
templates.]`

## Review of this standard

> [!WARNING]
> `[TBD: no review cadence is stated for the CI/CD Pipeline Standards. The Monitoring & Alerting
> standard states an annual cadence for itself; do not assume the same applies here.]`

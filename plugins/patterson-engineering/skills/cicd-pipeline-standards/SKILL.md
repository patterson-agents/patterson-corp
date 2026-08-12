---
name: cicd-pipeline-standards
description: Applies the Patterson CI/CD Pipeline Standards to build, test and deployment pipelines. Use when writing or reviewing an azure-pipelines.yml, a GitHub Actions workflow, a branch or PR policy, a service connection, a deployment strategy, or a release process — and when asked "does this pipeline meet our standards", "how many approvers do we need", "which scans are required in CI", "can I use a service principal secret", or "how do we promote a build to production".
---

# CI/CD Pipeline Standards

Build, test and deployment pipeline requirements, applied in order when reviewing or authoring a
pipeline.

Authoritative source: ServiceNow IT Standards & Guidelines, **CI/CD Pipeline Standards**
(`sys_kb_id=c70e79833b650f107f43b50236e45a7d`). Owner: Infra CloudOps.

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. If the standard does not
> cover something, say so and mark it `[TBD]`.

## Decision rules

### 1. Version control

- Use **Azure DevOps or GitHub**. Nothing else.
- **ONE organisation for all teams.** Do not create a separate org or project per team. Separate
  teams with *teams*, not orgs.

### 2. Pull request policy

- **2 approvers.** Not 1. Not "the author plus a bot".
- Required checks, all of them: validation pipeline, container scanning, SAST, SCA, DAST.

### 3. Pipeline as code

- The pipeline is **yaml**, **in the application repo**.
- The **GitOps** pipeline may live in a different repo. That is the only allowed split.
- Use the standardized templates.

### 4. Required CI scans

Every pipeline must run all seven:

| Scan | Tool constraint |
|---|---|
| SAST | Checkmarx (approval required) |
| SCA | Checkmarx (approval required) |
| DAST | `[TBD: no specific DAST tool is named in the CI/CD Pipeline Standards]` |
| Secret scanning | GitLeaks is approved with no approval needed |
| API scanning | Checkmarx (approval required) |
| Container scanning | **Trivy or Checkmarx** — no other scanner |
| IaC scanning | **Checkmarx** |

Approved base images are also required. See `azure-compute-standards` for the image rules.

### 5. Service connections

- **Federated credentials only.** The only exceptions the standard names are **b2c** and **vendor
  integration**.
- **Different credentials per environment.** One connection per environment, never shared.
- **Least privilege.** Broad `Contributor` or `Owner` on a subscription is a violation.
- A **production** service connection requires approval.

> [!CAUTION]
> Reject on sight: `ServicePrincipalKey`, `authenticationScheme: ServicePrincipal` with a secret,
> `ARM_CLIENT_SECRET`, `azure/login` with a full `creds` JSON secret.

### 6. Build and artifacts

- **One build, one or more artifacts.** Build once; promote *the same artifact* through every
  environment. A pipeline that rebuilds per environment violates this.
- Unit testing is required.
- Artifacts go to the **centralized artifact repository**.

### 7. Deployment

- Approved strategies: **blue-green, canary, rolling**. Nothing else.
- **Automated rollback is required.**
- **Smoke test after every deploy.**

### 8. Secrets

- Never in code.
- Use a dedicated secrets manager: **Vault or a cloud-native secrets manager**.

## Validator

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/cicd-pipeline-standards/scripts/check-pipeline.ts" <path>
```

Takes a pipeline YAML file or a directory. Prints `LEVEL|file|line|rule|message`.

| Exit code | Meaning |
|---|---|
| `0` | No errors |
| `1` | `ERROR` findings |
| `2` | Could not evaluate |

`ERROR` sets the exit code; `WARN` and `INFO` are advisory and do not.

**What it catches:** missing scan stages (by keyword); a container scanner that is neither Trivy nor
Checkmarx; an approver count below 2 where one is declared in the file; secret-based service
connection patterns; hardcoded credential literals and connection strings; more than one build step;
a missing unit-test step; a missing deployment strategy, rollback or smoke test.

**What it does NOT catch.** It is a regex scanner over raw lines, not a YAML parser, so: it cannot
see branch policies configured in the Azure DevOps or GitHub UI rather than in a file — the
2-approver rule is *usually* enforced there and the validator emits a WARN saying it could not
verify it; it cannot follow `template:` includes or reusable workflows, so a scan that runs in an
included template reads as missing; it cannot tell whether a scan actually *gates* the pipeline or
merely runs with `continueOnError`; it cannot check least privilege on a service connection,
per-environment credential separation, whether the artifact repository is the centralized one, or
whether the same artifact is genuinely promoted rather than rebuilt with the same name.

> [!CAUTION]
> Treat a clean run as "nothing obvious found", not as "compliant".

Fixtures and a test harness: [`tests/run-tests.sh`](tests/run-tests.sh).

## Reference material

| File | Contents |
|---|---|
| [`references/version-control-and-pr-policy.md`](references/version-control-and-pr-policy.md) | Org model, branch and PR policy, pipeline-as-code |
| [`references/required-scans.md`](references/required-scans.md) | The seven scans, tools, and their owners |
| [`references/service-connections-and-secrets.md`](references/service-connections-and-secrets.md) | Federated credentials, exceptions, secrets management |
| [`references/build-and-deploy.md`](references/build-and-deploy.md) | Build-once/promote, artifacts, deployment strategies, rollback |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |

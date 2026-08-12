<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../docs/assets/patterson-logo-white.svg">
  <img src="../../docs/assets/patterson-logo-navy.svg" alt="Patterson Companies" width="260">
</picture>

# patterson-engineering

**Trusted Expertise. Unrivaled Support.** — the six Patterson IT Standards & Guidelines, put in front
of an agent while it writes code and applied to the code afterwards.

![skills](https://img.shields.io/badge/skills-6-00A8E1?labelColor=003767)
![validators](https://img.shields.io/badge/validators-4-003767)
![size](https://img.shields.io/badge/size-581_KB-147EC2)
![runtime](https://img.shields.io/badge/scripts-TypeScript_·_no_build_step-00817D)
![deps](https://img.shields.io/badge/dependencies-none-58585B)

</div>

---

## Table of contents

- [What this is](#what-this-is)
- [The six standards covered](#the-six-standards-covered)
- [What ships](#what-ships)
- [Skills](#skills)
- [Install](#install)
- [Running the validators](#running-the-validators)
- [The hook, and how to turn it off](#the-hook-and-how-to-turn-it-off)
- [What this plugin does NOT do](#what-this-plugin-does-not-do)
- [Layout](#layout)

## What this is

A Claude Code plugin that puts the six Patterson IT Standards & Guidelines in front of an agent
while it writes code, and audits code against them afterwards.

Every requirement in this plugin traces to a ServiceNow knowledge base article. Nothing was
inferred.

> [!IMPORTANT]
> Where a standard is silent, the plugin says `[TBD: not specified in the <name> standard]` instead
> of filling the gap. A `[TBD]` is a question for the standard owners, not a defect in the plugin.

## The six standards covered

| Skill | Standard | ServiceNow `sys_kb_id` |
|---|---|---|
| [`cicd-pipeline-standards`](skills/cicd-pipeline-standards/) | CI/CD Pipeline Standards | `c70e79833b650f107f43b50236e45a7d` |
| [`approved-software-check`](skills/approved-software-check/) | Approved Software | `9af6a1812b6587941f16fc8bee91bf3c` |
| [`azure-environment-standards`](skills/azure-environment-standards/) | Azure Environment Standards | `a507920d2b25c7941f16fc8bee91bfc4` |
| [`azure-compute-standards`](skills/azure-compute-standards/) | Azure Compute Standards | `937eb90b3b650f107f43b50236e45a16` |
| [`storage-data-standards`](skills/storage-data-standards/) | Storage & Data Standards | `fdc09a4d93548f908037f8bd1dba10ed` |
| [`monitoring-alerting-standards`](skills/monitoring-alerting-standards/) | Monitoring & Alerting | `972394c02b80835ce9affd3fc891bf04` |

Articles resolve at
`https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=<sys_kb_id>`.
KB owner: Infra CloudOps.

## What ships

| Component | Count | What it is |
|---|---|---|
| Skills | **6** | A lean `SKILL.md` with the decision rules an agent needs immediately, a `references/` directory with the full clause text, and `_SOURCES.md` / `REFERENCES.md` recording provenance. |
| Validator scripts | **4** | TypeScript run directly by `node` (>= 22.18, Patterson standardises on node:24) via native type stripping. Node builtins only — no build step, no `package.json`, no dependencies. |
| Agent | **1** | [`standards-compliance-reviewer`](agents/standards-compliance-reviewer.md) audits a repo or a diff against all six standards and produces a severity-ranked report with a citation on every finding. |
| Hook | **1** | A PreToolUse hook that blocks two unambiguous violations at write time. |

## Skills

| Skill | What it covers | Validator |
|---|---|---|
| [`cicd-pipeline-standards`](skills/cicd-pipeline-standards/) | Version control and PR policy, pipeline-as-code, the seven required CI scans, service connections, build-once/promote, deployment strategies, secrets. | [`check-pipeline.ts`](skills/cicd-pipeline-standards/scripts/check-pipeline.ts) |
| [`approved-software-check`](skills/approved-software-check/) | Developer and observability tooling: approved, approval-required, or not listed — with the owning team. | [`check-tooling.ts`](skills/approved-software-check/scripts/check-tooling.ts) |
| [`azure-environment-standards`](skills/azure-environment-standards/) | The Sandbox / Dev / Test / Stage / Production tiers, subscription isolation, data placement, governance, the four owner roles. | None — [by design](skills/azure-environment-standards/scripts/README.md) |
| [`azure-compute-standards`](skills/azure-compute-standards/) | VMs, VMSS, AVD, Windows 365, AKS, Container Apps, ACI, ACR, App Service Plans, images and patching. | [`check-compute.ts`](skills/azure-compute-standards/scripts/check-compute.ts) |
| [`storage-data-standards`](skills/storage-data-standards/) | Data classification, encryption, identity, backup, redundancy, disaster recovery, the storage exception path. | [`check-storage.ts`](skills/storage-data-standards/scripts/check-storage.ts) |
| [`monitoring-alerting-standards`](skills/monitoring-alerting-standards/) | The eight monitoring layers, PagerDuty routing, MTTD/MTTA/MTTR, DORA metrics, tooling, in-scope systems. | None — [by design](skills/monitoring-alerting-standards/scripts/README.md) |

`azure-environment-standards` and `monitoring-alerting-standards` deliberately have no validator.
Their requirements — subscription isolation, change control, PagerDuty escalation policies — are not
visible in a repository. See the `scripts/README.md` in each.

## Install

Add the marketplace and enable the plugin:

```sh
claude plugin marketplace add patterson-agents/patterson-corp
claude plugin install patterson-engineering@patterson-corp
```

Or, for a local checkout, add to `.claude/settings.json` in your project:

```json
{
  "extraKnownMarketplaces": {
    "patterson-corp": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-corp" }
    }
  },
  "enabledPlugins": { "patterson-engineering@patterson-corp": true }
}
```

Verify:

```sh
claude plugin validate .
```

> [!NOTE]
> VS Code reads the same field names from `.claude/settings.json`, so one settings block serves
> Claude Code and VS Code / Copilot. VS Code loads portable **skills** only — the agent and the hook
> are Claude Code specific.

## Running the validators

Each takes a path and prints `LEVEL|file|line|rule|message`.

| Contract | Value |
|---|---|
| Argument | a file or directory to check |
| Exit `0` | no `ERROR` findings |
| Exit `1` | `ERROR` findings |
| Exit `2` | could not evaluate |
| Advisory | `WARN` and `INFO` findings do not change the exit code |

```sh
node skills/cicd-pipeline-standards/scripts/check-pipeline.ts  .github/workflows/
node skills/azure-compute-standards/scripts/check-compute.ts   infra/
node skills/storage-data-standards/scripts/check-storage.ts    infra/
node skills/approved-software-check/scripts/check-tooling.ts   trivy
```

Each validator ships fixtures and a POSIX-sh test harness:

```sh
sh skills/cicd-pipeline-standards/tests/run-tests.sh
sh skills/azure-compute-standards/tests/run-tests.sh
sh skills/storage-data-standards/tests/run-tests.sh
sh skills/approved-software-check/tests/run-tests.sh
sh hooks/tests/run-tests.sh
```

## The hook, and how to turn it off

[`hooks/hooks.json`](hooks/hooks.json) registers a **PreToolUse** hook on `Write|Edit`. It blocks
exactly two things:

1. **A high-confidence hardcoded secret.** AWS access key IDs, GitHub PATs, Slack tokens, npm
   tokens, Google API keys, private key blocks, Azure Storage and Service Bus connection strings
   with embedded keys, and database connection strings with an embedded password.

   Ignored: lines containing template references (`${...}`, `$(...)`, `{{...}}`) or placeholder
   words (`example`, `placeholder`, `changeme`, `<your-key>`, …), and anything written under
   `tests/`, `fixtures/`, `examples/`, `docs/`, or into a `.md`/`.txt` file.

2. **A Dockerfile `FROM` on an unapproved base image.** The allowlist is
   [`hooks/approved-base-images.txt`](hooks/approved-base-images.txt). Multi-stage `FROM <alias>`
   references and build-arg templated images (`FROM ${BASE}`) are never blocked.

Everything else is **advisory**: a note on stderr, exit 0, no interruption.

### Off switch

```sh
export PATTERSON_ENGINEERING_HOOKS=off
```

With this set, **nothing is ever blocked**. The hook still prints what it *would* have blocked to
stderr, so you keep the signal without the interruption. Any other value, or unset, leaves blocking
enabled.

> [!TIP]
> Use the off switch for demos, for a known false positive, or any time an incorrect block would
> cost more than a missed one.

### Editing the base image allowlist

`hooks/approved-base-images.txt` currently contains `mcr.microsoft.com/` and `scratch`, plus
commented placeholders. That is the narrowest defensible reading of the Azure Compute Standards
("unmodified Microsoft marketplace images qualify"). Add your registry prefix to that file, one per
line.

> [!WARNING]
> **The standards do not enumerate an approved container registry list** — this is a real `[TBD]`.
> Until Infra CloudOps and AppSec confirm the internal registry, the hook will block common public
> images such as `node:24`.

## What this plugin does NOT do

> [!CAUTION]
> A clean validator run means "nothing obvious was found in these files", not "this system is
> compliant". **This plugin does not certify compliance.** Only the standard owners can make that
> call.

- **It does not evaluate deployed Azure state.** Everything here reads files. Subscription layout,
  actual RBAC assignments, real Azure Policy compliance, live PagerDuty configuration and Commvault
  backup jobs are all outside its reach.
- **It does not parse IaC.** The validators are regex scanners with no Terraform, Bicep or YAML
  evaluator. They cannot resolve variables, locals, modules, `for_each`, or pipeline template
  includes. A violation hidden behind a module reference will be missed; a violation expressed as a
  variable may be reported when the resolved value is fine.
- **It does not check the two non-scriptable standards automatically.** Azure Environment and
  Monitoring & Alerting have manual checklists, not scripts.
- **It does not replace the required CI scans.** GitLeaks, Checkmarx, Trivy, DAST and API scanning
  are still required in the pipeline. The hook's secret detection is a courtesy at write time, not a
  control.
- **It does not grant approvals.** `approved-software-check` reports that a tool requires approval
  and names the owning team where the standard states one. It cannot tell you whether your team
  already has that approval.
- **It does not know anything the standards do not say.** Roughly two dozen `[TBD]` markers across
  the skills record genuine gaps in the source articles — no DAST tool is named anywhere, the
  required tag keys are not enumerated, the approval request process is not described, and there is
  no approved container base image list. Those are questions for the standard owners, not for the
  plugin.
- **It carries no Patterson-internal data.** No hostnames, credentials, subscription IDs or customer
  information. Text only: no binaries, no images.

## Layout

```text
patterson-engineering/
├── .claude-plugin/plugin.json
├── README.md
├── agents/standards-compliance-reviewer.md
├── hooks/
│   ├── hooks.json                  # PreToolUse on Write|Edit
│   ├── approved-base-images.txt    # editable allowlist
│   ├── scripts/pretooluse-guard.ts
│   └── tests/
└── skills/<six skills>/
    ├── SKILL.md                    # lean: decision rules + pointers
    ├── references/                 # full clause text
    ├── scripts/                    # validator, or a README saying why there is none
    ├── tests/                      # fixtures + POSIX-sh harness
    ├── _SOURCES.md
    └── REFERENCES.md
```

All intra-plugin references use `${CLAUDE_PLUGIN_ROOT}`. There are no absolute paths anywhere in
this plugin.

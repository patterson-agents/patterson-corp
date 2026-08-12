# Layered managed settings

How Patterson projects an org chart onto agent configuration, given that the platforms underneath
were not designed to carry one.

> [!IMPORTANT]
> **The enterprise layer now carries enforcement, but nothing here is installed.** As of the
> `add-house-standards-enforcement` change (August 2026, approved by the platform owner),
> `10-enterprise.json` sets `permissions.deny` rules mirroring the house-standards guard: the
> Python toolchain, non-bun package managers, and foreign lockfile writes. Layers `20`–`40`
> remain additive-only, and no layer sets `strictKnownMarketplaces` or `blockedMarketplaces` —
> marketplace lockdown is still a separate, unapproved decision. None of it binds a developer
> machine until the merged output is deployed to that machine's managed settings path (see
> [Deployment](#deployment) and `docs/architecture/org-enforcement.md`).

## Contents

- [Source shorthand](#source-shorthand)
- [The six-layer model](#the-six-layer-model)
- [Four verified constraints](#four-verified-constraints)
- [The four layers in this repository](#the-four-layers-in-this-repository)
- [Numeric prefixes and gap allocation](#numeric-prefixes-and-gap-allocation)
- [Deployment](#deployment)
- [Open questions](#open-questions)
- [Citations](#citations)

## Source shorthand

Every claim below carries a citation of the form `SHORTHAND § section`. Anything that no source
answers is marked `[TBD: not specified in <source>]` rather than inferred.

| Shorthand | Document |
|---|---|
| `CC-settings` | `.tmp/staging/docs/claude-code/settings.md` |
| `CC-marketplaces` | `.tmp/staging/docs/claude-code/plugin-marketplaces.md` |
| `CC-admin` | `.tmp/staging/docs/claude-code/admin-setup.md` |
| `CC-server` | `.tmp/staging/docs/claude-code/server-managed-settings.md` |
| `VSC-enterprise` | `.tmp/staging/docs/vscode/enterprise-ai-settings.md` |
| `VSC-plugins-norm` | `patterson-platform-docs/references/platforms/vscode/_NORMATIVE-agent-plugins.md` |
| `VSC-harness-norm` | `patterson-platform-docs/references/platforms/vscode/_NORMATIVE-agent-harnesses.md` |
| `GHC-precedence` | `.tmp/staging/docs/copilot/response-customization-precedence.md` |
| `GHC-support` | `.tmp/staging/docs/copilot/custom-instructions-support-matrix.md` |
| `GHC-cascade` | `.tmp/staging/docs/copilot/policies-concepts-cascade.md` |
| `GHC-org-instructions` | `.tmp/staging/docs/copilot/org-custom-instructions.md` |

Full paths are in [Citations](#citations). The staged snapshots under `.tmp/staging/docs/` and the
copies under `patterson-platform-docs/references/platforms/` were byte-identical when this document
was written; either path resolves the same text.

## The six-layer model

Patterson's org chart has four tiers above the code — enterprise, sub-organization, department,
team — and two below it that belong to the developer rather than to the organization: the
repository and the user.

| # | Layer | Owner | Claude Code mechanism | Demonstrated here |
|---|---|---|---|---|
| 1 | Enterprise | Patterson Companies | `managed-settings.d/10-enterprise.json` | Yes |
| 2 | Sub-organization | Dental, Vet | `managed-settings.d/20-suborg.json` | Yes |
| 3 | Department | Engineering, Marketing | `managed-settings.d/30-department.json` | Yes |
| 4 | Team | an individual team | `managed-settings.d/40-team.json` | Yes |
| 5 | Repository | the repo's maintainers | `.claude/settings.json` (checked in) | No |
| 6 | User | the developer | `~/.claude/settings.json` | No |

Layers 5 and 6 are described but not shipped. `.claude/settings.json` is project settings "checked
into source control and shared with your team" and `~/.claude/settings.json` is user settings that
"apply to all projects" (`CC-settings` § Settings files). Neither is Patterson's to write from a
central catalog.

### The precedence runs opposite to the org chart

This is the part that surprises people. Layers 1 through 4 do not sit at four different precedence
levels. They all live inside a *single* precedence slot — the managed tier — which is the **highest**
of all five scopes and "cannot be overridden by any other level, including command line arguments"
apart from a short list of security-sensitive exceptions (`CC-settings` § Settings precedence).

| Precedence | Scope | Which of the six layers |
|---|---|---|
| 1 (highest) | Managed settings | Layers 1-4, merged into one effective policy |
| 2 | Command line arguments (`--settings`) | none |
| 3 | Local project settings (`.claude/settings.local.json`) | none |
| 4 | Shared project settings (`.claude/settings.json`) | Layer 5 |
| 5 (lowest) | User settings (`~/.claude/settings.json`) | Layer 6 |

Source: `CC-settings` § Settings precedence.

So the organizational hierarchy is not expressed by precedence at all. It is expressed by *merge
order inside one scope* — which is why the whole demonstration turns on constraint 1 below.

Between scopes 3 to 5, array-valued settings such as `permissions.allow` are "concatenated and
deduplicated, not replaced", so a lower-priority scope can add entries without overriding a higher
one; `fallbackModel` and a managed `availableModels` are the stated exceptions (`CC-settings`
§ Settings precedence, "Array settings merge across scopes").

### The same six layers on the other two platforms

| Layer | Claude Code | VS Code | GitHub Copilot |
|---|---|---|---|
| 1 Enterprise | `managed-settings.d/` fragment | Copilot managed settings policies (`ChatEnabledPlugins`, `ChatExtraMarketplaces`, `ChatStrictMarketplaces`) | Enterprise **policies** exist; enterprise **instructions** do not |
| 2 Sub-org | `managed-settings.d/` fragment | `[TBD: not specified in VSC-enterprise]` — no per-tier fragment mechanism documented | Organization policies and organization custom instructions |
| 3 Department | `managed-settings.d/` fragment | `[TBD: not specified in VSC-enterprise]` | `[TBD: not specified in GHC-precedence]` — no tier between organization and repository |
| 4 Team | `managed-settings.d/` fragment | `[TBD: not specified in VSC-enterprise]` | `[TBD: not specified in GHC-precedence]` |
| 5 Repository | `.claude/settings.json` | `.claude/settings.json` **or** `.github/copilot/settings.json` | `.github/copilot-instructions.md`, `.github/instructions/**/*.instructions.md`, `AGENTS.md` |
| 6 User | `~/.claude/settings.json` | VS Code user settings | Personal instructions (GitHub.com only) |

Sources: `CC-settings` § Settings files; `VSC-enterprise` § Manage agent plugins and marketplaces;
`VSC-plugins-norm` § Convergence point; `GHC-precedence` § Precedence of custom instructions;
`GHC-cascade` § How do policies work.

The honest reading of that table: **only Claude Code can express four organizational tiers.** VS
Code and Copilot each collapse tiers 1 through 4 into one org-level control surface. Patterson
should treat the four-tier model as a Claude Code capability that the other two platforms
approximate, not as a shape all three share.

## Four verified constraints

### 1. The managed tier is winner-take-all, and `managed-settings.d/` is the only thing that merges

There are five ways managed settings can reach a machine. Only one of them applies per run:

> Within the managed tier, apart from the exception keys listed after the ranking, only one source
> is used and the others are ignored rather than merged.
>
> — `CC-settings` § Settings precedence

The ranking, highest first, is `policyHelper` output, then remote (server-managed or Claude apps
gateway), then MDM/OS-level policies, then **file-based (`managed-settings.d/*.json` and
`managed-settings.json`, merged together)**, then the Windows HKCU registry (`CC-settings`
§ Settings precedence). The narrow exceptions that *are* read from every admin-controlled source —
the sandbox lock keys, `allowAllClaudeAiMcps`, the sandbox binary paths, `forceRemoteSettingsRefresh`,
and `env` — are listed in the same section and in `CC-server` § Per-key exceptions across managed
sources. Neither `extraKnownMarketplaces` nor `enabledPlugins` is among them.

> [!WARNING]
> Because the tier is winner-take-all, a department that later deploys an MDM profile does not *add*
> to the file-based layers — it **replaces all four of them**. The layering in this repository is
> only coherent while the file-based channel is the winning source on the machine.

Inside the file-based source, the drop-in directory is what makes layering possible:

> File-based managed settings also support a drop-in directory at `managed-settings.d/` in the same
> system directory alongside `managed-settings.json`. This lets separate teams deploy independent
> policy fragments without coordinating edits to a single file.
>
> Following the systemd convention, `managed-settings.json` is merged first as the base, then all
> `*.json` files in the drop-in directory are sorted alphabetically and merged on top. Later files
> override earlier ones for scalar values, arrays are concatenated and de-duplicated, and objects
> are deep-merged. Hidden files starting with `.` are ignored.
>
> Use numeric prefixes to control merge order, for example `10-telemetry.json` and `20-security.json`.
>
> — `CC-settings` § Settings files

Four consequences follow, and all four shape the files in this repository:

| Rule | Consequence for Patterson |
|---|---|
| Sorted **alphabetically** | Organizational precedence has to be encoded in the filename. Hence `10-`, `20-`, `30-`, `40-`. |
| Later files override **scalars** | A team can flip a boolean the enterprise set. This is the override half of `40-team.json`. |
| **Arrays** concatenate and de-duplicate | A later fragment can only *widen* an array. See the warning below. |
| **Objects** deep-merge | `extraKnownMarketplaces` and `enabledPlugins` are objects, so every layer contributes keys and no layer wipes another's. |

> [!CAUTION]
> Array concatenation cuts against enforcement. `strictKnownMarketplaces` is an allowlist array; by
> the cited merge rule, a `50-` fragment adding an entry would **widen** the enterprise allowlist
> rather than narrow it. Any future enforcement design has to account for restriction arrays
> merging in the permissive direction. Whether the same is true of `permissions.deny` — a deny array,
> where concatenation strengthens rather than weakens — follows from the same rule but is not
> separately stated: `[TBD: not specified in CC-settings]`.

One more property makes the drop-in directory safe to iterate on: managed settings "parse
tolerantly". An entry that fails schema validation is stripped, a warning is recorded, and every
remaining valid policy is still enforced, so "a single typo cannot disable the rest of your
organization's policy" (`CC-settings` § Invalid entries in managed settings, requires Claude Code
v2.1.169 or later).

### 2. Marketplace `name` is a flat global namespace

> Each user can register only one marketplace per name: adding a second marketplace with the same
> name replaces the first.
>
> — `CC-marketplaces` § Marketplace schema > Required fields, the `name` row

There is no scoping by owner, by org, or by source. `patterson-corp` is `patterson-corp` everywhere
on the machine, and marketplace state is stored once per user in
`~/.claude/plugins/known_marketplaces.json`, "not per project" (`CC-marketplaces` § Require
marketplaces for your team).

> [!WARNING]
> **First-found-wins hazards.** Three of them are documented.
>
> 1. **Later layers silently replace earlier ones.** If a `50-` fragment declared
>    `extraKnownMarketplaces.patterson-corp` pointing at a fork, deep-merge would rewrite the
>    `source` and the enterprise catalog would quietly become the fork. Nothing warns.
> 2. **A plugin seed outranks settings.** With `CLAUDE_CODE_PLUGIN_SEED_DIR` set, "marketplaces
>    declared in the seed overwrite any matching entries in the user's configuration on each
>    startup", and if `extraKnownMarketplaces` or `enabledPlugins` name a marketplace already in the
>    seed, "Claude Code uses the seed copy instead of cloning" (`CC-marketplaces` § Pre-populate
>    plugins for containers). A container image can therefore substitute a catalog by name.
> 3. **`enabledPlugins` keys are `plugin@marketplace`.** The marketplace half of the key resolves
>    through the same flat namespace, so a replaced marketplace silently redirects every plugin
>    enabled from it. Trust for managed hooks is granted "by full `plugin@marketplace` ID, so a
>    plugin with the same name from a different marketplace stays blocked" (`CC-settings` § Hook
>    configuration) — that check protects hooks, not marketplace identity.

The operational rule: **the `name` field in a marketplace manifest is a Patterson-wide identifier.**
`patterson-corp`, `patterson-dental`, `patterson-vet`, and `patterson-labs` must each be claimed
once, org-wide, and never reused for a fork or a mirror.

### 3. Copilot instruction precedence is inverted, and there is no enterprise tier

Copilot recognizes exactly three types of custom instruction — personal, repository, and
organization (`GHC-precedence` § Types of custom instructions) — and orders them like this:

> Personal instructions take the highest priority. Repository instructions come next, and then
> organization instructions are prioritized last. However, all sets of relevant instructions are
> provided to Copilot.
>
> — `GHC-precedence` § Precedence of custom instructions

That is the exact inverse of Claude Code, where the managed tier wins and user settings lose. The
enumeration in the same section runs: personal, then repository (path-specific, then repository-wide,
then agent instructions such as `AGENTS.md`), then organization. `GHC-support` confirms the same
three types across every listed environment and names no fourth; **no enterprise instruction type
appears in either document.** Organization instructions are also set in the organization settings
UI rather than in a repository file, and require a Copilot Business or Copilot Enterprise
subscription (`GHC-org-instructions` § Adding organization custom instructions; `GHC-precedence`
§ About organization custom instructions).

> [!NOTE]
> **Instructions and policies are two different systems, and only one of them cascades the way you
> would expect.** Copilot *policies* — which features, agents, and models users can access — do have
> an enterprise tier: "policies are set at the enterprise level first", enterprise admins can enable,
> disable, or "let organizations decide", and where a user holds licenses from multiple enterprises
> "the most restrictive policy across enterprises almost always applies" (`GHC-cascade` § How do
> policies work, § What about users with multiple licenses). Copilot *instructions* have no
> enterprise tier and invert the ordering. Do not reason about one from the other.

The consequence for Patterson: **an enterprise instruction cannot be enforced on Copilot.** Anything
Patterson needs to be non-negotiable has to be a Copilot *policy*, not a Copilot instruction —
and anything expressed as an instruction can be overridden by any individual developer's personal
instructions. Whether Copilot supports layering more than one organization-level instruction set:
`[TBD: not specified in GHC-org-instructions]`.

### 4. VS Code reads `.claude/settings.json` with the same keys

> VS Code reads workspace plugin recommendations from **`.claude/settings.json` OR
> `.github/copilot/settings.json`**, using the SAME field names as Claude Code:
> `extraKnownMarketplaces` : `{ "<name>": { "source": { "source": "github", "repo": "org/repo" } } }`,
> `enabledPlugins` : `{ "<plugin>@<marketplace>": true }`
>
> — `VSC-plugins-norm` § Convergence point, distilled from
> `https://code.visualstudio.com/raw/docs/agent-customization/agent-plugins.md`

The same convergence holds at the enterprise end. VS Code's Copilot managed settings map policy
names onto the identical Claude Code keys (`VSC-enterprise` § Available managed settings, § Manage agent
plugins and marketplaces):

| Claude Code key | VS Code policy | VS Code setting |
|---|---|---|
| `enabledPlugins` | `ChatEnabledPlugins` | `chat.plugins.enabledPlugins` (org-managed) |
| `extraKnownMarketplaces` | `ChatExtraMarketplaces` | `chat.plugins.extraMarketplaces` |
| `strictKnownMarketplaces` | `ChatStrictMarketplaces` | `chat.plugins.strictMarketplaces` (org-managed) |

VS Code also states that it reads these policies "from the same Copilot managed settings that drive
enterprise plugin standards for Copilot CLI, so a single definition applies to both clients"
(`VSC-enterprise` § Manage agent plugins and marketplaces). And the marketplace manifest schema is
Claude's: "For the full marketplace plugin schema, see the Claude Code plugin marketplace
documentation" (`VSC-plugins-norm` § Marketplaces).

**One settings shape serves both agents.** The four files in this repository are therefore not
Claude-Code-only artifacts — the same `extraKnownMarketplaces` and `enabledPlugins` objects are what
a VS Code workspace recommendation and a VS Code enterprise policy carry.

Two limits on that convergence, both worth knowing before anyone plans a single source of truth:

- VS Code loads only portable skills and MCP configuration from a plugin. Agents, hooks, and slash
  commands are client-specific, and VS Code ignores client-extension namespaces (`VSC-plugins-norm`
  § Portable vs client-specific components). A Patterson plugin's subagents and hooks do not cross.
- The Copilot harness supports "only LOCAL MCP servers that require NO authentication"
  (`VSC-harness-norm` § Why this matters for Patterson).

Whether VS Code offers any drop-in-directory equivalent for layering org tiers:
`[TBD: not specified in VSC-enterprise]`.

## The four layers in this repository

Each section states what the layer does, which tier owns it, and the enforcement switch that tier
would add to go live. **The switches are shown commented out.** JSON has no comment syntax, so a
commented-out block cannot live in the `.json` file itself — it lives here, and enabling it means
copying the block into the layer and deleting the leading `//` from each line.

### `10-enterprise.json` — enterprise

**Owner:** Patterson Companies, corporate IT.
**What it does:** registers the enterprise catalog `patterson-corp` from its GitHub repository, and
states `autoUpdate` explicitly so that a lower layer has something concrete to override.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "extraKnownMarketplaces": {
    "patterson-corp": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-corp" },
      "autoUpdate": false
    }
  }
}
```

The `github` source type "uses `repo`" and is one of seven documented source types (`CC-settings`
§ `extraKnownMarketplaces`). The `repo` value "must name a single repository" — the owner-wildcard
form `"acme-corp/*"` is accepted only in `strictKnownMarketplaces` and `blockedMarketplaces`
(`CC-settings` § `strictKnownMarketplaces`, "Owner wildcards"). Each marketplace entry "also accepts an optional `autoUpdate`
Boolean … When omitted, official Anthropic marketplaces default to `true` and all other marketplaces
default to `false`" (`CC-settings` § `extraKnownMarketplaces`). Setting `false` here restates the
documented default for a non-official marketplace; it removes nothing.

`extraKnownMarketplaces` in managed settings is the documented way to register a catalog centrally:
"add the marketplace to `extraKnownMarketplaces` in the same `managed-settings.json` so Claude Code
registers it automatically" (`CC-marketplaces` § Managed marketplace restrictions).

<details>
<summary>Enforcement switch — <code>strictKnownMarketplaces</code> and <code>disableSideloadFlags</code></summary>

```jsonc
// "strictKnownMarketplaces": [
//   { "source": "github", "repo": "patterson-agents/*" }
// ],
// "disableSideloadFlags": true
```

`strictKnownMarketplaces` is managed-settings-only and "cannot be overridden by user or project
settings"; `undefined` means no restrictions, an empty array `[]` is "complete lockdown that blocks
every marketplace source, including the official Anthropic marketplace", and a list of sources is an
allowlist (`CC-settings` § `strictKnownMarketplaces`; `CC-marketplaces` § Managed marketplace
restrictions). The owner-wildcard `"patterson-agents/*"` matches every repository under that GitHub
owner and requires Claude Code v2.1.223 or later (`CC-settings` § `strictKnownMarketplaces`, "Owner wildcards").

`disableSideloadFlags` rejects `--plugin-dir`, `--plugin-url`, `--agents`, and `--mcp-config`, "which
users could otherwise pass to bypass `strictKnownMarketplaces` for a single run"; it requires v2.1.193
or later (`CC-settings` § Available settings). The two belong together — the allowlist without the
flag rejection has a documented one-run bypass.

> [!NOTE]
> `strictKnownMarketplaces` "restricts what users can add, but doesn't register marketplaces on its
> own" (`CC-marketplaces` § Managed marketplace restrictions), so the switch is additive to the
> `extraKnownMarketplaces` block above rather than a replacement for it.

Login enforcement (`forceLoginMethod`, `forceLoginOrgUUID`) is the other enterprise-tier switch. It
restricts login to a specific method or Anthropic organization and is enforced across the terminal,
VS Code extension, Agent SDK, `claude setup-token`, and `/install-github-app`; when set, sessions
authenticated by `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, or `apiKeyHelper` are blocked at
startup (`CC-admin` § Decide what to enforce; `CC-settings` § Available settings). It is deliberately not
drafted here — Patterson's provider and licensing posture is not settled.

</details>

### `20-suborg.json` — sub-organization

**Owner:** the segment — Patterson Dental, Patterson Veterinary.
**What it does:** adds the two sub-org catalogs alongside the enterprise one. It does not touch
`patterson-corp`; deep-merge means both keys survive into the effective policy.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "extraKnownMarketplaces": {
    "patterson-dental": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-dental" }
    },
    "patterson-vet": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-vet" }
    }
  }
}
```

`patterson-dental` and `patterson-vet` are the sub-org catalogs named in this repository's README
topology table. Their repositories are planned rather than published; the entries demonstrate the
shape and will not resolve until those repositories exist. Their plugin contents are
`[TBD: no source]` — see [Open questions](#open-questions).

<details>
<summary>Enforcement switch — <code>blockedMarketplaces</code></summary>

```jsonc
// "blockedMarketplaces": [
//   { "source": "github", "repo": "untrusted-fork/patterson-dental" }
// ]
```

`blockedMarketplaces` is a managed-settings-only blocklist, "enforced on marketplace add and on
plugin install, update, refresh, and auto-update, so a marketplace added before the policy was set
cannot be used to fetch plugins". Blocked sources "are checked before downloading, so they never
touch the filesystem", and a `github` entry may use the owner-wildcard `"owner/*"` form. Requires
Claude Code v2.1.223 or later (`CC-settings` § Available settings).

A blocklist is the right shape at this tier precisely because of constraint 2: the realistic sub-org
threat is a fork registered under a name that collides with an official catalog.

</details>

### `30-department.json` — department

**Owner:** the department — Engineering, Marketing, Infra CloudOps.
**What it does:** turns on the two `patterson-corp` plugins for everyone in the department.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "enabledPlugins": {
    "patterson-engineering@patterson-corp": true,
    "patterson-brand@patterson-corp": true
  }
}
```

`enabledPlugins` "controls which plugins are enabled", in the format
`"plugin-name@marketplace-name": true/false`, and "a plugin with no entry at any scope falls back to
its `defaultEnabled` value" (`CC-settings` § `enabledPlugins`). Both plugin names and the marketplace
name are taken from this repository's own `.claude-plugin/marketplace.json`.

> [!IMPORTANT]
> **Every value in these files is `true`, and that is a posture decision, not a coincidence.** At the
> managed tier, `enabledPlugins` entries are "organization-wide policy overrides that block
> installation at all scopes and hide the plugin from the marketplace", and "plugins force-enabled by
> managed settings cannot be disabled" from local settings (`CC-settings` § `enabledPlugins`). A
> managed `false` is therefore an enforcement action — it removes a plugin from developers — and it
> is out of scope until enforcement is approved.

Two second-order effects of force-enabling a plugin at the managed tier, both worth knowing before
this ships for real:

- Hooks from plugins force-enabled in managed `enabledPlugins` are loaded even under
  `allowManagedHooksOnly`, which lets administrators "distribute vetted hooks through an organization
  marketplace while blocking everything else" (`CC-settings` § Hook configuration). Enabling
  `patterson-engineering` here also blesses its `PreToolUse` hook.
- Managed settings are read-only to Claude Code, so if a plugin is renamed the rewrite that happens
  automatically in user, project, and local scopes does not happen here: "the rename notice recurs
  until an administrator updates `enabledPlugins` in the managed settings file to use the new name"
  (`CC-marketplaces` § Rename or remove a plugin).

<details>
<summary>Enforcement switch — <code>permissions.deny</code></summary>

```jsonc
// "permissions": {
//   "deny": [
//     "Read(./.env)",
//     "Read(./.env.*)",
//     "Read(./secrets/**)"
//   ]
// }
```

The `permissions` object with `allow` and `deny` arrays is the documented settings shape
(`CC-settings` § Settings files, example `settings.json`). At the managed tier it "cannot be
overridden by any other level, including command line arguments" (`CC-settings` § Settings
precedence).

The department tier is the natural owner of tool denials because denials are workload-shaped rather
than identity-shaped. Note the array-merge caveat in constraint 1: `deny` entries from several
fragments concatenate and de-duplicate, which for a deny list strengthens the policy — but the
documentation states the merge rule generally rather than confirming this specific reading. See
[Open questions](#open-questions).

</details>

### `40-team.json` — team, and the extend-versus-override worked example

**Owner:** an individual team inside a department.
**What it does:** demonstrates both halves of the merge in one file — extending an inherited object
with a new key, and overriding an inherited scalar.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "extraKnownMarketplaces": {
    "patterson-corp": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-corp" },
      "autoUpdate": true
    },
    "patterson-labs": {
      "source": { "source": "github", "repo": "patterson-agents/patterson-labs" }
    }
  }
}
```

| Half | Key | Mechanism | Result |
|---|---|---|---|
| **Extend** | `extraKnownMarketplaces.patterson-labs` | objects deep-merge | `patterson-labs` joins `patterson-corp`, `patterson-dental`, and `patterson-vet`. No earlier layer loses an entry. |
| **Override** | `extraKnownMarketplaces.patterson-corp.autoUpdate` | later files override scalars | `10-enterprise.json` set `false`; `40` sorts after `10`; the effective value is `true`. |

Both rules are from `CC-settings` § Settings files. The effective merged policy is:

| Key | Value | Contributed by |
|---|---|---|
| `extraKnownMarketplaces.patterson-corp.source` | `patterson-agents/patterson-corp` | `10`, restated by `40` |
| `extraKnownMarketplaces.patterson-corp.autoUpdate` | `true` | `40` overrides `10` |
| `extraKnownMarketplaces.patterson-dental` | github source | `20` |
| `extraKnownMarketplaces.patterson-vet` | github source | `20` |
| `extraKnownMarketplaces.patterson-labs` | github source | `40` |
| `enabledPlugins` | both `patterson-corp` plugins `true` | `30` |

`patterson-labs` is the incubation catalog named in this repository's README topology table, and
`autoUpdate: true` makes Claude Code "refresh that marketplace and update its installed plugins in
the background after startup" (`CC-settings` § `extraKnownMarketplaces`) — a reasonable thing for a
team tracking incubating work to want, and a change that adds capability rather than removing it.

> [!NOTE]
> **Why the override repeats the full `source` block.** Deep-merge implies a fragment could carry
> only `{"patterson-corp": {"autoUpdate": true}}` and inherit `source` from `10-enterprise.json`.
> That would be a tighter demonstration, but it depends on merge running *before* per-file schema
> validation, and the documented behaviour is that a managed entry failing validation is stripped
> with a warning (`CC-settings` § Invalid entries in managed settings). Whether a source-less
> `extraKnownMarketplaces` entry survives that check is
> `[TBD: not specified in CC-settings]`, so this file repeats the entry in full and every fragment
> stands alone. Run `/doctor` to list stripped entries with their source file and field.

> [!NOTE]
> **Why the extend half uses `extraKnownMarketplaces` rather than `enabledPlugins`.** The obvious
> team-tier extension is enabling one more plugin. Both plugins in `patterson-corp` are already
> enabled by `30-department.json`, and no plugin name in `patterson-labs`, `patterson-dental`, or
> `patterson-vet` is sourced anywhere — those catalogs do not exist yet. Naming one would be an
> invented settings value, so the extend half uses a marketplace registration instead. When the
> sibling catalogs ship, a team-tier `enabledPlugins` entry such as
> `"<plugin>@patterson-labs": true` is the more idiomatic form. See
> [Open questions](#open-questions).

<details>
<summary>Enforcement switch — a forced <code>enabledPlugins</code> disable</summary>

```jsonc
// "enabledPlugins": {
//   "patterson-brand@patterson-corp": false
// }
```

A managed `false` is the team-tier enforcement switch, and it is genuinely an enforcement action:
managed `enabledPlugins` entries "block installation at all scopes and hide the plugin from the
marketplace", and a plugin force-enabled by managed settings "cannot be disabled" from local
settings (`CC-settings` § `enabledPlugins`). Flipping one boolean removes a capability from every
developer on the team, with no local recourse. That is why the shipped file contains no `false`.

</details>

## Numeric prefixes and gap allocation

The merge is alphabetical (`CC-settings` § Settings files), so the filename *is* the precedence
declaration. `ls` order and policy order are the same thing, which is the property worth protecting.

| Prefix | Tier | Reserved |
|---|---|---|
| `00-` | — | reserved; sorts before the enterprise layer, so nothing should claim it casually |
| `10-` | Enterprise | in use |
| `20-` | Sub-organization | in use |
| `30-` | Department | in use |
| `40-` | Team | in use |
| `50-`-`90-` | — | free for tiers Patterson has not defined |

Tens leave nine insertion points between any two tiers without renaming a file. Renaming is the
thing to avoid: a rename changes merge order for every key in the file at once, silently.

> [!WARNING]
> The prefixes are a contract, not a convention. Adding a `25-` fragment inserts a tier between
> sub-organization and department and changes the effective value of every scalar those two layers
> share. Allocate a prefix deliberately, and record it in this table when you do.

Two mechanical notes from the same source: hidden files starting with `.` are ignored, so a
`.40-team.json.swp` left by an editor is skipped rather than merged; and `managed-settings.json` — if
one exists in the same directory — "is merged first as the base", meaning it sits *below* every
numbered fragment regardless of prefix.

## Deployment

> [!IMPORTANT]
> **The `managed-settings.d/` directory in this repository is a demonstration, not an installed
> policy.** Nothing here is deployed to any machine, no file has been written to a system settings
> path, and no developer's configuration is affected by this commit. It is committed so the shape
> can be reviewed, and so `populate-sibling-marketplaces` has something concrete to copy.

To install these layers for real, the directory goes alongside `managed-settings.json` in the
platform's system settings directory (`CC-settings` § Settings files; `CC-admin` § Decide how
settings reach devices):

| Platform | System directory | Drop-in directory |
|---|---|---|
| macOS | `/Library/Application Support/ClaudeCode/` | `/Library/Application Support/ClaudeCode/managed-settings.d/` |
| Linux and WSL | `/etc/claude-code/` | `/etc/claude-code/managed-settings.d/` |
| Windows | `C:\Program Files\ClaudeCode\` | `C:\Program Files\ClaudeCode\managed-settings.d\` |

> [!CAUTION]
> The legacy Windows path `C:\ProgramData\ClaudeCode\managed-settings.json` "is no longer supported
> as of v2.1.75. Administrators who deployed settings to that location must migrate files to
> `C:\Program Files\ClaudeCode\managed-settings.json`" (`CC-settings` § Settings files).

Three deployment facts that follow from the cited sources:

- **WSL does not inherit Windows policy by default.** "By default, WSL reads only the Linux file path
  at `/etc/claude-code`"; extending Windows registry and `C:\Program Files\ClaudeCode` policy to WSL
  requires `wslInheritsWindowsSettings: true` in one of those admin-only Windows sources (`CC-admin`
  § Decide how settings reach devices). A developer working in WSL is a different machine as far as
  these files are concerned.
- **The file-based channel must be the winning managed source.** Deploying a `policyHelper`, a
  server-managed configuration, or an MDM profile makes the file-based layers invisible — see
  constraint 1. `CC-admin` rates the file-based channel "Medium" tamper-resistance and applicable to
  all users.
- **Verify after deploying.** `/status` shows a `Setting sources` line naming each loaded layer with
  its delivery channel in parentheses, for example `Enterprise managed settings (file)`; a source
  appears "only when that source is loaded with at least one key" (`CC-settings` § Verify active
  settings). It confirms *which sources* loaded, not which layer supplied each key.

## Open questions

Each of these is a question the cited sources do not answer. None of them is guessed at above.

| # | Question | Marker |
|---|---|---|
| 1 | Does an `extraKnownMarketplaces` entry carrying only a changed scalar, with no `source`, pass per-file validation before the drop-in merge runs? | `[TBD: not specified in CC-settings]` |
| 2 | Which Claude Code version introduced `managed-settings.d/`? Other managed-settings behaviours carry explicit minimums; the drop-in directory does not. | `[TBD: not specified in CC-settings]` |
| 3 | How does a given machine receive only its own sub-org, department, and team fragments? The drop-in directory describes merging, not targeting or distribution. | `[TBD: not specified in CC-admin]` |
| 4 | Does concatenating `permissions.deny` across fragments behave as the general array rule implies for a deny-direction array? | `[TBD: not specified in CC-settings]` |
| 5 | Does VS Code offer any drop-in or layering mechanism for org tiers, or only single-valued policies? | `[TBD: not specified in VSC-enterprise]` |
| 6 | Can Copilot layer more than one organization-level instruction set, for example per sub-org? | `[TBD: not specified in GHC-org-instructions]` |
| 7 | What plugins will `patterson-dental`, `patterson-vet`, and `patterson-labs` publish? The catalogs are named in this repository's README; their contents are undefined. | `[TBD: no source]` |
| 8 | Does Patterson's Approved Software process cover managed settings deployed by IT to developer machines? | `[TBD: no source]` |

> [!NOTE]
> A `[TBD]` marker here is working as designed. The alternative — a plausible-sounding inference
> about settings precedence — is exactly the kind of claim that gets copied into a policy document
> and never re-checked.

## Citations

Every settings key written into `managed-settings.d/`, with its source:

| Key | Source |
|---|---|
| `$schema` | `CC-settings` § Settings files — "The `$schema` line in the example above points to the official JSON schema for Claude Code settings" |
| `extraKnownMarketplaces` | `CC-settings` § `extraKnownMarketplaces`; `CC-marketplaces` § Require marketplaces for your team, § Managed marketplace restrictions |
| `extraKnownMarketplaces.<name>.source` | `CC-settings` § `extraKnownMarketplaces`, "Marketplace source types" |
| `extraKnownMarketplaces.<name>.source.source: "github"` | `CC-settings` § `extraKnownMarketplaces` — "`github`: GitHub repository (uses `repo`)" |
| `extraKnownMarketplaces.<name>.source.repo` | `CC-settings` § `extraKnownMarketplaces`; § `strictKnownMarketplaces` ("Owner wildcards") for the single-repository constraint |
| `extraKnownMarketplaces.<name>.autoUpdate` | `CC-settings` § `extraKnownMarketplaces` — "Each marketplace entry also accepts an optional `autoUpdate` Boolean" |
| `enabledPlugins` | `CC-settings` § `enabledPlugins` — format `"plugin-name@marketplace-name": true/false` |

Keys cited but deliberately **not** written, appearing only as commented-out switches:
`strictKnownMarketplaces` (`CC-settings` § `strictKnownMarketplaces`), `blockedMarketplaces` and
`disableSideloadFlags` (`CC-settings` § Available settings), `permissions.deny` (`CC-settings`
§ Settings files), `forceLoginMethod` and `forceLoginOrgUUID` (`CC-settings` § Available settings;
`CC-admin` § Decide what to enforce), and a managed `enabledPlugins` `false` (`CC-settings`
§ `enabledPlugins`).

Full source paths, relative to `/workspaces/code/github.com/patterson-agents/`:

| Shorthand | Path |
|---|---|
| `CC-settings` | `.tmp/staging/docs/claude-code/settings.md` |
| `CC-marketplaces` | `.tmp/staging/docs/claude-code/plugin-marketplaces.md` |
| `CC-admin` | `.tmp/staging/docs/claude-code/admin-setup.md` |
| `CC-server` | `.tmp/staging/docs/claude-code/server-managed-settings.md` |
| `VSC-enterprise` | `.tmp/staging/docs/vscode/enterprise-ai-settings.md` |
| `VSC-plugins-norm` | `patterson-platform-docs/references/platforms/vscode/_NORMATIVE-agent-plugins.md` |
| `VSC-harness-norm` | `patterson-platform-docs/references/platforms/vscode/_NORMATIVE-agent-harnesses.md` |
| `GHC-precedence` | `.tmp/staging/docs/copilot/response-customization-precedence.md` |
| `GHC-support` | `.tmp/staging/docs/copilot/custom-instructions-support-matrix.md` |
| `GHC-cascade` | `.tmp/staging/docs/copilot/policies-concepts-cascade.md` |
| `GHC-org-instructions` | `.tmp/staging/docs/copilot/org-custom-instructions.md` |

The `.tmp/staging/docs/` tree is a snapshot fetched 2026-08-11, not a live vendor feed. Every claim
above is re-verifiable against these paths rather than re-derivable from memory; when vendor
behaviour changes, re-fetch and re-check rather than reasoning forward from this document.

## Related

- [`../../managed-settings.d/`](../../managed-settings.d/) — the four demonstration layers
- [`../decisions/0001-spec-framework.md`](../decisions/0001-spec-framework.md) — ADR 0001
- `openspec/changes/add-layered-managed-settings/` — the change that produced this document

## Design

### One new script, not an extension of the existing guard

`pretooluse-guard.ts` blocks exactly two unambiguous violations and its tests assert that
narrowness. The house-standards rules are a different concern (toolchain policy, not content
safety), have a different matcher surface (`Bash` as well as `Write|Edit`), and will evolve on
a different cadence. A separate `house-standards-guard.ts` keeps both scripts small and lets
either be disabled or revised without touching the other. Both honor the same
`PATTERSON_ENGINEERING_HOOKS=off` switch so operators have one lever.

### Token-level command segmentation, deliberately not a shell parser

The Bash check splits the command string on shell separators (`;`, `&&`, `||`, `|`, newline,
`$(`, backtick, `{`, `(`) and inspects only the first word of each segment, after skipping
environment-variable assignments (`FOO=bar`) and transparent wrappers (`sudo`, `env`, `exec`,
`nohup`, `time`, `nice`, `stdbuf`, `xargs`). This catches every ordinary invocation while
keeping false positives near zero: `which python`, `open --raw pip-notes.md`, and a URL
containing `npm` are all untouched because they never place a blocked name in command
position. `command -v python` is treated as an existence query and allowed. The known gap —
a blocked name inside a quoted string handed to `bash -c` or an interpreter — is accepted:
the managed-settings `permissions.deny` layer and CI are the backstops, and a guard that
tried to parse quoting would be a maintenance liability. The gap is stated in the script
header.

### Denylist literals are split in source

The guard's own source spells each denylisted package name as a concatenation
(`"atomic-" + "lockfile"`), for the same reason `verify-all.sh` writes `Figtre[e]`: the file
must never match the patterns it enforces, otherwise the guard blocks edits to itself and any
future forbidden-string scan flags its source. Test payload fixtures spell the names plainly —
they live under `tests/`, which the content check exempts.

### Content-check exemptions mirror the existing guard

The denylist content check for Write/Edit reuses the existing `EXEMPT_PATH` idea (tests,
fixtures, docs, and `.md`/`.mdx`/`.rst`/`.txt` files) so prose documenting the denylist — this
repository's own policy docs — is never blocked. The `.py` and lockfile checks are pure
target-path checks with no content inspection and no exemptions: there is no legitimate write
of a `pnpm-lock.yaml` anywhere in the organization.

### Enterprise layer gets the denies; team layer stays demonstrative

`permissions.deny` lands only in `10-enterprise.json`. The rules mirror the guard's Bash and
lockfile blocks so a machine running the deployed managed settings enforces the same policy
even if plugin hooks are absent or a user edits project settings. Layer files `20`-`40` are
unchanged: the layering demonstration they exist for is still their job.

### What "hard enforced" means, honestly

Three tiers, weakest to strongest, recorded in `docs/architecture/org-enforcement.md`:

1. **Plugin hooks** — block in-session for anyone with the plugin enabled; a user can disable
   the plugin or set the off switch. Friction plus signal, not a boundary.
2. **Managed settings** — unbypassable inside Claude Code once deployed to
   `/etc/claude-code/managed-settings.json`; requires the deployment step outside this repo.
3. **CI + branch protection** — the only tier that binds a hostile or misconfigured machine;
   implemented by the org `.github` repository's reusable standards gate and an org ruleset,
   both outside this repo and listed in the runbook.

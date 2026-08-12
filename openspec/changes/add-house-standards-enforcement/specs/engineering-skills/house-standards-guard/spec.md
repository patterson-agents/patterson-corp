## Purpose

Defines the behavior contract for the house-standards PreToolUse guard shipped in
`plugins/patterson-engineering/hooks/`: hard, in-session blocking of the organization's
toolchain rules — no Python, bun as the only package manager, and the June 2026 supply-chain
denylist — with one off switch and a fail-open error posture.

## ADDED Requirements

### Requirement: Python toolchain invocations are blocked

The guard SHALL deny a `Bash` tool call whose command places any of `python`, `python2`,
`python3`, `pip`, `pip2`, `pip3`, `pipx`, `uv`, `poetry`, `conda`, or `virtualenv` in command
position (the first word of any shell segment, after environment-variable assignments and
transparent wrappers such as `sudo`, `env`, and `xargs`). The guard SHALL deny a `Write` or
`Edit` tool call targeting a path ending in `.py`, `.pyw`, or `.pyi`.

#### Scenario: Running a Python interpreter

- **WHEN** a `Bash` tool call's command is `python3 script.py`
- **THEN** the guard emits a `deny` permission decision naming the blocked tool and the
  TypeScript/Nushell alternatives

#### Scenario: Mentioning Python without invoking it

- **WHEN** a `Bash` tool call's command is `command -v python` or references `python` only in
  an argument or URL
- **THEN** the guard does not deny the call

#### Scenario: Writing a Python file

- **WHEN** a `Write` tool call targets `scripts/helper.py`
- **THEN** the guard emits a `deny` permission decision

### Requirement: Non-bun package managers are blocked

The guard SHALL deny a `Bash` tool call whose command places `npm`, `pnpm`, `yarn`, or `npx`
in command position, and SHALL deny a `Write` or `Edit` tool call targeting a file named
`package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, or `pnpm-lock.yaml`. Invocations of
`bun` and `bunx` SHALL NOT be denied by this rule.

#### Scenario: Installing with npm

- **WHEN** a `Bash` tool call's command is `npm install left-pad`
- **THEN** the guard emits a `deny` permission decision directing the caller to `bun`

#### Scenario: Installing with bun

- **WHEN** a `Bash` tool call's command is `bun add zod`
- **THEN** the guard does not deny the call

#### Scenario: Writing a foreign lockfile

- **WHEN** a `Write` tool call targets `pnpm-lock.yaml` in any directory
- **THEN** the guard emits a `deny` permission decision

### Requirement: The supply-chain denylist is blocked everywhere

The guard SHALL deny a `Bash` tool call whose command contains any denylisted name
(`atomic-lockfile`, `js-digest`, `lockfile-js`, `nextfile-js`, `herbsobering`) anywhere in the
command string, and SHALL deny a `Write` or `Edit` tool call whose written content contains a
denylisted name, except when the target path is exempt (tests, fixtures, examples, docs, or a
`.md`/`.mdx`/`.rst`/`.txt` file). The guard's own source SHALL NOT contain any denylisted
name as a contiguous literal, so the guard never blocks maintenance of itself.

#### Scenario: Installing a denylisted package with bun

- **WHEN** a `Bash` tool call's command is `bun add atomic-lockfile`
- **THEN** the guard emits a `deny` permission decision citing the June 2026 supply-chain
  attack, even though the package manager is bun

#### Scenario: Documenting the denylist

- **WHEN** a `Write` tool call targets a `.md` file whose content lists the denylisted names
- **THEN** the guard does not deny the call

### Requirement: One off switch, fail open

Setting `PATTERSON_ENGINEERING_HOOKS=off` SHALL disable all blocking by this guard while
still printing would-block notes to stderr. On any internal error (unreadable stdin,
malformed payload, thrown exception) the guard SHALL exit `0` without emitting a deny
decision.

#### Scenario: Off switch set

- **WHEN** `PATTERSON_ENGINEERING_HOOKS=off` and a `Bash` tool call's command is `python3 x`
- **THEN** the guard does not deny the call
- **AND** a would-block note is printed to stderr

#### Scenario: Malformed payload

- **WHEN** the guard receives non-JSON on stdin
- **THEN** it exits `0` and emits nothing on stdout

# Hook test fixtures

Fixtures for the PreToolUse guard, containing deliberately secret-shaped strings.

---

> [!CAUTION]
> `payload-secret.json`, `payload-connstring.json`, `payload-placeholder.json` and
> `payload-test-fixture.json` contain synthetic strings that *look* like credentials. They exist so
> the guard's detection and its exemptions can be tested.
>
> **None of them are real.** They are literal repeated characters (`AKIAQQQQ…`, `AAAA…`) with no
> corresponding account anywhere.

## Your secret scanner will flag them

GitLeaks is on Patterson's approved-with-no-approval list and is a required CI stage, so expect this
to fire. Allowlist the path rather than deleting the fixtures:

```toml
# .gitleaks.toml at the repository root
[allowlist]
description = "patterson-engineering hook test fixtures — synthetic secrets by design"
paths = [
  '''plugins/patterson-engineering/hooks/tests/.*\.json$''',
]
```

## Running the harness

```sh
sh hooks/tests/run-tests.sh
```

---
name: storage-data-standards
description: Applies the Patterson Storage & Data Standards covering data classification, encryption, identity, backup, redundancy and disaster recovery for storage accounts, SQL, Cosmos DB and managed disks. Use when provisioning or reviewing storage or a database, choosing a redundancy tier, configuring backup or retention, deciding whether data is PII or HIPAA — and when asked "how do I classify this data", "do we need a private endpoint", "what TLS version", "can I use a SAS token", "how long do we retain backups", or "what RPO applies here".
---

# Storage & Data Standards

Classification, encryption, identity, backup, redundancy and disaster recovery for storage accounts,
SQL, Cosmos DB and managed disks.

Authoritative source: ServiceNow IT Standards & Guidelines, **Storage & Data Standards**
(`sys_kb_id=fdc09a4d93548f908037f8bd1dba10ed`). Owner: Infra CloudOps.

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. Where the standard is
> silent, say `[TBD]`.

## Classification — start here

Four levels, in increasing sensitivity:

**Public · Internal · Confidential · Restricted**

> [!CAUTION]
> **Restricted includes PII and HIPAA.** Anything containing patient data, personal data or health
> information is Restricted.

Classification must be **documented** and **tagged on storage resources where possible**.

Consequences:

| Classification | Consequence |
|---|---|
| **Restricted** or **Confidential** | **Private endpoints** + **Key Vault managed keys where required** |
| All levels | The encryption, identity and backup rules below |

## Decision rules

### Identity

- Use **Entra ID / AD** wherever supported.
- **SQL authentication is still needed for some Azure SQL** — that is expected, not a violation.
- **Shared keys disabled** unless approved.
- **SAS tokens require an expiry and least privilege.**
- **Public network access disabled** unless approved.
- **Private endpoints required for production sensitive workloads.**

### Encryption

- **At rest: mandatory.**
- **In transit: TLS 1.2 minimum, 1.3+ where supported.**
- **CMK for high-sensitivity data**, stored in **Key Vault**.
- **Key rotation at least annually.**

### Backup

- Enabled for **all critical data services**.
- Production standard: **immutable and air-gapped**.
- Schedule: **weekly full + daily differential/incremental**.
- **SQL in full recovery model: 15-minute transaction logs.**
- **Two copies** — primary + secondary.
- **30-day retention.**
- **Blob soft delete: recommended** (recommended, not required — do not report its absence as a
  violation).

### Redundancy

Choose **LRS / ZRS / GRS / GZRS** aligned to criticality and RPO/RTO.
`[TBD: the standard does not map specific redundancy tiers to specific criticality levels.]`

### Disaster recovery

- **RPO and RTO documented per application, by the owner.**
- **Failover tested at least annually.**

### Delivery and exceptions

- **All storage via IaC.**
- Exceptions require **all three**: a documented risk assessment, compensating controls, and **EA
  Team approval**.

> [!NOTE]
> The storage exception path is stricter than the Azure Environment Standards exception path
> (Business Owner) — for storage, use the EA Team path.

## Validator

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/storage-data-standards/scripts/check-storage.ts" <path>
```

Takes a file or directory of `.tf`, `.bicep`, `.json`. Prints `LEVEL|file|line|rule|message`.

| Exit code | Meaning |
|---|---|
| `0` | No errors |
| `1` | `ERROR` findings |
| `2` | Could not evaluate |

Only `ERROR` affects the exit code.

**What it catches:** `public_network_access_enabled = true` and `allow_blob_public_access = true`;
shared keys enabled; HTTPS-only disabled; TLS below 1.2; encryption-at-rest explicitly disabled; a
missing data-classification tag on a storage or database resource; a classification value outside
the four allowed levels; a Confidential/Restricted resource with no private endpoint in the same
file (and, as a WARN, with no Key Vault managed key); SAS generation with no expiry; and, as
advisories, unspecified redundancy, unspecified backup, and missing blob soft delete.

**What it does NOT catch.** It is a regex scanner, not an IaC evaluator, so: it cannot resolve
variables, locals or modules, so a private endpoint defined in another file reads as missing; it
cannot verify that the classification *value* is correct for the data actually stored — only that a
valid one is present; it cannot check backup **schedules**, retention **days**, transaction-log
frequency, immutability, air-gapping, the two-copy rule, key **rotation** age, whether an exception
was actually approved by the EA Team, or whether RPO/RTO are documented anywhere. It reads files,
not deployed Azure state or Commvault configuration.

> [!CAUTION]
> Treat a clean run as "nothing obvious found", not as "compliant".

Fixtures and a test harness: [`tests/run-tests.sh`](tests/run-tests.sh).

## Reference material

| File | Contents |
|---|---|
| [`references/classification.md`](references/classification.md) | The four levels and what each triggers |
| [`references/encryption-and-identity.md`](references/encryption-and-identity.md) | Entra ID, keys, SAS, TLS, CMK, rotation |
| [`references/backup-and-dr.md`](references/backup-and-dr.md) | Backup schedule, retention, redundancy, DR testing |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |

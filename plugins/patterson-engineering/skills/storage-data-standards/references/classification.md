# Data classification

Source: Storage & Data Standards, `sys_kb_id=fdc09a4d93548f908037f8bd1dba10ed`.

---

## The four levels

| Level | Contains |
|---|---|
| **Public** | `[TBD: not defined in the standard]` |
| **Internal** | `[TBD: not defined in the standard]` |
| **Confidential** | `[TBD: not defined in the standard]` |
| **Restricted** | **PII and HIPAA data** |

> [!IMPORTANT]
> Only Restricted is defined by content in the standard. Do not invent definitions for the other
> three. When a team asks "is this Internal or Confidential?", the honest answer is that the
> standard does not say, and the classification should be set by the data owner and documented.

## Requirements

1. Classification **must be documented**.
2. Classification **must be tagged on storage resources where possible**.

The phrase "where possible" acknowledges that some resource types do not support tags. Where tags
are supported, the tag is required.

## What classification triggers

| Classification | Requirement |
|---|---|
| **Restricted** | Private endpoints. Key Vault managed keys where required. |
| **Confidential** | Private endpoints. Key Vault managed keys where required. |
| Internal | The baseline encryption, identity and backup rules. |
| Public | The baseline encryption, identity and backup rules. |

The baseline rules (encryption at rest, TLS 1.2+, backup, IaC) apply at every level. Classification
adds private endpoints and managed keys at the top two levels; it does not remove anything at the
bottom two.

## Tag shape

The standard requires a classification tag but does not fix the key name.
`[TBD: the tag key is not specified.]`

The validator accepts `data_classification`, `dataClassification` or `classification`, and requires
the value to be one of `Public`, `Internal`, `Confidential`, `Restricted`.

```hcl
tags = {
  data_classification = "Restricted"
}
```

## Interaction with environments

The Azure Environment Standards govern *where* classified data may live:

| Environment | Customer data |
|---|---|
| Sandbox | No customer data |
| Dev | No customer data |
| Test | None, or de-identified |
| Stage | Yes (controlled) |
| Production | Yes |

> [!CAUTION]
> Restricted data in Dev is an Environment Standards violation as well as a classification problem.

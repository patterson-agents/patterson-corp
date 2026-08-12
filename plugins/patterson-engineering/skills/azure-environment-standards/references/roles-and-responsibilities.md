# Roles and responsibilities

Source: Azure Environment Standards, `sys_kb_id=a507920d2b25c7941f16fc8bee91bfc4`.

---

## The four roles

| Role | Responsibilities |
|---|---|
| **Business Owner** | SLAs. Budgets. **Approves exceptions.** |
| **Technical Owner** | Performance and scaling triggers. SKU selection. |
| **Application Owner** | Application lifecycle. Configuration. **Alert response.** |
| **Requestor** | Submits requests. **Does NOT provision.** |

## Routing a question

| Question | Route to | Note |
|---|---|---|
| "What is our SLA?" · "Who signs off on this budget?" · "Can we get an exception?" | **Business Owner** | — |
| "Which VM size?" · "When should this scale?" | **Technical Owner** | VM sizing is constrained by the Azure Compute Standards T-shirt size table |
| "Who gets paged?" · "Who changes this config?" | **Application Owner** | The Monitoring & Alerting standard routes alerts through PagerDuty; the Application Owner is the responder |
| "I need a new resource." | **Requestor** submits | The Requestor does not provision it |

## Gaps

> [!WARNING]
> `[TBD: the standard does not name who *does* provision once a Requestor submits a request, nor
> the request intake system.]`
>
> `[TBD: the standard does not state whether one person may hold more than one of these roles.]`
>
> `[TBD: the standard does not define an escalation path when the Business Owner and Technical
> Owner disagree.]`

---
name: satno-crm-developer
description: Develop, review, test, and document SATNO CRM. Use for work on the SATNO Atomic CRM fork, Persian/RTL UI, Jalali dates, Iranian Rial/Toman money handling, Supabase integration, project purchasing checklists, finance modules, staff workflows, CRM integrations, GitHub branches, commits, pull requests, and deployment readiness.
---

# SATNO CRM Developer

## Product baseline
Treat SATNO CRM as a Persian-first CRM. English is a reference language only unless a task explicitly requires it.

## Core conventions
- User-facing Persian layouts must be RTL.
- Display dates in the Jalali calendar where the interface is intended for Iranian users.
- Support both Iranian Rial and Toman without ambiguity; make conversion explicit.
- Preserve existing working behavior unless the task explicitly requests a breaking change.
- Avoid introducing French localization unless specifically requested.
- Prefer modular implementation suitable for incremental PRs.

## Engineering workflow
1. Inspect the current repository state, active branch, relevant files, and existing tests before editing.
2. Reconcile the requested change with existing SATNO-specific code before adding new abstractions.
3. Implement the smallest coherent change that satisfies the requirement.
4. Run the project's existing typecheck, lint, unit, and build commands when available.
5. For UI changes, verify desktop and mobile behavior and RTL alignment.
6. For data-model changes, identify migrations and backward-compatibility implications.
7. Summarize changed files, tests performed, risks, and next deploy/test step.

## High-priority modules
- Persian/RTL navigation and forms
- Jalali date formatting and input
- Rial/Toman formatting
- Project purchase checklist with item, brand, quantity, price, status, source, hidden costs, and total project cost
- Finance module for bank cash, inventory, receivables, liabilities, payroll, insurance, taxes, and monthly balance
- Staff accounts, roles, mobile access, and daily work reports
- Customer import
- Mobile/OTP authentication when infrastructure supports it
- Tender Radar A/B opportunity intake
- Bale Market lead intake

## GitHub discipline
- Never work directly on a protected production branch unless explicitly instructed.
- Use descriptive feature branches.
- Keep commits scoped and explain the intent.
- Prefer draft PRs for incomplete work.
- Do not claim a test passed unless it actually ran successfully.

## Completion report
Return:
- what changed
- affected files/modules
- tests/checks run
- known risks or blockers
- exact next action for testing or deployment

# SATNO CRM — Design Artifact Inventory

Date: 2026-09-27

GitHub write access was restored and verified. This branch archives the design/test/SQL artifacts prepared while write access was unavailable.

These files are **review inputs**. SQL drafts and patches are not automatically production-ready migrations and must be integrated in small tested feature branches.

## Artifact groups

- Upstream sync / Persian / RTL
- Central money formatting
- Project + Costing + Procurement
- Finance / Cash / Anti-double-counting
- Inventory ledger and Project consumption
- Receivables / Payables / Settlements
- Management dashboard and monthly reporting
- Staff accounts / RBAC / Daily Work Reports
- Phone/SMS OTP architecture
- Export / Backup / Restore / self-host migration
- Lead / Opportunity Intelligence
- Lead conversion and Deal provenance
- Lead Inbox mobile/RTL UI design

## Current integration order

1. controlled upstream sync
2. Persian/RTL foundation
3. central money formatter
4. Project + Costing
5. Finance / Inventory / obligations
6. Staff/RBAC/Daily Reports
7. Phone/SMS OTP
8. Backup/portability
9. Leads and source adapters

## Safety

No production secret, final deployment, destructive migration, or merge to `satno-development` is performed by this archive commit.

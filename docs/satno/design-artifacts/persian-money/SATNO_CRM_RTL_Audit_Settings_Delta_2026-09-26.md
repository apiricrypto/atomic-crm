# SATNO CRM — RTL Audit Delta: Settings Pages
Date: 2026-09-26

New upstream files reviewed:

- `src/components/atomic-crm/settings/SettingsPage.tsx`
- `src/components/atomic-crm/settings/SettingsPageMobile.tsx`

Safe additions to the previous RTL patch set:

## Desktop Settings

```text
text-left -> text-start
mr-1 -> me-1
```

There are two `mr-1` icon-spacing cases: Reset and Save.

Keep the sticky footer geometry:

```text
left-0 right-0
```

unchanged because it is symmetric.

## Mobile Settings

Change:

```text
mr-3 -> me-3
```

for password/logout icon spacing.

The About-row:

```tsx
<ChevronRight ... />
```

is a navigation chevron and should be mirrored locally in RTL:

```tsx
<ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
```

Do not globally mirror all chevrons.

## Inline editor

Current:

```text
text-right
```

on the text/email input is a physical alignment.

Recommended first pass:

```text
text-start
```

or no forced text alignment, then smoke-test email/name editing in Persian and English.

This is especially important for email addresses because bidi behavior differs from Persian names.

For email inputs, consider adding:

```text
dir="ltr"
```

at the field level while keeping the surrounding form RTL.

That should be tested separately instead of applying a global LTR rule to all inline values.

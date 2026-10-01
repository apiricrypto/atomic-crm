# Project Agent Skills

این پوشه Skillهای پروژه‌ای SATNO CRM را برای Codex و Agentهای سازگار با استاندارد Agent Skills نگه می‌دارد.

## SATNO-local
- `satno-crm-developer`
- `frontend-design`
- `webapp-testing`
- `mcp-builder`

منبع: `apiricrypto/satno-agent-skills`

## Upstream
- `supabase` — `supabase/agent-skills` — MIT
- `vercel-react-best-practices` — `vercel-labs/agent-skills` — MIT
- `playwright-cli` — `microsoft/playwright` — Apache-2.0

## مسیر استاندارد
Skillهای پروژه در مسیر `.agents/skills/<skill-name>/SKILL.md` قرار دارند.

## Playwright
پروژه از قبل `playwright`، `@playwright/test`، `@playwright/mcp` و تست demo را دارد؛ بنابراین برای نصب Skill تغییری در dependencyهای runtime ایجاد نشده است.

## Update policy
- Skillهای اختصاصی SATNO به‌صورت خودکار با upstream جایگزین نشوند.
- Skillهای خارجی قبل از update از نظر breaking change، license و سازگاری با نسخه‌های پروژه بررسی شوند.

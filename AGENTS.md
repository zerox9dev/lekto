# AGENTS.md — Lekto AI Agent Guide

This is the **primary entry point** for AI agents working on this codebase.
Read this file first, then navigate to specific docs as needed.

---

## What is Lekto?

A **universal single-user web app for any tutor** — languages, math, music, coding, etc.
- Manage students, lessons, and homework assignments
- Multiple subjects per tutor (configurable in settings)
- Fully configurable: currency, timezone, default duration — all per tutor
- Only one user (the tutor) — no student-facing portal in MVP
- Stack: Next.js 14 (App Router), Supabase, TypeScript, Tailwind CSS, shadcn/ui

---

## Quick Start (new developer)

```bash
# 1. Bootstrap
npx create-next-app -e with-supabase lekto
cd lekto && npm install

# 2. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add sidebar button input table dialog select badge skeleton form sonner

# 3. Extra packages
npm install react-hook-form zod @hookform/resolvers date-fns @tanstack/react-table

# 4. Supabase migrations (run in order in SQL editor)
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_seed_dev.sql  ← dev only

# 5. Env
cp .env.example .env.local
# Fill: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Repo Structure

```
/
├── app/
│   ├── (auth)/login/
│   └── (dashboard)/
│       ├── dashboard/
│       ├── students/
│       ├── lessons/
│       ├── homework/
│       └── settings/
├── components/
│   ├── ui/              # shadcn/ui — DO NOT EDIT
│   ├── shared/          # App-wide reusable
│   ├── students/
│   ├── lessons/
│   └── homework/
├── lib/
│   ├── supabase/        # client.ts + server.ts
│   ├── hooks/
│   ├── utils/
│   └── validations/     # zod schemas
├── types/index.ts
├── .docs/               # ← YOU ARE HERE
│   ├── AGENTS.md
│   ├── ARCHITECTURE.md
│   ├── STYLEGUIDE.md
│   ├── COMPONENTS.md
│   └── pages/
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_rls_policies.sql
        └── 003_seed_dev.sql
```

---

## Key Docs

| File | When to read |
|------|-------------|
| `ARCHITECTURE.md` | Before touching DB, auth, or data fetching |
| `STYLEGUIDE.md` | Before writing any UI code |
| `COMPONENTS.md` | Before creating or reusing a component |
| `pages/[page].md` | Before working on a specific page |

---

## Core Rules for Agents

### Never break these:
1. **Auth guard** — all `(dashboard)/` routes require Supabase session. Middleware must stay.
2. **RLS is security** — never use service role key on client. Never skip RLS.
3. **Universal platform** — no hardcoded subject names (Polish, English, etc.). Everything driven by `subjects` table.
4. **No student portal** — MVP is tutor-only. Don't add student-facing routes.
5. **TypeScript strict** — no `any`. All types in `/types/index.ts`.
6. **Currency/locale** — read from `tutor_settings`. Never hardcode "zł" or any currency symbol.

### Patterns:
- Server Components fetch data → pass as props to Client Components
- Mutations: Client Components → supabase browser client → `toast()` feedback
- Forms: `react-hook-form` + `zod` always
- Loading: `loading.tsx` + `<Skeleton>`
- Empty lists: `<EmptyState>` shared component

---

## Data Model

```
tutor_settings          subjects
--------------          --------
user_id (1:1 auth)      id
display_name            tutor_id
default_price           name
default_duration        color (hex)
currency
timezone

students                lessons                 homework
--------                -------                 --------
id                      id                      id
tutor_id                student_id (FK)         student_id (FK)
name                    subject_id (FK)         lesson_id (FK null)
contact                 scheduled_at            description
level                   duration_min            deadline
subject_id (FK)         topic                   status
price_per_hour          notes                   teacher_comment
notes                   status                  file_url
status                  is_paid
```

Full SQL → `supabase/migrations/001_initial_schema.sql`

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never expose to client
```

---

## Common Tasks

| Task | Start here |
|------|-----------|
| Add field to form | `pages/[page].md` → zod schema in `lib/validations/` → component |
| Add/manage subjects | `/settings` page — `subjects` table |
| Change currency display | Read from `tutor_settings.currency`, format with `Intl.NumberFormat` |
| New DB schema change | New numbered migration file → update `types/index.ts` |
| Fix bug on a page | Read `pages/[page].md` first |

# Lekto

Universal tutor management platform. Manage students, lessons, and homework in one place.

**lekto.app** · Built with Next.js 16, Supabase, Radix UI, Tailwind CSS

---

## Features

- Student profiles with levels, contacts, pricing
- Lesson scheduling and notes
- Homework assignments with file attachments
- Dashboard with today's schedule and pending reviews
- Multi-subject support (any language, subject, or skill)
- Single-user — built for solo tutors

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| UI Primitives | Radix UI |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + zod |
| Icons | Lucide React |
| Toasts | Sonner |
| Hosting | Vercel |

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-org/lekto
cd lekto
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run Supabase migrations (in order)
# Open Supabase SQL editor and run:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_seed_dev.sql  ← dev only

# 4. Start dev server
npm run dev
```

## Project Structure

```
app/
├── (auth)/login/          # Login page
└── (dashboard)/           # Protected routes
    ├── dashboard/
    ├── students/
    ├── lessons/
    ├── homework/
    └── settings/
components/
├── ui/                    # Base primitives (Button, Input, Modal...)
├── shared/                # App-wide (Sidebar, PageHeader, StatusBadge...)
├── students/
├── lessons/
└── homework/
lib/
├── supabase/              # server.ts + client.ts
├── utils/                 # format.ts (currency, dates)
└── validations/           # zod schemas
types/index.ts             # all TypeScript types
supabase/migrations/       # SQL migration files
.docs/                     # full project documentation
```

## Documentation

All project docs live in `.docs/`:

| File | Contents |
|------|---------|
| `.docs/AGENTS.md` | Entry point for AI agents — read first |
| `.docs/ARCHITECTURE.md` | Auth, DB schema, data fetching patterns |
| `.docs/STYLEGUIDE.md` | Design tokens, Radix styling, component classes |
| `.docs/COMPONENTS.md` | Component hierarchy and API reference |
| `.docs/pages/*.md` | Per-page documentation |

## Design

Minimalist hybrid of cal.com and Preply.
White backgrounds, hairline borders, indigo accent, Inter font.

## License

MIT

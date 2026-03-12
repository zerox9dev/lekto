# AGENTS.md — Entry Point for AI Agents

> Read this FIRST before touching any code.

## Step 1: Read Architecture

```
docs/ARCHITECTURE.md
```

This is the single source of truth. It contains:
- Project structure (feature-based)
- DB schema (all tables, types, RLS)
- Code rules (DRY, file limits, patterns)
- Style guide (cream palette, no shadows, no dark mode)

## Project

**Lekto** — платформа для репетиторів: уроки, інтерактивні домашки, курси.
URL: https://lekto.online
Repo: github.com/zerox9dev/lekto

## Stack

Vite 7 + React 19 + TypeScript 5.9 + Tailwind v4 + Radix UI + Supabase

## Structure (Feature-Based)

```
src/
├── lib/db.ts              # ALL DB operations go here (insert/update/remove/query)
├── lib/supabase.ts        # Supabase client singleton
├── features/
│   ├── students/store.ts  # useStudents()
│   ├── lessons/store.ts   # useLessons()
│   ├── courses/store.ts   # useCourses()
│   ├── homework/store.ts  # useHomework()
│   ├── store.ts           # useStore() — unified wrapper (pages import this)
│   └── courses/data/      # Starter course content
├── components/            # Shared: SectionPlayer, SectionsEditor
├── pages/                 # Thin route pages (compose features)
├── types/database.ts      # All entity types
└── test/                  # Excluded from build
```

## Hard Rules

1. **Read `docs/ARCHITECTURE.md` before ANY change**
2. **DRY** — no duplicate DB logic, use `lib/db.ts` only
3. **Feature isolation** — features don't import from each other
4. **`await` all DB writes** — no fire-and-forget
5. **`null` not `""`** — nullable fields use null, never empty string
6. **No `"local"`** — tutor_id comes from auth, never hardcoded
7. **No localStorage** — Supabase only (templates are in-memory exception)
8. **No `._saved` / `._dbPromise` hacks** — clean async functions
9. **150 lines max** per file (200 for complex components)
10. **No force push** — ever
11. **No dark mode** — light theme only
12. **CSS Modules on landing** — Tailwind only in cabinet
13. **Radix UI** — not shadcn
14. **No shadows, no gradients** — flat, cream palette
15. **Git author**: `zerox9dev <zerox9dev.work@icloud.com>`

## DB Operations

```typescript
// ALWAYS use lib/db.ts helpers:
import { insert, update, remove, query } from '@/lib/db'

// Insert/upsert
await insert('lessons', lessonObject)

// Update
await update('lessons', id, { title: 'New title' })

// Delete
await remove('lessons', id)

// Query
const lessons = await query<Lesson>('lessons', { tutor_id: id }, { col: 'date', asc: false })
```

## License

Proprietary — All Rights Reserved. See LICENSE file.

# ARCHITECTURE.md — Lekto

## Overview

```
Browser
  └── Next.js 14 App Router (Vercel)
        ├── Server Components → Supabase server client (SSR)
        ├── Client Components → Supabase browser client (mutations)
        └── middleware.ts (auth guard)
              └── Supabase (PostgreSQL + Auth + Storage + RLS)
```

---

## Auth Flow

1. `/login` — unauthenticated entry point
2. Supabase Auth (email + password) → session cookie
3. `middleware.ts` checks session on every `(dashboard)/*` route
4. No session → redirect to `/login`

```ts
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}
export const config = { matcher: ['/dashboard/:path*'] }
```

---

## Supabase Clients — Two Instances

```ts
// lib/supabase/server.ts — Server Components, Route Handlers only
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export const supabaseServer = () => createServerComponentClient({ cookies })

// lib/supabase/client.ts — Client Components only
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const supabaseClient = createClientComponentClient()
```

**Never mix them.** Never import `server.ts` in a Client Component.

---

## Data Fetching Pattern

```tsx
// Server Component — page.tsx
export default async function StudentsPage() {
  const supabase = supabaseServer()
  const { data: students, error } = await supabase
    .from('students')
    .select('*, subjects(name, color)')
    .eq('status', 'active')
    .order('name')
  if (error) throw error
  return <StudentsList students={students} />
}

// Client Component — mutation
'use client'
const supabase = supabaseClient()
const { error } = await supabase.from('students').insert(data)
if (error) toast.error(error.message)
else router.push('/students')
```

---

## Database Schema

See full SQL in `supabase/migrations/001_initial_schema.sql`.

### Key design decisions:

**subjects table** — makes the platform universal. A tutor can teach Polish, English, Math — each as a separate subject with a color. Students and lessons are linked to a subject.

**tutor_settings** — single row per tutor. Stores `currency`, `timezone`, `default_price`, `default_duration`. All UI formatting reads from here, never hardcoded.

**lessons.subject_id** — nullable FK. Allows lessons without a subject if tutor prefers.

**homework.lesson_id** — nullable FK. Homework can be standalone, not tied to a lesson.

### Types (TypeScript)

```ts
// types/index.ts

export type StudentStatus = 'active' | 'archived'
export type LessonStatus  = 'planned' | 'done' | 'cancelled'
export type HomeworkStatus = 'assigned' | 'submitted' | 'reviewed'

export interface TutorSettings {
  id: string
  user_id: string
  display_name: string | null
  default_price: number | null
  default_duration: number
  currency: string       // 'USD', 'EUR', 'PLN', 'UAH', etc.
  timezone: string
}

export interface Subject {
  id: string
  tutor_id: string
  name: string
  color: string
}

export interface Student {
  id: string
  tutor_id: string
  name: string
  contact: string | null
  level: string | null   // free text: A1–C2 or custom
  subject_id: string | null
  price_per_hour: number | null
  notes: string | null
  status: StudentStatus
  created_at: string
  updated_at: string
  // joined
  subjects?: Subject
}

export interface Lesson {
  id: string
  student_id: string
  subject_id: string | null
  scheduled_at: string
  duration_min: number
  topic: string | null
  notes: string | null
  status: LessonStatus
  is_paid: boolean
  created_at: string
  updated_at: string
  // joined
  students?: Pick<Student, 'id' | 'name' | 'level'>
  subjects?: Subject
}

export interface Homework {
  id: string
  student_id: string
  lesson_id: string | null
  description: string
  deadline: string | null
  status: HomeworkStatus
  teacher_comment: string | null
  file_url: string | null
  created_at: string
  updated_at: string
  // joined
  students?: Pick<Student, 'id' | 'name'>
}
```

---

## Currency Formatting

**Never hardcode currency symbols.** Always read from `tutor_settings`:

```ts
// lib/utils/format.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

// Usage: formatCurrency(30, 'PLN') → "PLN 30"
// Usage: formatCurrency(30, 'USD') → "$30"
```

---

## File Storage

Bucket: `homework-files` (private)
Path pattern: `{user_id}/{student_id}/{timestamp}_{filename}`

```ts
// Upload
const path = `${userId}/${studentId}/${Date.now()}_${file.name}`
await supabase.storage.from('homework-files').upload(path, file)

// Signed URL (1 hour)
const { data } = await supabase.storage
  .from('homework-files')
  .createSignedUrl(path, 3600)
```

---

## Error Handling

| Context | Pattern |
|---------|---------|
| Server Component | `throw error` → caught by `error.tsx` boundary |
| Client mutation | `toast.error(error.message)` |
| Form validation | zod inline errors via `react-hook-form` |
| Not found | `notFound()` from `next/navigation` |

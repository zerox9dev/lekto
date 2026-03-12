# ARCHITECTURE.md — Lekto Project Structure & Rules

> Цей файл — єдине джерело правди про архітектуру проекту.
> Перед будь-якою зміною — звірся з ним. Після змін — оновити якщо потрібно.

---

## Стек

| Шар | Технологія |
|-----|-----------|
| Framework | Vite 7 + React 19 |
| Мова | TypeScript 5.9 (strict) |
| Стилі (лендінг) | CSS Modules |
| Стилі (кабінет) | Tailwind CSS v4 |
| UI компоненти | Radix UI primitives (НЕ shadcn) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Auth | Google OAuth через Supabase |
| State | Feature-scoped stores (custom hooks) |
| Routing | react-router-dom v7 |
| Тести | Vitest + @testing-library/react |
| Деплой | Vercel (auto-deploy з main) |
| Шрифт | Inter (Google Fonts в index.html) |

---

## Структура проекту (Feature-Based)

Базується на [Bulletproof React](https://github.com/alan2207/bulletproof-react) — feature-based архітектура.

```
src/
├── app/                    # Application layer
│   ├── App.tsx             # Router setup
│   ├── main.tsx            # Entry point
│   ├── provider.tsx        # Global providers (Auth, etc.)
│   └── router.tsx          # Route definitions
│
├── components/             # SHARED reusable UI components
│   ├── section-player.tsx  # Interactive section player (quiz, cards, etc.)
│   ├── section-editor.tsx  # Section editor for tutors
│   └── ui/                 # Generic UI primitives (Button, Modal, Input)
│
├── features/               # Feature modules (core business logic)
│   ├── auth/               # Authentication
│   │   ├── hooks/          # useAuth, useSession
│   │   └── components/     # LoginPage, AuthGuard
│   │
│   ├── students/           # Students management
│   │   ├── api.ts          # Supabase queries (students table)
│   │   ├── hooks.ts        # useStudents, useStudent
│   │   ├── store.ts        # Student state management
│   │   ├── types.ts        # Student-specific types
│   │   └── components/     # StudentCard, StudentList, StudentDetail
│   │
│   ├── lessons/            # Lessons management
│   │   ├── api.ts          # Supabase queries (lessons table)
│   │   ├── hooks.ts        # useLessons, useLesson
│   │   ├── store.ts        # Lesson state
│   │   ├── types.ts        # Lesson types
│   │   └── components/     # LessonCard, LessonEditor
│   │
│   ├── courses/            # Courses management
│   │   ├── api.ts          # Supabase queries (courses table)
│   │   ├── hooks.ts        # useCourses, useCourse
│   │   ├── store.ts        # Course state
│   │   ├── types.ts        # Course types
│   │   ├── data/           # Starter courses (starter-courses.ts)
│   │   └── components/     # CourseCard, CourseDetail, CourseView (public)
│   │
│   ├── homework/           # Homework management
│   │   ├── api.ts          # Supabase queries (homework table)
│   │   ├── hooks.ts        # useHomework
│   │   ├── store.ts        # Homework state
│   │   ├── types.ts        # HomeworkSection types
│   │   └── components/     # HomeworkList, HomeworkEditor
│   │
│   └── enrollments/        # Student-Course enrollments
│       ├── api.ts
│       ├── hooks.ts
│       └── types.ts
│
├── hooks/                  # SHARED hooks (useDebounce, useMediaQuery, etc.)
│
├── lib/                    # Preconfigured libraries
│   ├── supabase.ts         # Supabase client singleton
│   └── db.ts               # Typed DB helpers (insert, update, remove, query)
│
├── pages/                  # Route pages (thin — compose features)
│   ├── landing.tsx          # / — public landing
│   ├── landing.module.css
│   ├── login.tsx            # /login
│   ├── student-view.tsx     # /s/:shareId — public student portal
│   ├── course-view.tsx      # /c/:shareId — public course view
│   └── app/                 # /app/* — authenticated cabinet
│       ├── layout.tsx       # Sidebar + nav + outlet
│       ├── dashboard.tsx
│       ├── students.tsx
│       ├── student-detail.tsx
│       ├── courses.tsx
│       ├── course-detail.tsx
│       ├── lessons.tsx
│       ├── homework-list.tsx
│       ├── section-editor.tsx
│       └── settings.tsx
│
├── types/                  # SHARED types
│   └── database.ts         # All DB entity types (Student, Lesson, Course, Homework, etc.)
│
├── utils/                  # SHARED utility functions
│   └── cn.ts               # className merger
│
└── test/                   # Test files (excluded from build)
```

---

## Правила потоку даних (Unidirectional)

```
lib/ → types/ → features/ → pages/ → app/
 ↑                ↑            ↑
 └── components/ ─┘            │
 └── hooks/ ──────────────────┘
```

- **lib/** — базові бібліотеки, нічого не імпортують з features/pages
- **types/** — тільки типи, нічого не імпортують
- **features/** — імпортують з lib/, types/, components/, hooks/
- **features/** — НЕ імпортують одна з одної (composе на рівні pages)
- **pages/** — імпортують з features/ і components/
- **app/** — імпортує з pages/

---

## Database Layer (lib/db.ts)

Один файл з типізованими хелперами — всі features використовують його:

```typescript
// lib/db.ts
import { supabase } from './supabase'

const db = () => {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase as any
}

export async function insert<T>(table: string, row: T): Promise<T> {
  const { data, error } = await db().from(table).upsert(row, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data
}

export async function update(table: string, id: string, patch: Record<string, any>) {
  const { error } = await db().from(table).update(patch).eq('id', id)
  if (error) throw error
}

export async function remove(table: string, id: string) {
  const { error } = await db().from(table).delete().eq('id', id)
  if (error) throw error
}

export async function query<T>(table: string, filters?: Record<string, any>, order?: { col: string, asc: boolean }): Promise<T[]> {
  let q = db().from(table).select()
  if (filters) Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v) })
  if (order) q = q.order(order.col, { ascending: order.asc })
  const { data, error } = await q
  if (error) throw error
  return data || []
}
```

---

## Feature Store Pattern

Кожна feature має свій store — lightweight custom hook:

```typescript
// features/students/store.ts
import { useState, useCallback, useEffect } from 'react'
import { insert, update, remove, query } from '@/lib/db'
import type { Student } from '@/types/database'

let _students: Student[] = []
let _loaded = false
const _listeners = new Set<() => void>()
const notify = () => _listeners.forEach(fn => fn())

export function useStudents(tutorId?: string) {
  const [, rerender] = useState(0)

  useEffect(() => {
    const fn = () => rerender(t => t + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])

  // Load once
  useEffect(() => {
    if (_loaded || !tutorId) return
    _loaded = true
    query<Student>('students', { tutor_id: tutorId }, { col: 'created_at', asc: false })
      .then(data => { _students = data; notify() })
  }, [tutorId])

  const add = useCallback(async (name: string, telegram?: string) => {
    const s: Student = { id: crypto.randomUUID(), name, telegram: telegram || null, ... }
    _students = [s, ..._students]
    notify()
    await insert('students', s)  // await! не fire-and-forget
    return s
  }, [])

  return { students: _students, add, update: ..., remove: ... }
}
```

**Ключові правила:**
1. **`await` для всіх DB writes** — без fire-and-forget
2. **Optimistic updates** — UI оновлюється одразу, DB пише паралельно
3. **Один store per feature** — не змішувати students і courses в одному файлі
4. **Notify pattern** — простий pub/sub замість Zustand/Redux

---

## Supabase DB Schema

### students
| Поле | Тип | Nullable | Опис |
|------|-----|----------|------|
| id | UUID PK | NO | |
| name | TEXT | NO | Ім'я учня |
| telegram | TEXT | YES | Контакт |
| share_id | TEXT UNIQUE | NO | Slug для /s/:shareId |
| tutor_id | TEXT | NO | auth.uid() |
| created_at | TIMESTAMPTZ | NO | |

### courses
| Поле | Тип | Nullable | Опис |
|------|-----|----------|------|
| id | UUID PK | NO | |
| title | TEXT | NO | |
| description | TEXT | YES | |
| share_id | TEXT UNIQUE | NO | Slug для /c/:shareId |
| tutor_id | TEXT | NO | auth.uid() |
| created_at | TIMESTAMPTZ | NO | |

### lessons
| Поле | Тип | Nullable | Опис |
|------|-----|----------|------|
| id | UUID PK | NO | |
| title | TEXT | NO | |
| date | DATE | NO | |
| notes | TEXT | YES | Конспект |
| sections | JSONB | YES | Інтерактивні секції |
| student_id | UUID FK → students | **YES** | NULL для курсових уроків |
| course_id | UUID FK → courses | **YES** | NULL для індивідуальних |
| order_index | INT | NO | Порядок в курсі (default 0) |
| tutor_id | TEXT | NO | auth.uid() |
| materials_url | TEXT | YES | |
| created_at | TIMESTAMPTZ | NO | |

### homework
| Поле | Тип | Nullable | Опис |
|------|-----|----------|------|
| id | UUID PK | NO | |
| lesson_id | UUID FK → lessons | NO | CASCADE |
| student_id | UUID FK → students | NO | CASCADE |
| tutor_id | TEXT | NO | auth.uid() |
| title | TEXT | NO | |
| sections | JSONB | NO | HomeworkSection[] |
| completed | BOOLEAN | NO | default false |
| student_answers | JSONB | YES | |
| scores | JSONB | YES | |
| created_at | TIMESTAMPTZ | NO | |

### enrollments (нова)
| Поле | Тип | Nullable | Опис |
|------|-----|----------|------|
| id | UUID PK | NO | |
| course_id | UUID FK → courses | NO | CASCADE |
| student_id | UUID FK → students | NO | CASCADE |
| enrolled_at | TIMESTAMPTZ | NO | |
| UNIQUE(course_id, student_id) | | | |

### RLS Pattern
```sql
-- Репетитор: повний доступ до своїх даних
FOR ALL TO authenticated USING (tutor_id = auth.uid()::text)

-- Anon: тільки читання (публічні сторінки)
FOR SELECT TO anon USING (true)

-- Anon: оновлення homework (учень відправляє відповіді)
FOR UPDATE ON homework TO anon USING (true)
```

---

## Правила коду (ОБОВ'ЯЗКОВО)

### Файли
- **Максимум 150 рядків** на файл (200 для складних компонентів)
- Один файл = одна відповідальність
- Іменування: `kebab-case.ts` для файлів, `PascalCase` для компонентів

### DRY
- **Ніякого дублювання** DB логіки — тільки через `lib/db.ts`
- **Ніяких fallback** на localStorage, `"local"`, `""` — тільки Supabase
- Спільні компоненти в `components/`, feature-specific в `features/*/components/`
- Типи в одному місці: `types/database.ts`

### DB операції
- **Завжди `await`** для writes (insert, update, delete)
- **Optimistic updates** — UI оновлюється до await (але await обов'язковий)
- **Ніяких `as any` cast** для Supabase — використовувати typed helpers
- **Ніяких `._saved`, `._dbPromise`** хаків — чисті async функції

### Auth
- Google OAuth only
- `tutor_id = auth.uid()` для всіх записів
- Публічні сторінки (`/s/`, `/c/`) працюють через anon role

### Стилі
- Лендінг: CSS Modules only
- Кабінет: Tailwind v4 + Radix UI
- БЕЗ shadcn, БЕЗ тіней, БЕЗ dark mode
- Cream palette: `#f5f3ee`, `#f0ede6`, `#e8e5de`, `#1a1a1a`, `#888`

### Git
- Author: `zerox9dev <zerox9dev.work@icloud.com>`
- Ніколи не force push
- Тести виключені з білду (`tsconfig.app.json` exclude)

---

## Секції домашок (HomeworkSection)

| type | Опис | Оцінюється | Content type |
|------|------|-----------|-------------|
| `quiz` | Тест з варіантами | ✅ | `QuizQuestion[]` |
| `fill_blanks` | Пропуски в тексті | ✅ | `FillBlanksContent` |
| `matching` | З'єднати пари | ✅ | `MatchingContent` |
| `ordering` | Розставити по порядку | ✅ | `OrderingContent` |
| `true_false` | Правда/неправда | ✅ | `TrueFalseContent` |
| `open_answer` | Відкрита відповідь | ❌ | `OpenAnswerContent` |
| `cards` | Флешкартки | ❌ | `CardsContent` |
| `text` | Текст | ❌ | `{ text: string }` |
| `media` | Файли | ❌ | `MediaContent` |

---

*Оновлено: 2026-03-12*
*Звіряйся з цим файлом ПЕРЕД кожною зміною.*

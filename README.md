# Lekto

Platform for tutors: lessons, interactive homework, courses, and student portals.

**[lekto.online](https://lekto.online)**

## Features

- **Students** — manage student list, each gets a private share link
- **Lessons** — create lesson notes with interactive sections
- **Courses** — group lessons into courses with a public share link
- **Interactive Homework** — 8 types: quiz, fill-in-the-blanks, matching, ordering, true/false, open answer, flashcards, text
- **Auto-grading** — quiz, fill_blanks, matching, ordering, true_false scored automatically
- **Student Portal** — `/s/:shareId` — students access lessons & homework (no account needed)
- **Course Portal** — `/c/:shareId` — public course page with all lessons
- **Starter Courses** — ready-made courses (Polish A1) with 12 lessons and full content
- **Not indexed** — student/course links are private, not crawled by search engines

## Stack

| Layer | Tech |
|-------|------|
| Framework | Vite 7 + React 19 |
| Language | TypeScript 5.9 |
| Styles (landing) | CSS Modules |
| Styles (cabinet) | Tailwind CSS v4 |
| UI Components | Radix UI |
| Backend | Supabase (Auth + Database + Storage + RLS) |
| Auth | Google OAuth |
| Deploy | Vercel |

## Architecture

Feature-based (inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react)):

```
src/
├── lib/db.ts              # Typed DB helpers (single data layer)
├── features/
│   ├── students/store.ts  # Student management
│   ├── lessons/store.ts   # Lesson management
│   ├── courses/store.ts   # Course management
│   ├── homework/store.ts  # Homework management
│   └── store.ts           # Unified hook (useStore)
├── components/            # Shared UI (SectionPlayer, SectionsEditor)
├── pages/                 # Route pages
└── types/database.ts      # Entity types
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full details.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Google OAuth |
| `/app` | Tutor | Dashboard |
| `/app/students` | Tutor | Student list |
| `/app/student/:id` | Tutor | Student detail + lessons |
| `/app/lessons` | Tutor | All lessons |
| `/app/courses` | Tutor | Courses + starter courses |
| `/app/course/:id` | Tutor | Course detail |
| `/app/homework` | Tutor | Homework list |
| `/app/settings` | Tutor | Profile |
| `/s/:shareId` | Student | Student portal (no auth) |
| `/c/:shareId` | Public | Course view (no auth) |

## Interactive Section Types

| Type | Auto-graded | Description |
|------|-------------|-------------|
| `quiz` | ✅ | Multiple choice |
| `fill_blanks` | ✅ | Text with blanks |
| `matching` | ✅ | Connect pairs |
| `ordering` | ✅ | Arrange in order |
| `true_false` | ✅ | True/False statements |
| `open_answer` | ❌ | Free text response |
| `cards` | ❌ | Flashcards (front/back) |
| `text` | ❌ | Informational text |

## License

Copyright (c) 2026 zerox9dev. All Rights Reserved.

See [LICENSE](LICENSE) for details.

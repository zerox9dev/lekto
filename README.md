# Lekto

Simple platform for tutors to create lessons, interactive homework, and share with students.

## Features

- **Students** — manage student list, each gets a private share link
- **Lessons** — create lesson notes and materials per session
- **Interactive Homework** — quiz, fill-in-the-blanks, matching, ordering (auto-graded)
- **Student Portal** — `/s/:shareId` — students see lessons & do homework (no account needed)
- **Not indexed** — student links are private, not crawled by search engines

## Stack

- Vite 7 + React 19 + TypeScript 5.9
- Tailwind CSS v4
- Supabase (auth + database)
- Vercel (deploy)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase credentials
npm run dev
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Google OAuth |
| `/app` | Tutor | Dashboard — students list |
| `/app/lessons` | Tutor | Manage lessons |
| `/app/homework` | Tutor | Manage homework |
| `/app/settings` | Tutor | Profile settings |
| `/s/:shareId` | Student | Student portal (no auth) |

## License

MIT

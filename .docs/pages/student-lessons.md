# Student Page: Lesson History

**Route:** `/student/lessons`
**File:** `app/(student)/lessons/page.tsx`
**Type:** Server Component

---

## Purpose

Student sees chronological history of their lessons with the tutor.

---

## Data Fetched

```ts
supabase.from('lessons')
  .select('*')
  .order('scheduled_at', { ascending: false })
```

---

## Layout

```
┌─────────────────────────────────────┐
│ Мои уроки                           │
├─────────────────────────────────────┤
│ 12 Mar 2026                         │
│  10:00 · 60 мин · Глаголы          │
│  Проведён                           │
│  Заметки репетитора: Прошли спря... │
│                                     │
│ 5 Mar 2026                          │
│  14:00 · 60 мин · Падежи           │
│  Проведён                           │
│                                     │
│ 20 Feb 2026                         │
│  11:00 · Запланирован               │
│  (будущий урок)                     │
└─────────────────────────────────────┘
```

---

## Rules

- Group by date (day separator)
- Future lessons at top with "Предстоящий" badge
- Show tutor's notes only if `status = done` AND notes not empty
- Cancelled lessons shown with muted style, no notes
- Student cannot edit anything on this page — read only

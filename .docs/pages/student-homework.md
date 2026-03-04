# Student Page: Homework

**Route:** `/student/homework`
**File:** `app/(student)/homework/page.tsx`
**Type:** Server Component

---

## Purpose

Student sees all their homework assignments grouped by status.

---

## Data Fetched

```ts
// RLS automatically scopes to this student only
supabase.from('homework')
  .select('*, lessons(topic, scheduled_at)')
  .order('deadline', { ascending: true, nullsLast: true })
```

---

## Layout

```
┌─────────────────────────────────────┐
│ Домашние задания                    │
├─────────────────────────────────────┤
│ ПРОСРОЧЕНО                          │
│  [Card] red border — overdue        │
│                                     │
│ АКТИВНЫЕ                            │
│  [Card] Упр. 3 стр. 45 · до 15 Mar │
│  [Card] Написать эссе · до 18 Mar  │
│                                     │
│ ВЫПОЛНЕННЫЕ                         │
│  [Card muted] ...                  │
└─────────────────────────────────────┘
```

---

## Homework Card (student view)

- Description (2 lines)
- Linked lesson topic if set
- Deadline with overdue indicator
- Status badge
- If `file_url` set by tutor → "📎 Материал" download link
- CTA button based on status:
  - `assigned` → "Сдать задание" → `/student/homework/[id]`
  - `submitted` → "Ожидает проверки" (disabled)
  - `reviewed` → "Посмотреть отзыв" → `/student/homework/[id]`

# Page: Students List

**Route:** `/students`
**File:** `app/(dashboard)/students/page.tsx`
**Type:** Server Component + Client filter

---

## Purpose

Overview of all students. Browse, search, filter, and navigate to individual student.

---

## Data Fetched

```ts
// Default: active students only
supabase.from('students')
  .select(`
    *,
    lessons(count),
    homework(count).filter(status.eq.assigned)
  `)
  .order('name')
```

---

## Layout

```
┌─────────────────────────────────────────────┐
│ Ученики                      [+ Добавить]   │
├─────────────────────────────────────────────┤
│ [SearchInput]  [LevelFilter ▾] [StatusFilter]│
├─────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │StudentCard│ │StudentCard│ │StudentCard│    │
│ └──────────┘ └──────────┘ └──────────┘     │
│ ┌──────────┐ ┌──────────┐                  │
│ │StudentCard│ │StudentCard│                  │
│ └──────────┘ └──────────┘                  │
└─────────────────────────────────────────────┘
```

---

## Filters (client-side)

Filters are applied client-side on already-fetched data (list is small):

- **Search** — filters by `name` (case-insensitive)
- **Level** — A1 / A2 / B1 / B2 / C1 / C2 / Все
- **Status** — Активные / Архив / Все (default: Активные)

---

## StudentCard content

- Name (bold)
- Level badge (e.g. `B2`)
- Contact (icon + text, truncated)
- `price_per_hour` zł
- Active homework count: "3 ДЗ активных"
- Total lessons count
- Click → navigate to `/students/[id]`

---

## Actions

- `+ Добавить` button → `/students/new`
- Click card → `/students/[id]`

---

## Empty State

- No students at all → `<EmptyState>` with "Добавьте первого ученика"
- Filters return nothing → "Нет учеников по выбранным фильтрам" (without action button)

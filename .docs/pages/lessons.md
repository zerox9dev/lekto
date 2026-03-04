# Page: Lessons List

**Route:** `/lessons`
**File:** `app/(dashboard)/lessons/page.tsx`
**Type:** Server Component + Client view toggle

---

## Purpose

View all lessons across all students. Supports two views: table and week calendar.

---

## Data Fetched

```ts
// Default: upcoming + recent (last 30 days + next 30 days)
supabase.from('lessons')
  .select('*, students(id, name, level)')
  .gte('scheduled_at', thirtyDaysAgo)
  .order('scheduled_at', { ascending: false })
```

---

## Layout

```
┌─────────────────────────────────────────────┐
│ Уроки                        [+ Создать]    │
├─────────────────────────────────────────────┤
│ [Таблица] [Неделя]   [Студент ▾] [Статус ▾]│
├─────────────────────────────────────────────┤
│ TABLE VIEW:                                 │
│ Дата/Время  Ученик   Тема      Статус  Опл. │
│ 12 Mar 10:00 Анна    Глаголы   Провед. ✓    │
│ 12 Mar 14:00 Марта   Падежи    Запл.        │
│ 10 Mar 11:00 Анна    Лексика   Провед. ✗    │
├─────────────────────────────────────────────┤
│ WEEK VIEW:                                  │
│ [← Пред.]  12–18 Mar 2026  [След. →]       │
│ Пн  Вт  Ср  Чт  Пт  Сб  Вс                │
│ [lesson block] [lesson block]               │
└─────────────────────────────────────────────┘
```

---

## Views

### Table View
- Columns: Дата, Ученик, Тема, Длительность, Статус, Оплата
- Click row → `/lessons/[id]`
- Sortable by date (default desc)

### Week View
- `<WeekCalendar>` component
- Navigate weeks with prev/next arrows
- Lesson blocks show: time, student name, topic (truncated)
- Click lesson → `/lessons/[id]`

---

## Filters (client-side)

- **Студент** — dropdown of all students
- **Статус** — planned / done / cancelled / Все

---

## Empty State

"Нет уроков за выбранный период" — with optional "Создать урок" button.

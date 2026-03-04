# Page: Homework List

**Route:** `/homework`
**File:** `app/(dashboard)/homework/page.tsx`
**Type:** Server Component + Client filters

---

## Purpose

All homework assignments across all students, filtered by status and student.

---

## Data Fetched

```ts
supabase.from('homework')
  .select('*, students(id, name)')
  .order('deadline', { ascending: true, nullsLast: true })
```

---

## Layout

```
┌────────────────────────────────────────────┐
│ Домашние задания             [+ Добавить]  │
├────────────────────────────────────────────┤
│ [Студент ▾]   [Статус ▾: Задано]           │
├────────────────────────────────────────────┤
│ ПРОСРОЧЕНО (deadline < today, status=assigned)│
│  [HomeworkCard overdue] ← red border      │
│                                            │
│ АКТИВНЫЕ                                   │
│  [HomeworkCard] Анна · Упр. 3 · до 15 Mar │
│  [HomeworkCard] Марта · Эссе · до 18 Mar  │
│                                            │
│ СДАНО (submitted, awaiting review)         │
│  [HomeworkCard highlighted] ...           │
│                                            │
│ ПРОВЕРЕНО                                  │
│  [HomeworkCard muted] ...                 │
└────────────────────────────────────────────┘
```

---

## Grouping

Homework is grouped by status in this order:
1. **Просрочено** — `status = assigned` AND `deadline < today` (red left border)
2. **Активные** — `status = assigned` AND `deadline >= today`
3. **Сдано** — `status = submitted` (highlight — needs action from tutor)
4. **Проверено** — `status = reviewed` (muted, collapsed by default)

---

## HomeworkCard content

- Student name + level badge
- Description (truncated to 2 lines)
- Deadline: "до 15 Mar" or "Просрочено 3 дня назад" in red
- Status badge
- File icon if `file_url` is set
- Click → `/homework/[id]`

---

## Filters

- **Студент** — dropdown list
- **Статус** — Задано / Сдано / Проверено / Все

---

## Empty State

Show per-section: "Нет заданий в этой категории"
If all sections empty: `<EmptyState>` with "Добавить ДЗ" button.

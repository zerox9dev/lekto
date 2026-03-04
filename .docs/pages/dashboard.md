# Page: Dashboard

**Route:** `/dashboard`
**File:** `app/(dashboard)/dashboard/page.tsx`
**Type:** Server Component (data fetched server-side)

---

## Purpose

First screen after login. Quick overview of what needs attention today.

---

## Data Fetched

```ts
// All queries scoped to auth.uid() via RLS
const today = new Date().toISOString().split('T')[0]
const weekEnd = addDays(new Date(), 7).toISOString()

// 1. Today's lessons
supabase.from('lessons')
  .select('*, students(name)')
  .gte('scheduled_at', `${today}T00:00:00`)
  .lte('scheduled_at', `${today}T23:59:59`)
  .order('scheduled_at')

// 2. Upcoming lessons (next 7 days, excluding today)
supabase.from('lessons')
  .select('*, students(name)')
  .gt('scheduled_at', `${today}T23:59:59`)
  .lte('scheduled_at', weekEnd)
  .eq('status', 'planned')
  .order('scheduled_at')
  .limit(5)

// 3. Unreviewed homework
supabase.from('homework')
  .select('*, students(name)')
  .eq('status', 'submitted')
  .order('deadline')

// 4. Unpaid lessons (current month)
supabase.from('lessons')
  .select('*, students(name, price_per_hour)')
  .eq('status', 'done')
  .eq('is_paid', false)
  .gte('scheduled_at', startOfMonth)

// 5. Stats (counts)
supabase.from('students').select('id', { count: 'exact' }).eq('status', 'active')
supabase.from('lessons').select('id', { count: 'exact' }).gte('scheduled_at', startOfMonth).eq('status', 'done')
```

---

## Layout

```
┌─────────────────────────────────────────────┐
│ Доброе утро! [date]                          │
├────────────┬────────────┬────────────────────┤
│ Учеников   │ Уроков     │ Доход (месяц)      │
│ 8          │ 12         │ ~240 zł            │
├────────────┴────────────┴────────────────────┤
│ Уроки сегодня                                │
│  [LessonRow] 10:00 - Анна - Падежи          │
│  [LessonRow] 14:00 - Марта - Глаголы        │
├─────────────────────────────────────────────┤
│ Ближайшие уроки (7 дней)                     │
│  [LessonRow compact] ...                    │
├──────────────────┬──────────────────────────┤
│ Непроверенные ДЗ │ Неоплаченные уроки       │
│  [HomeworkCard]  │  [LessonRow with price]  │
│  [HomeworkCard]  │  [LessonRow with price]  │
└──────────────────┴──────────────────────────┘
```

---

## Components Used

- `<PageHeader title="Dashboard" />` — no action button
- `<StatCard>` — 3 stat cards at top (local component, only on dashboard)
- `<LessonRow>` from `components/lessons/`
- `<HomeworkCard>` from `components/homework/`
- `<EmptyState>` — when sections have no data

---

## Edge Cases

- If no lessons today → show `<EmptyState>` in that section (don't hide section)
- If no unreviewed HW → show "Всё проверено ✓" with green text
- Stats show `0` if no data, never `null` or `undefined`
- Unpaid amount = sum of `price_per_hour * (duration_min / 60)` for each unpaid lesson

---

## Loading State

`app/(dashboard)/dashboard/loading.tsx` — show skeletons for each section block.

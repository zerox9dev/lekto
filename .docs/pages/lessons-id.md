# Page: Lesson Detail

**Route:** `/lessons/[id]`
**File:** `app/(dashboard)/lessons/[id]/page.tsx`
**Type:** Server Component + Client inline edit

---

## Purpose

View and update a specific lesson. Add post-lesson notes, change status, mark payment, create homework.

---

## Data Fetched

```ts
supabase.from('lessons')
  .select('*, students(id, name, level, price_per_hour)')
  .eq('id', id)
  .single()

supabase.from('homework')
  .select('*')
  .eq('lesson_id', id)
  .order('created_at')
```

---

## Layout

```
┌─────────────────────────────────────────────┐
│ ← Назад    Урок: Анна · 12 Mar 10:00        │
├────────────────────┬────────────────────────┤
│ Ученик: Анна       │ Статус: [Запланирован▾]│
│ Дата: 12 Mar 10:00 │ Оплата: [○] Не оплач. │
│ Длительность: 60 мин│                       │
│ Тема: Глаголы      │                       │
├────────────────────┴────────────────────────┤
│ Заметки после урока          [Редактировать]│
│ ┌─────────────────────────────────────────┐ │
│ │ Прошли спряжение глаголов...            │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Домашние задания              [+ Добавить]  │
│  [HomeworkCard] Упр. 5 · Задано             │
└─────────────────────────────────────────────┘
```

---

## Inline Editable Fields

These update instantly on change (no Save button):
- **Статус** — `<Select>` dropdown: planned / done / cancelled
- **Оплата** — `<Checkbox>` or toggle: is_paid

These require explicit save:
- **Заметки** — click "Редактировать" → textarea appears → "Сохранить" button

---

## Actions

| Action | Behavior |
|--------|---------|
| Изменить статус | Instant update via `supabase.update()` + toast |
| Отметить оплату | Instant toggle + toast |
| Редактировать заметки | Inline edit → Save → toast |
| + Добавить ДЗ | Navigate to `/homework/new?lessonId=[id]&studentId=[studentId]` |
| Click HomeworkCard | Navigate to `/homework/[hwId]` |
| Удалить урок | `<ConfirmDialog>` → delete → redirect to `/lessons` |

---

## Business Rules

- Lesson price calculation (shown in UI): `price_per_hour * (duration_min / 60)` — display as info, don't store
- If `status = cancelled`, show muted/greyed out card
- Notes are optional — show placeholder text when empty: "Нет заметок. Нажмите «Редактировать» чтобы добавить."

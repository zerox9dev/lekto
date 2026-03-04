# Page: Student Detail

**Route:** `/students/[id]`
**File:** `app/(dashboard)/students/[id]/page.tsx`
**Type:** Server Component

---

## Purpose

Full profile of a single student: info, lesson history, active homework.

---

## Data Fetched

```ts
// Student profile
supabase.from('students').select('*').eq('id', id).single()

// Lessons (most recent first)
supabase.from('lessons')
  .select('*')
  .eq('student_id', id)
  .order('scheduled_at', { ascending: false })
  .limit(20)

// All homework for this student
supabase.from('homework')
  .select('*')
  .eq('student_id', id)
  .order('created_at', { ascending: false })
```

If student not found → `notFound()`

---

## Layout

```
┌─────────────────────────────────────────────┐
│ ← Назад    Анна Ковальская      [Редактировать] [Архивировать] │
├─────────────────────┬───────────────────────┤
│ Контакт: @anna      │ Уровень: B2           │
│ Цена: 30 zł/час     │ Статус: Активна       │
│ Заметки: ...        │                       │
├─────────────────────┴───────────────────────┤
│ Уроки                        [+ Создать урок]│
│  [LessonRow] 12 Mar · Глаголы · Проведён ✓  │
│  [LessonRow] 5 Mar · Падежи · Проведён ✓    │
│  [LessonRow] 26 Feb · Лексика · Отменён     │
│  [Показать все]                             │
├─────────────────────────────────────────────┤
│ Домашние задания          [+ Добавить ДЗ]   │
│  [HomeworkCard] Упр. 3 стр. 45 · Задано     │
│  [HomeworkCard] Написать сочинение · Сдано  │
│  [HomeworkCard] Пройти тест · Проверено     │
└─────────────────────────────────────────────┘
```

---

## Actions

| Action | Behavior |
|--------|---------|
| Редактировать | Opens edit form inline or navigates to `/students/[id]/edit` |
| Архивировать | `<ConfirmDialog>` → sets `status = 'archived'` → redirect to `/students` |
| + Создать урок | Navigate to `/lessons/new?studentId=[id]` |
| + Добавить ДЗ | Navigate to `/homework/new?studentId=[id]` |
| Click LessonRow | Navigate to `/lessons/[lessonId]` |
| Click HomeworkCard | Navigate to `/homework/[homeworkId]` |
| Показать все | Expand lesson list (remove limit, client-side) |

---

## Business Rules

- Lessons are sorted newest first by default
- Show max 5 lessons initially, "Показать все" to expand
- Homework sections: "Активные" (assigned + submitted) shown first, "Проверенные" collapsed
- If student is archived → show banner: "Ученик в архиве" with "Восстановить" button

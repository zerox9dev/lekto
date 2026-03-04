# Page: Create / Edit Lesson

**Route:** `/lessons/new` | `/lessons/[id]/edit`
**File:** `app/(dashboard)/lessons/new/page.tsx`
**Type:** Server Component shell + `<LessonForm>` Client Component

---

## Purpose

Schedule a new lesson or edit an existing one.

---

## URL Params (pre-fill)

- `?studentId=[uuid]` — pre-selects student in dropdown (from student card "+" button)

---

## Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|---------|
| student_id | select (students list) | valid UUID | ✅ |
| scheduled_at (date) | date picker | future date preferred | ✅ |
| scheduled_at (time) | time input | HH:MM | ✅ |
| duration_min | number | 15–180, step 15 | ✅ default 60 |
| topic | text | max 200 chars | ❌ |
| status | select | planned/done/cancelled | ✅ default planned |
| is_paid | checkbox | — | ❌ default false |

---

## Zod Schema

```ts
// lib/validations/lesson.ts
export const lessonSchema = z.object({
  student_id: z.string().uuid('Выберите ученика'),
  scheduled_at: z.string().min(1, 'Укажите дату и время'),
  duration_min: z.number().min(15).max(180).default(60),
  topic: z.string().max(200).optional(),
  status: z.enum(['planned','done','cancelled']).default('planned'),
  is_paid: z.boolean().default(false),
})
```

---

## Submit Behavior

On success → redirect to `/lessons/[id]`
On error → `toast.error(message)`, stay on form

---

## Layout

```
┌──────────────────────────────────────┐
│ ← Назад    Новый урок                │
├──────────────────────────────────────┤
│ Ученик *                             │
│ [Выберите ученика ▾]                 │
│                                      │
│ Дата *           Время *             │
│ [12.03.2026]     [10:00]             │
│                                      │
│ Длительность     Статус              │
│ [60 мин ▾]       [Запланирован ▾]    │
│                                      │
│ Тема урока                           │
│ [____________________________]       │
│                                      │
│ ☐ Урок оплачен                       │
│                                      │
│               [Отмена] [Сохранить]   │
└──────────────────────────────────────┘
```

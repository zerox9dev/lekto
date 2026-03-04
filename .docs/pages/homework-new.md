# Page: Create / Edit Homework

**Route:** `/homework/new` | `/homework/[id]/edit`
**File:** `app/(dashboard)/homework/new/page.tsx`
**Type:** Server Component shell + `<HomeworkForm>` Client Component

---

## Purpose

Create a homework assignment for a student, optionally linked to a lesson.

---

## URL Params (pre-fill)

- `?studentId=[uuid]` — pre-selects student
- `?lessonId=[uuid]` — pre-selects lesson (+ auto-selects student)

---

## Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|---------|
| student_id | select | valid UUID | ✅ |
| lesson_id | select (lessons of that student) | UUID or null | ❌ |
| description | textarea | min 1, max 2000 | ✅ |
| deadline | date picker | — | ❌ |
| file | file upload | PDF/JPG/PNG, max 10MB | ❌ |

---

## Zod Schema

```ts
// lib/validations/homework.ts
export const homeworkSchema = z.object({
  student_id: z.string().uuid('Выберите ученика'),
  lesson_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(2000),
  deadline: z.string().optional().nullable(),
  file_url: z.string().url().optional().nullable(),
})
```

---

## File Upload Flow

1. User selects file → `<FileUpload>` component triggers upload to Supabase Storage
2. Upload path: `homework-files/{studentId}/{timestamp}_{filename}`
3. On success → `file_url` stored as signed URL path (not full URL)
4. Signed URL generated on display

---

## Lesson Selector Behavior

- When `student_id` is selected, the lesson dropdown loads only that student's lessons
- If no `student_id` → lesson dropdown is disabled + tooltip: "Сначала выберите ученика"
- Lesson dropdown options format: `12 Mar 10:00 — Глаголы`

---

## Submit Behavior

On success → redirect to `/homework/[id]`
On error → `toast.error()`, stay on form

---

## Layout

```
┌───────────────────────────────────────┐
│ ← Назад    Новое домашнее задание     │
├───────────────────────────────────────┤
│ Ученик *                              │
│ [Выберите ученика ▾]                  │
│                                       │
│ Урок (необязательно)                  │
│ [Выберите урок ▾]                     │
│                                       │
│ Описание задания *                    │
│ [_______________________________]     │
│ [_______________________________]     │
│ [_______________________________]     │
│                                       │
│ Дедлайн                               │
│ [15.03.2026]                          │
│                                       │
│ Файл (PDF, JPG, PNG — до 10 МБ)       │
│ [📎 Прикрепить файл]                  │
│                                       │
│               [Отмена] [Сохранить]    │
└───────────────────────────────────────┘
```

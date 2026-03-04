# Page: Add / Edit Student

**Route:** `/students/new` | `/students/[id]/edit`
**File:** `app/(dashboard)/students/new/page.tsx` | `app/(dashboard)/students/[id]/edit/page.tsx`
**Type:** Server Component shell + `<StudentForm>` Client Component

---

## Purpose

Create a new student or edit an existing one. Same form component, different mode.

---

## Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|---------|
| name | text input | min 1 char | ✅ |
| contact | text input | — | ❌ |
| level | select (A1–C2) | enum | ❌ |
| price_per_hour | number input | positive | ❌ |
| notes | textarea | max 1000 chars | ❌ |

---

## Zod Schema

```ts
// lib/validations/student.ts
export const studentSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  contact: z.string().optional(),
  level: z.enum(['A1','A2','B1','B2','C1','C2']).optional(),
  price_per_hour: z.number().positive('Должно быть больше 0').optional(),
  notes: z.string().max(1000).optional(),
})
```

---

## Submit Behavior

**Create mode:**
```ts
const { data, error } = await supabase
  .from('students')
  .insert({ ...formData, tutor_id: user.id })
  .select()
  .single()

if (data) router.push(`/students/${data.id}`)
```

**Edit mode:**
```ts
const { error } = await supabase
  .from('students')
  .update(formData)
  .eq('id', studentId)

if (!error) router.push(`/students/${studentId}`)
```

---

## Layout

```
┌─────────────────────────────────────┐
│ ← Назад    Новый ученик             │
├─────────────────────────────────────┤
│ Имя *                               │
│ [___________________________]       │
│                                     │
│ Контакт (Telegram / телефон)        │
│ [___________________________]       │
│                                     │
│ Уровень        Цена за урок         │
│ [A1 ▾]         [__ zł]              │
│                                     │
│ Заметки                             │
│ [______________________________]    │
│ [______________________________]    │
│                                     │
│                [Отмена] [Сохранить] │
└─────────────────────────────────────┘
```

---

## Notes

- Page is max-w-lg centered — this is a form, not a full-width page
- "Отмена" → `router.back()`
- On successful create → redirect to student's page + `toast.success('Ученик добавлен')`
- On successful edit → redirect to student's page + `toast.success('Изменения сохранены')`

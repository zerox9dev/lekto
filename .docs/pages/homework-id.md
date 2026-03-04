# Page: Homework Detail

**Route:** `/homework/[id]`
**File:** `app/(dashboard)/homework/[id]/page.tsx`
**Type:** Server Component + Client inline actions

---

## Purpose

View and manage a specific homework assignment. Update status, add teacher comment, view/download student file.

---

## Data Fetched

```ts
supabase.from('homework')
  .select('*, students(id, name, level), lessons(id, topic, scheduled_at)')
  .eq('id', id)
  .single()
```

---

## Layout

```
┌─────────────────────────────────────────────┐
│ ← Назад    ДЗ: Анна · Упр. 3 стр. 45       │
├─────────────────────────────────────────────┤
│ Ученик: Анна B2    Статус: [Задано ▾]       │
│ Урок: 12 Mar — Глаголы                      │
│ Дедлайн: 15 Mar 2026                        │
├─────────────────────────────────────────────┤
│ Описание задания                            │
│ Выполните упражнение 3 на странице 45...    │
├─────────────────────────────────────────────┤
│ Файл ученика                                │
│  📄 homework_anna.pdf    [Скачать]          │
├─────────────────────────────────────────────┤
│ Комментарий репетитора    [Редактировать]   │
│ Хорошо выполнено, но обрати внимание...     │
└─────────────────────────────────────────────┘
```

---

## Actions

| Action | Behavior |
|--------|---------|
| Изменить статус | `<Select>` inline → instant update + toast |
| Редактировать комментарий | Inline textarea → "Сохранить" → update |
| Скачать файл | Generate signed URL → open in new tab |
| Удалить ДЗ | `<ConfirmDialog>` → delete record + Storage file → redirect to `/homework` |

---

## Status Transitions

```
assigned → submitted → reviewed
assigned → reviewed (tutor can skip submitted)
```

- Status change is always allowed (no enforced order)
- If no file uploaded: "Ученик не прикрепил файл"
- If deadline passed + status still assigned: show "⚠ Просрочено" badge in red

---

## Notes

- Teacher comment is always editable regardless of status
- File is read-only on this page (upload only on create/edit form)
- If `lesson_id` is set, show clickable link to `/lessons/[lessonId]`

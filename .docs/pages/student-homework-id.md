# Student Page: Homework Detail

**Route:** `/student/homework/[id]`
**File:** `app/(student)/homework/[id]/page.tsx`
**Type:** Server Component + Client upload

---

## Purpose

Student reads assignment, uploads their work, sees teacher's feedback.

---

## Layout

```
┌─────────────────────────────────────┐
│ ← Назад   Упр. 3 стр. 45           │
├─────────────────────────────────────┤
│ Дедлайн: 15 Mar  Статус: Задано     │
├─────────────────────────────────────┤
│ Задание                             │
│ Выполните упражнение 3...           │
│                                     │
│ Файл от репетитора (если есть)      │
│ 📄 task.pdf  [Скачать]              │
├─────────────────────────────────────┤
│ Ваш ответ                           │
│ [📎 Загрузить файл]                 │
│  или                                │
│ [Текстовый ответ...]                │
│                                     │
│              [Сдать задание]        │
├─────────────────────────────────────┤
│ Отзыв репетитора (если есть)        │
│ Хорошо выполнено, но...             │
└─────────────────────────────────────┘
```

---

## Submit Flow

```ts
// 1. Upload file (if provided)
const path = `${userId}/${studentId}/${Date.now()}_${file.name}`
await supabase.storage.from('homework-files').upload(path, file)

// 2. Update homework
await supabase.from('homework').update({
  status: 'submitted',
  file_url: path,  // or null if text only
}).eq('id', homeworkId)
```

---

## Rules

- If `status = reviewed` → show teacher_comment, hide upload form
- If `status = submitted` → show "Ожидает проверки", disable re-submit
- File upload: PDF/JPG/PNG, max 10MB — same `<FileUpload>` component
- Storage path: `homework-files/{tutorUserId}/{studentId}/{timestamp}_{filename}`
  - tutor's userId in path so tutor's storage policies still work

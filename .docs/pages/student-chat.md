# Student Page: Chat

**Route:** `/student/chat` (student) + `/students/[id]/chat` (tutor)
**Files:**
- `app/(student)/chat/page.tsx`
- `app/(dashboard)/students/[id]/chat/page.tsx`
**Type:** Client Component (Supabase Realtime)

---

## Purpose

Simple real-time text chat between tutor and one student.

---

## Data

```ts
// Initial load — last 50 messages
supabase.from('messages')
  .select('*')
  .eq('student_id', studentId)
  .order('created_at', { ascending: true })
  .limit(50)

// Realtime subscription
supabase.channel(`chat:${studentId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `student_id=eq.${studentId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as Message])
  })
  .subscribe()
```

---

## Layout

```
┌─────────────────────────────────────┐
│ Чат с репетитором                   │
├─────────────────────────────────────┤
│                                     │
│  [Репетитор]  Привет! Как дела?     │  ← left aligned
│               12:01                 │
│                                     │
│           Всё хорошо! Готов к уроку │  ← right aligned (own)
│                           12:03  ✓  │
│                                     │
│  [Репетитор]  Отлично, жди ссылку  │
│               12:04                 │
│                                     │
├─────────────────────────────────────┤
│ [________________________] [Отпр.]  │
└─────────────────────────────────────┘
```

---

## Send Message

```ts
await supabase.from('messages').insert({
  student_id: studentId,
  sender_role: isStudent ? 'student' : 'tutor',
  body: text.trim(),
})
// No optimistic update needed — Realtime delivers instantly
```

---

## Read Receipts

When student opens chat → mark all tutor messages as read:
```ts
await supabase.from('messages').update({ read_at: new Date().toISOString() })
  .eq('student_id', studentId)
  .eq('sender_role', 'tutor')
  .is('read_at', null)
```

Tutor sees unread count badge on student card:
```ts
supabase.from('messages')
  .select('id', { count: 'exact' })
  .eq('student_id', studentId)
  .eq('sender_role', 'student')
  .is('read_at', null)
```

---

## Tutor Side

Tutor accesses chat from student card → "Чат" button → `/students/[id]/chat`
Same component, `sender_role = 'tutor'`.

Unread badge shown on `<StudentCard>` when student has unread messages.

---

## Rules

- Max message length: 2000 chars
- No file attachments in chat (use homework for files)
- No pagination in MVP — limit 50, load more button later
- Supabase Realtime must be enabled for `messages` table (see migration 004)

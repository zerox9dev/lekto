# Student Portal — Overview

**Route group:** `app/(student)/`
**Access:** magic link only — no password, no registration
**Isolation:** student sees ONLY their own data (enforced by RLS)

---

## Auth Flow

```
1. Tutor opens student card → clicks "Пригласить"
2. Server generates invite_token (UUID) → saves to students.invite_token
3. Supabase sends magic link email:
   "Ваш репетитор приглашает вас в Lekto → lekto.app/join/[token]"
4. Student clicks link → /join/[token]
5. Server validates token → calls supabase.auth.signInWithOtp({ email })
6. Student gets one-time email code → enters → session created
7. students.auth_user_id = auth.uid() saved
8. Redirect to /student/homework
```

### Invite implementation (server action)
```ts
// app/(dashboard)/students/[id]/actions.ts
export async function inviteStudent(studentId: string) {
  const supabase = supabaseServer()
  const student = await getStudent(studentId)  // must have email

  const token = crypto.randomUUID()
  await supabase.from('students').update({
    invite_token: token,
    invite_sent_at: new Date().toISOString(),
    portal_active: true,
  }).eq('id', studentId)

  await supabase.auth.admin.inviteUserByEmail(student.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/join/${token}`,
  })
}
```

---

## Student Layout

Minimal — not the tutor dashboard. No sidebar.

```
┌──────────────────────────────────────┐
│  Lekto logo    [Выйти]               │ ← topbar only
├──────────────────────────────────────┤
│  [ДЗ]  [Уроки]  [Чат]               │ ← horizontal tab nav
├──────────────────────────────────────┤
│  page content                        │
└──────────────────────────────────────┘
```

---

## Routes

| Route | Page |
|-------|------|
| `/join/[token]` | Magic link landing → auth |
| `/student/homework` | Homework list |
| `/student/homework/[id]` | Homework detail + file upload |
| `/student/lessons` | Lesson history |
| `/student/chat` | Chat with tutor |

---

## Middleware split

```ts
// middleware.ts
// /dashboard/* → requires tutor session
// /student/*   → requires student session (auth_user_id match)
// /join/*      → public
```

Detect role after auth:
```ts
// Check if logged-in user is a tutor or student
const { data: tutorSettings } = await supabase
  .from('tutor_settings').select('id').eq('user_id', uid).maybeSingle()

if (tutorSettings) redirect('/dashboard')
else redirect('/student/homework')
```

---

## Data Access Rules (RLS summary)

| Table | Tutor | Student |
|-------|-------|---------|
| students | Full CRUD own students | SELECT own row only |
| lessons | Full CRUD | SELECT own lessons |
| homework | Full CRUD | SELECT own + UPDATE status/file_url |
| messages | Full CRUD | Full CRUD own conversation |
| subjects | Full CRUD | No access |
| tutor_settings | Own row only | No access |

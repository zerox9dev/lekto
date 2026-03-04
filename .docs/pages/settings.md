# Page: Settings

**Route:** `/settings`
**File:** `app/(dashboard)/settings/page.tsx`
**Type:** Server Component + Client form

---

## Purpose

Tutor profile configuration. Controls defaults used across the app.

---

## Data Fetched

```ts
// Profile stored in a separate table or in user metadata
supabase.auth.getUser()  // for email display

// Tutor settings (separate table)
supabase.from('tutor_settings')
  .select('*')
  .eq('user_id', userId)
  .single()
```

### tutor_settings table

```sql
CREATE TABLE tutor_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES auth.users(id),
  display_name      TEXT,
  default_price     NUMERIC(10,2),
  default_duration  INTEGER DEFAULT 60,
  timezone          TEXT DEFAULT 'Europe/Warsaw',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Form Fields

| Field | Type | Description |
|-------|------|-------------|
| display_name | text | Shown in the app greeting |
| default_price | number | Pre-fills price field on new student |
| default_duration | select (30/45/60/90 min) | Pre-fills lesson duration |
| timezone | select | Used for date/time display |

---

## Layout

```
┌───────────────────────────────────────────┐
│ Настройки                                 │
├───────────────────────────────────────────┤
│ ПРОФИЛЬ                                   │
│ Email: anna@example.com  (только чтение)  │
│                                           │
│ Отображаемое имя                          │
│ [________________________]                │
│                                           │
├───────────────────────────────────────────┤
│ ЗНАЧЕНИЯ ПО УМОЛЧАНИЮ                     │
│                                           │
│ Цена за урок (zł)   Длительность          │
│ [30.00]             [60 мин ▾]            │
│                                           │
│ Часовой пояс                              │
│ [Europe/Warsaw ▾]                         │
│                                           │
├───────────────────────────────────────────┤
│                          [Сохранить]      │
├───────────────────────────────────────────┤
│ АККАУНТ                                   │
│ [Изменить пароль]  [Выйти]                │
└───────────────────────────────────────────┘
```

---

## Actions

| Action | Behavior |
|--------|---------|
| Сохранить | Upsert `tutor_settings` + toast "Настройки сохранены" |
| Изменить пароль | Supabase `auth.updateUser({ password })` — show password change form inline |
| Выйти | `supabase.auth.signOut()` → redirect to `/login` |

---

## Notes

- Email is read-only (from Supabase auth, not editable in MVP)
- `default_price` and `default_duration` are used to pre-fill new lesson/student forms — read from these settings, not hardcoded
- If `tutor_settings` row doesn't exist yet → create on first save (upsert)

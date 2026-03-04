# Google Calendar — импорт уроков в Lekto

## Концепция

Репетитор ведёт расписание в Google Calendar → подключает аккаунт → Lekto
подтягивает события как уроки. Lekto ничего не пишет в Google.

```
Google Calendar ──(read only)──→ Lekto (lessons)
```

---

## Flow подключения (в /settings)

```
1. "Подключить Google Calendar" → /api/auth/google/connect
2. Google OAuth consent (scope: calendar.readonly)
3. Callback → сохранить access_token + refresh_token
4. Lekto делает первичный импорт: события за 30 дней назад + 90 дней вперёд
5. Репетитор видит импортированные уроки в /lessons
6. Далее — авто-синхронизация каждые 15 минут (Supabase cron)
```

---

## Migration: 005_google_calendar.sql

```sql
CREATE TABLE google_calendar_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  calendar_id      TEXT DEFAULT 'primary',
  last_synced_at   TIMESTAMPTZ,
  sync_token       TEXT,   -- Google incremental sync token
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gcal_owner" ON google_calendar_tokens
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Привязка урока к Google Event (чтобы не дублировать при повторном импорте)
ALTER TABLE lessons
  ADD COLUMN google_event_id TEXT,
  ADD COLUMN synced_from_google BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX idx_lessons_google_event ON lessons(google_event_id)
  WHERE google_event_id IS NOT NULL;

CREATE TRIGGER trg_gcal_updated
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## OAuth (read-only scope)

```ts
// app/api/auth/google/connect/route.ts
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

export async function GET() {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
  url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPES.join(' '))
  url.searchParams.set('access_type', 'offline')   // нужен refresh_token
  url.searchParams.set('prompt', 'consent')         // форсировать выдачу refresh_token
  return Response.redirect(url.toString())
}
```

---

## Импорт событий

```ts
// lib/google/importEvents.ts

export async function importGoogleEvents(userId: string) {
  const supabase = supabaseServer()
  const accessToken = await getAccessToken(userId)  // с auto-refresh
  const { data: tokenRow } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Incremental sync — только изменения с прошлого раза
  // Первый раз: syncToken = null → полный импорт за период
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    ...(tokenRow.sync_token
      ? { syncToken: tokenRow.sync_token }
      : {
          timeMin: new Date(Date.now() - 30 * 86400000).toISOString(),
          timeMax: new Date(Date.now() + 90 * 86400000).toISOString(),
        }
    ),
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${tokenRow.calendar_id}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const data = await res.json()

  // Если syncToken протух (410 Gone) → полный ресинк
  if (res.status === 410) {
    await supabase.from('google_calendar_tokens')
      .update({ sync_token: null }).eq('user_id', userId)
    return importGoogleEvents(userId)  // рекурсия с полным импортом
  }

  // Нужен хотя бы один ученик для привязки урока
  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('tutor_id', userId)
    .eq('status', 'active')

  for (const event of data.items ?? []) {
    if (!event.start?.dateTime) continue  // пропускаем all-day события

    // Удалено в Google → отменить урок в Lekto
    if (event.status === 'cancelled') {
      await supabase.from('lessons')
        .update({ status: 'cancelled' })
        .eq('google_event_id', event.id)
      continue
    }

    const scheduledAt = event.start.dateTime
    const endAt = event.end.dateTime
    const durationMin = Math.round(
      (new Date(endAt).getTime() - new Date(scheduledAt).getTime()) / 60000
    )

    // Попытаться угадать ученика по имени в заголовке события
    const matchedStudent = students?.find(s =>
      event.summary?.toLowerCase().includes(s.name.toLowerCase())
    ) ?? null

    await supabase.from('lessons').upsert({
      // upsert по google_event_id — не дублируем
      google_event_id:      event.id,
      synced_from_google:   true,
      student_id:           matchedStudent?.id ?? null,  // null если не угадали
      scheduled_at:         scheduledAt,
      duration_min:         durationMin,
      topic:                event.summary ?? null,
      notes:                event.description ?? null,
      status:               'planned',
      is_paid:              false,
      // tutor_id нельзя ставить напрямую — идёт через student_id → RLS
      // поэтому если student_id = null, урок создаём без ученика (допустимо)
    }, { onConflict: 'google_event_id', ignoreDuplicates: false })
  }

  // Сохранить новый syncToken для следующего инкрементального запроса
  await supabase.from('google_calendar_tokens').update({
    sync_token: data.nextSyncToken ?? null,
    last_synced_at: new Date().toISOString(),
  }).eq('user_id', userId)
}
```

---

## Авто-синхронизация (Supabase cron)

```sql
-- Supabase Dashboard → Database → Extensions → pg_cron
SELECT cron.schedule(
  'sync-google-calendar',
  '*/15 * * * *',   -- каждые 15 минут
  $$
    SELECT net.http_post(
      url := 'https://lekto.app/api/cron/sync-calendar',
      headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'
    );
  $$
);
```

```ts
// app/api/cron/sync-calendar/route.ts
export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response(null, { status: 401 })

  const supabase = supabaseServiceRole()  // нужен service role для перебора всех юзеров
  const { data: tokens } = await supabase
    .from('google_calendar_tokens')
    .select('user_id')

  await Promise.allSettled(
    tokens?.map(t => importGoogleEvents(t.user_id)) ?? []
  )

  return new Response(null, { status: 200 })
}
```

---

## UI — импортированные уроки

В `/lessons` импортированные уроки помечаются иконкой Google:

```
[📅] 12 Mar 10:00 · Анна · Глаголы   ← обычный урок
[G]  14 Mar 11:00 · Урок польского   ← из Google, student_id = null
```

Если `student_id = null` → показать кнопку "Привязать ученика" прямо в строке.

На странице урока (`/lessons/[id]`):
```
Источник: 🔗 Google Calendar  [Открыть в Google ↗]
```

---

## Settings — блок Google Calendar

```
┌───────────────────────────────────────────┐
│ GOOGLE CALENDAR                           │
│                                           │
│ ● Подключён: anna@gmail.com  [Отключить] │
│ Последняя синхронизация: 5 мин назад      │
│                                           │
│ Календарь для импорта: [Основной ▾]       │
│                                           │
│           [Синхронизировать сейчас]       │
└───────────────────────────────────────────┘
```

"Синхронизировать сейчас" → POST `/api/cron/sync-calendar` вручную.

---

## env переменные

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://lekto.app/api/auth/google/callback
CRON_SECRET=                  # случайная строка для защиты cron endpoint
```

---

## Файлы

```
app/api/auth/google/connect/route.ts
app/api/auth/google/callback/route.ts
app/api/cron/sync-calendar/route.ts
lib/google/getAccessToken.ts
lib/google/importEvents.ts
supabase/migrations/005_google_calendar.sql
```

---

## Ограничения MVP

- All-day события пропускаются (нет времени начала)
- Совпадение ученика по имени — эвристика, не гарантия
- Если урок изменён вручную в Lekto → при следующей синхронизации поля перезапишутся из Google
- Отключение Google → уроки с `synced_from_google = true` остаются, не удаляются

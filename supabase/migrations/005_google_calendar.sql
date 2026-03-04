-- Migration: 005_google_calendar.sql
-- Google Calendar — импорт событий в Lekto (read-only интеграция)

CREATE TABLE google_calendar_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  calendar_id      TEXT DEFAULT 'primary',
  last_synced_at   TIMESTAMPTZ,
  sync_token       TEXT,        -- Google incremental sync token
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gcal_owner" ON google_calendar_tokens
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE lessons
  ADD COLUMN google_event_id     TEXT,
  ADD COLUMN synced_from_google  BOOLEAN DEFAULT FALSE;

-- Уникальность по google_event_id — не дублировать при повторном импорте
CREATE UNIQUE INDEX idx_lessons_google_event ON lessons(google_event_id)
  WHERE google_event_id IS NOT NULL;

CREATE TRIGGER trg_gcal_updated
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

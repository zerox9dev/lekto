-- Migration: 001_initial_schema.sql
-- Lekto — универсальная платформа для репетиторов
-- Supabase / PostgreSQL

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- tutor_settings
-- Профиль репетитора. Один ряд на пользователя.
-- ============================================================
CREATE TABLE tutor_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT,
  default_price     NUMERIC(10,2),
  default_duration  INTEGER DEFAULT 60,   -- минуты
  currency          TEXT DEFAULT 'USD',   -- любая валюта: USD, EUR, PLN, UAH...
  timezone          TEXT DEFAULT 'UTC',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- subjects
-- Предметы / языки репетитора.
-- Примеры: "Польский", "Английский", "Математика"
-- ============================================================
CREATE TABLE subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6366F1',  -- hex, для цветовой маркировки
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- students
-- ============================================================
CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  contact         TEXT,                -- Telegram / телефон / email
  level           TEXT,                -- A1–C2 или любой другой формат
  subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
  price_per_hour  NUMERIC(10,2),
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- lessons
-- ============================================================
CREATE TABLE lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER NOT NULL DEFAULT 60,
  topic         TEXT,
  notes         TEXT,                  -- заметки репетитора после урока
  status        TEXT NOT NULL DEFAULT 'planned'
                  CHECK (status IN ('planned', 'done', 'cancelled')),
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- homework
-- ============================================================
CREATE TABLE homework (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES lessons(id) ON DELETE SET NULL,
  description     TEXT NOT NULL,
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'assigned'
                    CHECK (status IN ('assigned', 'submitted', 'reviewed')),
  teacher_comment TEXT,
  file_url        TEXT,                -- путь в Supabase Storage
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_students_tutor     ON students(tutor_id);
CREATE INDEX idx_students_status    ON students(status);
CREATE INDEX idx_lessons_student    ON lessons(student_id);
CREATE INDEX idx_lessons_scheduled  ON lessons(scheduled_at);
CREATE INDEX idx_lessons_status     ON lessons(status);
CREATE INDEX idx_homework_student   ON homework(student_id);
CREATE INDEX idx_homework_lesson    ON homework(lesson_id);
CREATE INDEX idx_homework_status    ON homework(status);
CREATE INDEX idx_homework_deadline  ON homework(deadline);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tutor_settings_updated
  BEFORE UPDATE ON tutor_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_students_updated
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lessons_updated
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_homework_updated
  BEFORE UPDATE ON homework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

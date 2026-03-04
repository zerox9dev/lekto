-- Migration: 004_student_portal.sql
-- Student Portal — invite system, student auth, chat

-- ============================================================
-- students — добавляем поля для портала
-- ============================================================
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS email          TEXT,
  ADD COLUMN IF NOT EXISTS invite_token   UUID,
  ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_active  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auth_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_invite_token
  ON students(invite_token) WHERE invite_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_auth_user_id
  ON students(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- ============================================================
-- homework — добавляем текстовый ответ студента
-- ============================================================
ALTER TABLE homework
  ADD COLUMN IF NOT EXISTS student_comment TEXT;

-- ============================================================
-- messages
-- Чат между репетитором и студентом.
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('tutor', 'student')),
  body        TEXT NOT NULL CHECK (char_length(body) <= 2000),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_student     ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(student_id, sender_role, read_at) WHERE read_at IS NULL;

-- ============================================================
-- RLS — messages (tutor full CRUD, student own conversation)
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Репетитор: полный доступ к сообщениям своих студентов
CREATE POLICY "messages_tutor" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.tutor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.tutor_id = auth.uid()
    )
  );

-- Студент: доступ только к своим сообщениям
CREATE POLICY "messages_student" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = messages.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS — students: студент видит свой ряд
-- ============================================================
CREATE POLICY "students_self" ON students
  FOR SELECT USING (auth_user_id = auth.uid());

-- ============================================================
-- RLS — lessons: студент видит свои уроки
-- ============================================================
CREATE POLICY "lessons_student" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS — homework: студент видит своё ДЗ и может обновить
-- ============================================================
CREATE POLICY "homework_student_select" ON homework
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "homework_student_update" ON homework
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Supabase Realtime — включить для messages
-- Выполнить в Supabase Dashboard → Database → Replication:
--   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ============================================================

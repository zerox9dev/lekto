-- Migration: 004_student_portal.sql
-- Student portal: magic link auth, messages

-- ============================================================
-- Add student auth fields to students table
-- ============================================================
ALTER TABLE students
  ADD COLUMN email          TEXT,
  ADD COLUMN auth_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN invite_token   TEXT UNIQUE,
  ADD COLUMN invite_sent_at TIMESTAMPTZ,
  ADD COLUMN portal_active  BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_students_auth_user ON students(auth_user_id);
CREATE INDEX idx_students_invite_token ON students(invite_token);

-- ============================================================
-- messages
-- Simple chat between tutor and one student.
-- sender_role: 'tutor' | 'student'
-- ============================================================
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('tutor', 'student')),
  body        TEXT NOT NULL CHECK (char_length(body) > 0),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_student    ON messages(student_id);
CREATE INDEX idx_messages_created    ON messages(created_at);

-- ============================================================
-- RLS — messages
-- Tutor: full access to messages where student belongs to them
-- Student: access to messages where auth_user_id = auth.uid()
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Tutor policy
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

-- Student policy
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
-- Update RLS for existing tables — add student self-access
-- Students can read their own row
-- ============================================================
CREATE POLICY "students_self_read" ON students
  FOR SELECT USING (auth_user_id = auth.uid());

-- Students can read their own lessons
CREATE POLICY "lessons_student_read" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

-- Students can read + update their own homework
-- (update: to upload file_url and change status to 'submitted')
CREATE POLICY "homework_student_read" ON homework
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "homework_student_submit" ON homework
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('submitted') -- student can only set status to submitted
  );

-- ============================================================
-- Supabase Realtime — enable for messages
-- Run in Supabase Dashboard: Database → Replication → messages ✓
-- Or via CLI: supabase db push after adding to replication publication
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

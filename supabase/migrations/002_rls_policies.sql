-- Migration: 002_rls_policies.sql
-- Row Level Security — каждый репетитор видит только свои данные

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE tutor_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- tutor_settings — только свой ряд
-- ============================================================
CREATE POLICY "tutor_settings_owner" ON tutor_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- subjects — только свои предметы
-- ============================================================
CREATE POLICY "subjects_owner" ON subjects
  FOR ALL USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- ============================================================
-- students — только свои ученики
-- ============================================================
CREATE POLICY "students_owner" ON students
  FOR ALL USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- ============================================================
-- lessons — через students.tutor_id (нет прямого tutor_id)
-- ============================================================
CREATE POLICY "lessons_owner" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
        AND students.tutor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
        AND students.tutor_id = auth.uid()
    )
  );

-- ============================================================
-- homework — через students.tutor_id
-- ============================================================
CREATE POLICY "homework_owner" ON homework
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.tutor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework.student_id
        AND students.tutor_id = auth.uid()
    )
  );

-- ============================================================
-- Supabase Storage — bucket: homework-files
-- Политики создаются через Supabase Dashboard или CLI:
--
-- INSERT policy: auth.uid()::text = (storage.foldername(name))[1]
-- SELECT policy: auth.uid()::text = (storage.foldername(name))[1]
-- DELETE policy: auth.uid()::text = (storage.foldername(name))[1]
--
-- Структура пути: {user_id}/{student_id}/{timestamp}_{filename}
-- ============================================================

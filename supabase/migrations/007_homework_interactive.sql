-- Migration: 007_homework_interactive.sql
-- Interactive homework: tutor-defined questions + student answers

ALTER TABLE homework
  ADD COLUMN interactive_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN student_answers JSONB NOT NULL DEFAULT '{}'::jsonb;


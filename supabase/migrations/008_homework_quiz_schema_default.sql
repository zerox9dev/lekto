-- Migration: 008_homework_quiz_schema_default.sql
-- Store SurveyJS quiz schema JSON in homework.interactive_tasks

UPDATE homework
SET interactive_tasks = '{}'::jsonb
WHERE jsonb_typeof(interactive_tasks) = 'array';

ALTER TABLE homework
  ALTER COLUMN interactive_tasks SET DEFAULT '{}'::jsonb;


-- Migration: 003_seed_dev.sql
-- Тестовые данные для разработки.
-- ВНИМАНИЕ: запускать только в dev окружении, не в production.
--
-- Использование:
--   1. Создайте пользователя через Supabase Auth (email/password)
--   2. Замените DEV_USER_ID на реальный UUID из auth.users
--   3. Выполните этот файл через Supabase SQL editor

DO $$
DECLARE
  DEV_USER_ID UUID := '00000000-0000-0000-0000-000000000001'; -- ← замените
  s1 UUID := gen_random_uuid();
  s2 UUID := gen_random_uuid();
  s3 UUID := gen_random_uuid();
  sub1 UUID := gen_random_uuid();
  sub2 UUID := gen_random_uuid();
  l1 UUID := gen_random_uuid();
  l2 UUID := gen_random_uuid();
  l3 UUID := gen_random_uuid();
BEGIN

  -- Настройки репетитора
  INSERT INTO tutor_settings (user_id, display_name, default_price, default_duration, currency, timezone)
  VALUES (DEV_USER_ID, 'Dev Tutor', 30.00, 60, 'USD', 'Europe/Warsaw')
  ON CONFLICT (user_id) DO NOTHING;

  -- Предметы
  INSERT INTO subjects (id, tutor_id, name, color) VALUES
    (sub1, DEV_USER_ID, 'Polish',  '#6366F1'),
    (sub2, DEV_USER_ID, 'English', '#10B981');

  -- Ученики
  INSERT INTO students (id, tutor_id, name, contact, level, subject_id, price_per_hour) VALUES
    (s1, DEV_USER_ID, 'Anna Kowalska',  '@anna_tg',  'B2', sub1, 30.00),
    (s2, DEV_USER_ID, 'Marta Nowak',    '@marta_tg', 'A2', sub1, 25.00),
    (s3, DEV_USER_ID, 'John Smith',     '@john_tg',  'B1', sub2, 35.00);

  -- Уроки (относительные даты от NOW())
  INSERT INTO lessons (id, student_id, subject_id, scheduled_at, duration_min, topic, status, is_paid) VALUES
    (l1, s1, sub1, NOW() + INTERVAL '2 hours',  60, 'Przypadki (падежи)',   'planned',  false),
    (l2, s2, sub1, NOW() + INTERVAL '1 day',    60, 'Czasowniki (глаголы)', 'planned',  false),
    (l3, s1, sub1, NOW() - INTERVAL '3 days',   60, 'Słownictwo (лексика)', 'done',     true);

  -- Домашние задания
  INSERT INTO homework (student_id, lesson_id, description, deadline, status) VALUES
    (s1, l3, 'Упр. 3 стр. 45 — написать 10 предложений с падежами',
          (NOW() + INTERVAL '5 days')::date, 'assigned'),
    (s2, l2, 'Выучить 20 глаголов из списка',
          (NOW() + INTERVAL '3 days')::date, 'submitted'),
    (s1, NULL, 'Прочитать текст "Polska historia" и пересказать',
          (NOW() - INTERVAL '1 day')::date, 'assigned');  -- просрочено

END $$;

-- Migration: 006_preply_student_mappings.sql
-- Ручной маппинг имен из Preply к ученикам Lekto

CREATE TABLE preply_student_mappings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preply_name  TEXT NOT NULL,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preply_name)
);

ALTER TABLE preply_student_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preply_mappings_owner" ON preply_student_mappings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_preply_mappings_updated
  BEFORE UPDATE ON preply_student_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

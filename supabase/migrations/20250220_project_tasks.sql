-- =============================================================
-- Migración: Tareas de proyecto + vinculación con horas
-- =============================================================

-- 1. Tabla project_tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user ON project_tasks(user_id);

-- 3. RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON project_tasks FOR ALL
  USING (auth.uid() = user_id);

-- 4. Añadir task_id opcional a project_hours
ALTER TABLE project_hours
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL;

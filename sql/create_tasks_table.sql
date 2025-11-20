-- Crear tabla tasks (tareas de obras)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to TEXT, -- Nombre de la persona asignada (por ahora texto, luego podría ser FK a usuarios)
  estimated_hours NUMERIC(5, 2), -- Horas estimadas
  actual_hours NUMERIC(5, 2), -- Horas reales trabajadas
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean las tareas de sus proyectos
CREATE POLICY "Users can view tasks of their projects"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar tareas en sus proyectos
CREATE POLICY "Users can insert tasks in their projects"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Política para que los usuarios solo puedan actualizar tareas de sus proyectos
CREATE POLICY "Users can update tasks of their projects"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar tareas de sus proyectos
CREATE POLICY "Users can delete tasks of their projects"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);


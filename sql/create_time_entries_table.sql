-- Crear tabla time_entries (control horario)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Usuario que crea el registro
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Trabajador para el que se registra el tiempo (NULL = el mismo usuario)
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME, -- Puede ser NULL si solo se proporcionan horas trabajadas
  end_time TIME,
  duration_minutes INTEGER, -- Duración calculada en minutos
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar si es admin de la empresa del trabajador asignado
CREATE OR REPLACE FUNCTION public.can_manage_time_entry(
  p_assigned_user_id UUID,
  p_creator_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_company_id UUID;
  v_creator_company_id UUID;
BEGIN
  -- Si el creador es el mismo que el asignado, permitir
  IF p_creator_user_id = p_assigned_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Empresa del trabajador asignado (como dueño o miembro)
  SELECT company_id INTO v_company_id
  FROM (
    SELECT id as company_id FROM public.companies WHERE owner_id = p_assigned_user_id
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = p_assigned_user_id
  ) subq
  LIMIT 1;
  
  -- Empresa del creador (como dueño o miembro)
  SELECT company_id INTO v_creator_company_id
  FROM (
    SELECT id as company_id FROM public.companies WHERE owner_id = p_creator_user_id
    UNION
    SELECT company_id FROM public.company_members WHERE user_id = p_creator_user_id
  ) subq
  LIMIT 1;
  
  -- Si no están en la misma empresa, denegar
  IF v_company_id IS NULL OR v_creator_company_id IS NULL OR v_company_id != v_creator_company_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si el creador es admin (dueño o admin miembro)
  RETURN public.is_company_admin_check(v_company_id, p_creator_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para que los usuarios vean sus propios registros o los de trabajadores de su empresa (si son admin)
CREATE POLICY "Users can view their own time entries or company entries"
  ON public.time_entries
  FOR SELECT
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    auth.uid() = COALESCE(assigned_user_id, user_id) OR -- El trabajador asignado
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  );

-- Política para que los usuarios puedan insertar registros para sí mismos o para trabajadores (si son admin)
CREATE POLICY "Users can insert their own time entries or for workers"
  ON public.time_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      assigned_user_id IS NULL OR -- Registro para sí mismo
      assigned_user_id = user_id OR -- Registro para sí mismo (explícito)
      public.can_manage_time_entry(assigned_user_id, user_id) -- Admin creando para trabajador
    )
  );

-- Política para que los usuarios puedan actualizar sus propios registros o los de trabajadores (si son admin)
CREATE POLICY "Users can update their own time entries or company entries"
  ON public.time_entries
  FOR UPDATE
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  )
  WITH CHECK (
    auth.uid() = user_id AND (
      assigned_user_id IS NULL OR
      assigned_user_id = user_id OR
      public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id)
    )
  );

-- Política para que los usuarios puedan eliminar sus propios registros o los de trabajadores (si son admin)
CREATE POLICY "Users can delete their own time entries or company entries"
  ON public.time_entries
  FOR DELETE
  USING (
    auth.uid() = user_id OR -- El usuario que creó el registro
    public.can_manage_time_entry(COALESCE(assigned_user_id, user_id), user_id) -- Admin de la empresa
  );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_assigned_user_id_idx ON public.time_entries(assigned_user_id);
CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_task_id_idx ON public.time_entries(task_id);
CREATE INDEX IF NOT EXISTS time_entries_entry_date_idx ON public.time_entries(entry_date);

-- Función para calcular duración automáticamente
CREATE OR REPLACE FUNCTION public.calculate_duration_minutes(
  p_start_time TIME,
  p_end_time TIME
)
RETURNS INTEGER AS $$
BEGIN
  IF p_end_time IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calcular diferencia en minutos
  RETURN EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para calcular duración automáticamente
CREATE OR REPLACE FUNCTION public.update_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Si ya se calculó duration_minutes (caso de solo horas trabajadas), no recalcular
  IF NEW.duration_minutes IS NOT NULL AND NEW.start_time IS NULL THEN
    -- Ya está calculado, solo actualizar updated_at
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
  END IF;
  
  -- Calcular duración desde start_time y end_time si ambos están presentes
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := public.calculate_duration_minutes(NEW.start_time, NEW.end_time);
  END IF;
  
  NEW.updated_at := timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entry_duration_trigger
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_time_entry_duration();


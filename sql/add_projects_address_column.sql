-- Agregar columna address a la tabla projects si no existe
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS address TEXT;


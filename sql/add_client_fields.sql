-- Añadir nuevos campos a la tabla clients
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT; -- CIF o NIF


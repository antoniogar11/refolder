-- Extender tabla companies con datos de empresa
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS tax_id VARCHAR(15),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);

-- Índices
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);

-- Agregar columnas para los datos de la empresa (usados en facturas y presupuestos)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT, -- CIF o NIF
ADD COLUMN IF NOT EXISTS logo_url TEXT; -- URL del logo (opcional)

-- Comentarios para documentación
COMMENT ON COLUMN public.companies.address IS 'Dirección completa de la empresa';
COMMENT ON COLUMN public.companies.city IS 'Ciudad de la empresa';
COMMENT ON COLUMN public.companies.province IS 'Provincia de la empresa';
COMMENT ON COLUMN public.companies.postal_code IS 'Código postal de la empresa';
COMMENT ON COLUMN public.companies.phone IS 'Teléfono de contacto de la empresa';
COMMENT ON COLUMN public.companies.email IS 'Email de contacto de la empresa';
COMMENT ON COLUMN public.companies.tax_id IS 'CIF o NIF de la empresa';
COMMENT ON COLUMN public.companies.logo_url IS 'URL del logo de la empresa (opcional)';



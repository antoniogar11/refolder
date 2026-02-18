-- Add iva_porcentaje column to estimates table
-- Default 21 for backwards compatibility with existing estimates
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS iva_porcentaje NUMERIC(5,2) NOT NULL DEFAULT 21;

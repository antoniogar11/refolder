-- Añadir IVA por partida (antes era global por presupuesto)
ALTER TABLE estimate_items
ADD COLUMN IF NOT EXISTS iva_porcentaje NUMERIC(5,2) NOT NULL DEFAULT 21;

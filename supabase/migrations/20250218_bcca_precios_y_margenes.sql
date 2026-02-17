-- =============================================================
-- Migración: Precios de referencia BCCA + sistema de márgenes
-- =============================================================

-- 1. Tabla de precios de referencia (basada en BCCA)
CREATE TABLE IF NOT EXISTS precios_referencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'ud',
  precio NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(descripcion, '') || ' ' ||
      coalesce(categoria, '') || ' ' ||
      coalesce(codigo, '')
    )
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_precios_referencia_search
  ON precios_referencia USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_precios_referencia_categoria
  ON precios_referencia(categoria);

-- RLS: precios de referencia son de lectura para usuarios autenticados
ALTER TABLE precios_referencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer precios_referencia"
  ON precios_referencia FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Añadir columnas de coste y margen a estimate_items
ALTER TABLE estimate_items
  ADD COLUMN IF NOT EXISTS precio_coste NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS margen NUMERIC(5,2) DEFAULT 20;

-- 3. Añadir margen global a estimates
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS margen_global NUMERIC(5,2) DEFAULT 20;

-- 4. Backfill: items existentes → precio_coste = precio_unitario, margen = 0
UPDATE estimate_items
  SET precio_coste = precio_unitario, margen = 0
  WHERE precio_coste IS NULL;

-- 5. Actualizar la función RPC para soportar precio_coste y margen
CREATE OR REPLACE FUNCTION create_estimate_with_items(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_total_amount NUMERIC,
  p_client_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB,
  p_margen_global NUMERIC DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_estimate_id UUID;
  v_existing_id UUID;
  v_item JSONB;
  v_index INT := 0;
BEGIN
  -- Verificar idempotencia: si ya existe un presupuesto con esa key, devolverlo
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM estimates
    WHERE idempotency_key = p_idempotency_key
      AND user_id = p_user_id;

    IF v_existing_id IS NOT NULL THEN
      RETURN json_build_object(
        'success', true,
        'message', 'Presupuesto ya existente (idempotente).',
        'estimateId', v_existing_id,
        'idempotent', true
      );
    END IF;
  END IF;

  -- Crear el presupuesto con margen global
  INSERT INTO estimates (user_id, name, description, total_amount, status, client_id, project_id, idempotency_key, margen_global)
  VALUES (p_user_id, p_name, p_description, p_total_amount, 'draft', p_client_id, p_project_id, p_idempotency_key, p_margen_global)
  RETURNING id INTO v_estimate_id;

  -- Crear las partidas con precio_coste y margen
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO estimate_items (estimate_id, categoria, descripcion, unidad, cantidad, precio_coste, margen, precio_unitario, subtotal, orden)
    VALUES (
      v_estimate_id,
      v_item->>'categoria',
      v_item->>'descripcion',
      v_item->>'unidad',
      (v_item->>'cantidad')::NUMERIC,
      COALESCE((v_item->>'precio_coste')::NUMERIC, (v_item->>'precio_unitario')::NUMERIC),
      COALESCE((v_item->>'margen')::NUMERIC, p_margen_global),
      (v_item->>'precio_unitario')::NUMERIC,
      (v_item->>'subtotal')::NUMERIC,
      COALESCE((v_item->>'orden')::INT, v_index)
    );
    v_index := v_index + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Presupuesto creado correctamente.',
    'estimateId', v_estimate_id,
    'idempotent', false
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

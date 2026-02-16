-- =============================================================
-- Migración: Transacciones atómicas para presupuestos + idempotencia
-- =============================================================

-- 1. Añadir columna de idempotencia a estimates
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- Índice para búsquedas rápidas por idempotency_key
CREATE INDEX IF NOT EXISTS idx_estimates_idempotency_key
  ON estimates (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- 2. Función RPC para crear presupuesto con partidas atómicamente
CREATE OR REPLACE FUNCTION create_estimate_with_items(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_total_amount NUMERIC,
  p_client_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
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

  -- Crear el presupuesto
  INSERT INTO estimates (user_id, name, description, total_amount, status, client_id, project_id, idempotency_key)
  VALUES (p_user_id, p_name, p_description, p_total_amount, 'draft', p_client_id, p_project_id, p_idempotency_key)
  RETURNING id INTO v_estimate_id;

  -- Crear las partidas
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO estimate_items (estimate_id, categoria, descripcion, unidad, cantidad, precio_unitario, subtotal, orden)
    VALUES (
      v_estimate_id,
      v_item->>'categoria',
      v_item->>'descripcion',
      v_item->>'unidad',
      (v_item->>'cantidad')::NUMERIC,
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

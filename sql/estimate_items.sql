-- Tabla: estimate_items (partidas de presupuesto)
CREATE TABLE IF NOT EXISTS estimate_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'ud',
  cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own estimate items"
  ON estimate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimates e
      WHERE e.id = estimate_items.estimate_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own estimate items"
  ON estimate_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM estimates e
      WHERE e.id = estimate_items.estimate_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own estimate items"
  ON estimate_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM estimates e
      WHERE e.id = estimate_items.estimate_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own estimate items"
  ON estimate_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM estimates e
      WHERE e.id = estimate_items.estimate_id
      AND e.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);

-- Add notes column to estimates if not exists
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS notes TEXT;

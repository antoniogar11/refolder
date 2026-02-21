-- =============================================================
-- Migración: Precios personalizados por usuario (aprendizaje)
-- Captura los precios que cada usuario usa en sus presupuestos
-- para personalizar futuras generaciones con IA.
-- =============================================================

CREATE TABLE IF NOT EXISTS user_precios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'ud',
  precio_coste NUMERIC(10,2) NOT NULL,
  veces_usado INT NOT NULL DEFAULT 1,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(descripcion, '') || ' ' ||
      coalesce(categoria, '')
    )
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_precios_user_id
  ON user_precios(user_id);

CREATE INDEX IF NOT EXISTS idx_user_precios_search
  ON user_precios USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_user_precios_user_categoria
  ON user_precios(user_id, categoria);

-- Índice único para evitar duplicados por usuario + categoría + descripción
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_precios_unique
  ON user_precios(user_id, categoria, descripcion);

-- RLS: cada usuario solo puede ver y gestionar sus propios precios
ALTER TABLE user_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own prices"
  ON user_precios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prices"
  ON user_precios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prices"
  ON user_precios FOR UPDATE
  USING (auth.uid() = user_id);

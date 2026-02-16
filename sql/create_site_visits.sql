-- Tabla principal de visitas de obra
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'presupuestado', 'vinculado')),
  general_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zonas dentro de una visita (baño, cocina, salón...)
CREATE TABLE IF NOT EXISTS site_visit_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_visit_id UUID REFERENCES site_visits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  largo NUMERIC(10,2),
  ancho NUMERIC(10,2),
  alto NUMERIC(10,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trabajos seleccionados por zona (checkboxes)
CREATE TABLE IF NOT EXISTS site_visit_zone_works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES site_visit_zones(id) ON DELETE CASCADE NOT NULL,
  work_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fotos por zona
CREATE TABLE IF NOT EXISTS site_visit_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES site_visit_zones(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de trabajo predefinidos (configurables por usuario)
CREATE TABLE IF NOT EXISTS work_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos de trabajo por defecto (user_id NULL = globales)
INSERT INTO work_types (user_id, name, is_default) VALUES
  (NULL, 'Albañilería', true),
  (NULL, 'Alicatado', true),
  (NULL, 'Solado / Pavimento', true),
  (NULL, 'Fontanería', true),
  (NULL, 'Electricidad', true),
  (NULL, 'Pintura', true),
  (NULL, 'Carpintería', true),
  (NULL, 'Sanitarios', true),
  (NULL, 'Mampostería / Tabiquería', true),
  (NULL, 'Pladur / Falso techo', true),
  (NULL, 'Climatización', true),
  (NULL, 'Demolición / Escombros', true),
  (NULL, 'Cerrajería', true),
  (NULL, 'Ventanas / Cristalería', true),
  (NULL, 'Muebles de cocina', true),
  (NULL, 'Impermeabilización', true),
  (NULL, 'Microcemento', true);

-- RLS Policies
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visit_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visit_zone_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;

-- site_visits: usuario ve las suyas
CREATE POLICY "Users can view own site visits" ON site_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own site visits" ON site_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own site visits" ON site_visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own site visits" ON site_visits FOR DELETE USING (auth.uid() = user_id);

-- site_visit_zones: acceso a través del dueño de la visita
CREATE POLICY "Users can view own visit zones" ON site_visit_zones FOR SELECT
  USING (EXISTS (SELECT 1 FROM site_visits WHERE site_visits.id = site_visit_zones.site_visit_id AND site_visits.user_id = auth.uid()));
CREATE POLICY "Users can create own visit zones" ON site_visit_zones FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM site_visits WHERE site_visits.id = site_visit_zones.site_visit_id AND site_visits.user_id = auth.uid()));
CREATE POLICY "Users can update own visit zones" ON site_visit_zones FOR UPDATE
  USING (EXISTS (SELECT 1 FROM site_visits WHERE site_visits.id = site_visit_zones.site_visit_id AND site_visits.user_id = auth.uid()));
CREATE POLICY "Users can delete own visit zones" ON site_visit_zones FOR DELETE
  USING (EXISTS (SELECT 1 FROM site_visits WHERE site_visits.id = site_visit_zones.site_visit_id AND site_visits.user_id = auth.uid()));

-- site_visit_zone_works: acceso a través del dueño de la zona → visita
CREATE POLICY "Users can manage zone works" ON site_visit_zone_works FOR ALL
  USING (EXISTS (
    SELECT 1 FROM site_visit_zones z
    JOIN site_visits v ON v.id = z.site_visit_id
    WHERE z.id = site_visit_zone_works.zone_id AND v.user_id = auth.uid()
  ));

-- site_visit_photos: acceso a través del dueño de la zona → visita
CREATE POLICY "Users can manage zone photos" ON site_visit_photos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM site_visit_zones z
    JOIN site_visits v ON v.id = z.site_visit_id
    WHERE z.id = site_visit_photos.zone_id AND v.user_id = auth.uid()
  ));

-- work_types: ver los globales (is_default) + los propios del usuario
CREATE POLICY "Users can view work types" ON work_types FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can create own work types" ON work_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own work types" ON work_types FOR DELETE
  USING (auth.uid() = user_id);

-- Migración: eliminar impactos diarios y añadir campos para ubicación aproximada, rango de precios y periodo de alquiler
-- Ejecutar en el proyecto Supabase del ERP (stellarmotion.erp).

-- 1. Eliminar columnas de impactos
ALTER TABLE soportes
  DROP COLUMN IF EXISTS impactos_diarios;

ALTER TABLE soportes
  DROP COLUMN IF EXISTS impactos_diarios_m2;

-- 2. Ubicación aproximada (como en test mapas - círculo con radio)
ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS ubicacion_aproximada boolean DEFAULT false;

ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS radio_aproximado integer DEFAULT 500;

COMMENT ON COLUMN soportes.ubicacion_aproximada IS 'Si true, se muestra un círculo de radio_aproximado (m) en el mapa';
COMMENT ON COLUMN soportes.radio_aproximado IS 'Radio en metros del círculo de ubicación aproximada';

-- 3. Rango de precios (precio mínimo y máximo en lugar de un solo precio)
ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS rango_precios boolean DEFAULT false;

ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS precio_min numeric;

ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS precio_max numeric;

COMMENT ON COLUMN soportes.rango_precios IS 'Si true, se usan precio_min y precio_max en lugar de precio_mes';
COMMENT ON COLUMN soportes.precio_min IS 'Precio mínimo (cuando rango_precios = true)';
COMMENT ON COLUMN soportes.precio_max IS 'Precio máximo (cuando rango_precios = true), debe ser > precio_min';

-- 4. Periodo de alquiler (días, semanas, meses)
ALTER TABLE soportes
  ADD COLUMN IF NOT EXISTS periodo_alquiler text DEFAULT 'meses';

COMMENT ON COLUMN soportes.periodo_alquiler IS 'Unidad del periodo de alquiler: dias, semanas o meses';

-- Opcional: restricción para que precio_max > precio_min cuando ambos están informados
-- ALTER TABLE soportes ADD CONSTRAINT chk_precio_rango CHECK (
--   (rango_precios = false) OR (precio_min IS NULL AND precio_max IS NULL) OR (precio_max IS NULL) OR (precio_min IS NULL) OR (precio_max > precio_min)
-- );

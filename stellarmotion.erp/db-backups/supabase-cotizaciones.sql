-- Migración: Tablas cotizaciones y cotizacion_lineas para módulo Ventas (ERP)
-- Ejecutar en Supabase SQL Editor si no existen las tablas.

-- Tabla cotizaciones (alineada con lib/supabaseCotizaciones)
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  cliente TEXT,
  contacto_id UUID,
  vendedor TEXT,
  sucursal TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Aprobada', 'Rechazada', 'Vencida')),
  subtotal NUMERIC(12, 2) DEFAULT 0,
  total_iva NUMERIC(12, 2) DEFAULT 0,
  total_final NUMERIC(12, 2) DEFAULT 0,
  vigencia INTEGER DEFAULT 30,
  plazo TEXT,
  cantidad_items INTEGER DEFAULT 0,
  requiere_nueva_aprobacion BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo ON cotizaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha_creacion ON cotizaciones(fecha_creacion DESC);

CREATE OR REPLACE FUNCTION update_cotizaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cotizaciones_updated_at ON cotizaciones;
CREATE TRIGGER trigger_update_cotizaciones_updated_at
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_cotizaciones_updated_at();

-- Tabla cotizacion_lineas
CREATE TABLE IF NOT EXISTS cotizacion_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'servicio' CHECK (tipo IN ('servicio', 'Nota', 'Sección')),
  codigo_producto TEXT,
  nombre_producto TEXT,
  descripcion TEXT,
  cantidad NUMERIC(10, 2) DEFAULT 0,
  unidad_medida TEXT DEFAULT 'ud',
  precio_unitario NUMERIC(12, 2) DEFAULT 0,
  comision NUMERIC(10, 2) DEFAULT 0,
  con_iva BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  subtotal_linea NUMERIC(12, 2) DEFAULT 0,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_cotizacion_id ON cotizacion_lineas(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_orden ON cotizacion_lineas(cotizacion_id, orden);

-- RPC opcional para generar código (COT-MM-AA-00001). Si no se usa, el backend genera en JS.
CREATE OR REPLACE FUNCTION generar_codigo_cotizacion()
RETURNS TEXT AS $$
DECLARE
  mes_str TEXT;
  anio_str TEXT;
  num INT;
  codigo TEXT;
BEGIN
  mes_str := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
  anio_str := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
  SELECT COALESCE(MAX(
    CASE WHEN codigo ~ '^COT-[0-9]{2}-[0-9]{2}-[0-9]+$'
      THEN NULLIF(SUBSTRING(codigo FROM 'COT-[0-9]{2}-[0-9]{2}-(.+)$'), '')::INT
      ELSE NULL
    END
  ), 0) + 1 INTO num FROM cotizaciones;
  codigo := 'COT-' || mes_str || '-' || anio_str || '-' || LPAD(num::TEXT, 5, '0');
  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

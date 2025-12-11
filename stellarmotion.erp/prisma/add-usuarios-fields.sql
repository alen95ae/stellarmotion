-- Agregar campos faltantes a la tabla usuarios para guardar datos del paso 1
-- Estos campos permiten que los datos del paso 1 se guarden en la BD y estén disponibles en el paso 2

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS pais TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS tipo_owner TEXT,
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT,
ADD COLUMN IF NOT EXISTS tipo_empresa TEXT,
ADD COLUMN IF NOT EXISTS apellidos TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN usuarios.telefono IS 'Teléfono del usuario (del paso 1 del registro)';
COMMENT ON COLUMN usuarios.pais IS 'País del usuario (del paso 1 del registro)';
COMMENT ON COLUMN usuarios.ciudad IS 'Ciudad del usuario (del paso 1 del registro)';
COMMENT ON COLUMN usuarios.tipo_owner IS 'Tipo de owner: persona, empresa, agencia, gobierno (del paso 1)';
COMMENT ON COLUMN usuarios.nombre_empresa IS 'Nombre de la empresa si aplica (del paso 1)';
COMMENT ON COLUMN usuarios.tipo_empresa IS 'Tipo de empresa: Inc, LLC, S.L., S.A., etc. (del paso 1)';
COMMENT ON COLUMN usuarios.apellidos IS 'Apellidos del usuario (del paso 1 del registro)';

-- Índices opcionales para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_owner ON usuarios(tipo_owner) WHERE tipo_owner IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_pais ON usuarios(pais) WHERE pais IS NOT NULL;

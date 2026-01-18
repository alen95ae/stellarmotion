-- Agregar campos faltantes a la tabla usuarios para guardar datos del paso 1
-- NOTA: Solo campos básicos del paso 1. Los campos del paso 2 (ciudad, tipo_owner, nombre_empresa, tipo_empresa)
-- van a la tabla owners cuando se completa el paso 2.

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS pais TEXT,
ADD COLUMN IF NOT EXISTS apellidos TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN usuarios.telefono IS 'Teléfono del usuario (del paso 1 del registro)';
COMMENT ON COLUMN usuarios.pais IS 'País del usuario (del paso 1 del registro)';
COMMENT ON COLUMN usuarios.apellidos IS 'Apellidos del usuario (del paso 1 del registro)';

-- Índice opcional para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_pais ON usuarios(pais) WHERE pais IS NOT NULL;





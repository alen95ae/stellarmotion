-- Tabla para invitaciones (módulo Ajustes > Invitaciones).
-- Ejecutar en Supabase SQL Editor si el módulo devuelve error de tabla inexistente.

CREATE TABLE IF NOT EXISTS invitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  rol_id UUID REFERENCES roles(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'expirada', 'cancelada')),
  token TEXT NOT NULL UNIQUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones(email);
CREATE INDEX IF NOT EXISTS idx_invitaciones_estado ON invitaciones(estado);
CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_expira_at ON invitaciones(expira_at);

COMMENT ON TABLE invitaciones IS 'Invitaciones para registro de nuevos usuarios (Ajustes > Invitaciones)';

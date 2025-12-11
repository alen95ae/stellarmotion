-- Script para crear los roles necesarios en la tabla roles
-- Ejecutar este script en Supabase SQL Editor si los roles no existen

-- Insertar roles si no existen
INSERT INTO roles (id, nombre, descripcion, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin', 'Administrador del sistema', NOW(), NOW()),
  (gen_random_uuid(), 'owner', 'Propietario de espacios publicitarios', NOW(), NOW()),
  (gen_random_uuid(), 'client', 'Cliente que busca espacios', NOW(), NOW()),
  (gen_random_uuid(), 'seller', 'Vendedor', NOW(), NOW()),
  (gen_random_uuid(), 'agency', 'Agencia publicitaria', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Verificar que se crearon correctamente
SELECT id, nombre, descripcion FROM roles ORDER BY nombre;


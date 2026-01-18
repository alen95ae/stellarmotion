-- Script para crear un usuario de prueba en Supabase
-- Ejecutar este script en Supabase SQL Editor

-- CONTRASEÑA EN TEXTO PLANO: Test123456
-- HASH DE CONTRASEÑA: $2b$10$SPuByg4hnxtH8cHgBg6fyO5lbvOyqaKJM7PCNobdjZ72NHrmdsFX.

-- Primero, asegurarse de que existe el rol 'admin' (si no existe, crearlo)
INSERT INTO roles (id, nombre, descripcion, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin', 'Administrador del sistema', NOW(), NOW()),
  (gen_random_uuid(), 'client', 'Cliente que busca espacios', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Obtener el ID del rol 'admin'
DO $$
DECLARE
  admin_role_id UUID;
  client_role_id UUID;
BEGIN
  -- Obtener ID del rol admin
  SELECT id INTO admin_role_id FROM roles WHERE nombre = 'admin' LIMIT 1;
  
  -- Obtener ID del rol client
  SELECT id INTO client_role_id FROM roles WHERE nombre = 'client' LIMIT 1;
  
  -- Crear usuario ADMIN de prueba
  INSERT INTO usuarios (
    email,
    passwordhash,
    nombre,
    rol_id,
    activo,
    fecha_creacion,
    created_at,
    updated_at
  )
  VALUES (
    'test@stellarmotion.com',
    '$2b$10$SPuByg4hnxtH8cHgBg6fyO5lbvOyqaKJM7PCNobdjZ72NHrmdsFX.',
    'Usuario de Prueba',
    admin_role_id,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    passwordhash = EXCLUDED.passwordhash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    updated_at = NOW();
  
  -- Crear usuario CLIENT de prueba
  INSERT INTO usuarios (
    email,
    passwordhash,
    nombre,
    rol_id,
    activo,
    fecha_creacion,
    created_at,
    updated_at
  )
  VALUES (
    'client@stellarmotion.com',
    '$2b$10$SPuByg4hnxtH8cHgBg6fyO5lbvOyqaKJM7PCNobdjZ72NHrmdsFX.',
    'Cliente de Prueba',
    client_role_id,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    passwordhash = EXCLUDED.passwordhash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    updated_at = NOW();
  
  RAISE NOTICE 'Usuarios de prueba creados exitosamente';
END $$;

-- Verificar que se crearon correctamente
SELECT 
  u.id,
  u.email,
  u.nombre,
  r.nombre as rol,
  u.activo,
  u.fecha_creacion
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
WHERE u.email IN ('test@stellarmotion.com', 'client@stellarmotion.com')
ORDER BY u.email;




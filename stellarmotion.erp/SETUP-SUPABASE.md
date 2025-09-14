# Configuración de Supabase para Carga de Imágenes

## ✅ Problema resuelto

El error "internal server error" se debía a que faltaba la dependencia `@supabase/supabase-js` en el proyecto.

## 🔧 Cambios realizados

1. **Dependencia agregada**: `@supabase/supabase-js@^2.39.0`
2. **Package.json corregido**: Eliminé errores de sintaxis JSON
3. **Conflictos de dependencias resueltos**: Usando `--legacy-peer-deps`

## 📋 Configuración requerida

Para que la carga de imágenes funcione, necesitas configurar estas variables de entorno en tu archivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# NextAuth
NEXTAUTH_SECRET=tu_secret_key_aqui
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"
```

## 🗂️ Configuración de Supabase Storage

1. **Crear bucket "soportes"**:
   - Ve a tu proyecto de Supabase
   - Navega a Storage
   - Crea un nuevo bucket llamado "soportes"
   - Configúralo como público

2. **Configurar políticas de acceso**:
   ```sql
   -- Permitir lectura pública
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'soportes');
   
   -- Permitir inserción (solo para autenticados o con service role)
   CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'soportes');
   ```

## 🧪 Probar la funcionalidad

1. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

2. **Probar carga de imágenes**:
   - Ve a `/panel/soportes/nuevo`
   - Intenta subir una imagen
   - Debería funcionar sin errores

3. **Script de prueba** (opcional):
   ```bash
   node scripts/test-upload.js
   ```

## 🎯 Estado actual

- ✅ Dependencias instaladas correctamente
- ✅ Endpoint de upload configurado
- ✅ Validaciones implementadas
- ✅ Manejo de errores mejorado
- ⚠️ Requiere configuración de variables de entorno
- ⚠️ Requiere bucket "soportes" en Supabase

## 🚨 Si sigues teniendo problemas

1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que el bucket "soportes" existe en Supabase
3. Revisa los logs del servidor para errores específicos
4. Verifica que las políticas de Storage estén configuradas correctamente

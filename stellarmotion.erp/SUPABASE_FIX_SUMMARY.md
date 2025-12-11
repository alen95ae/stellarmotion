# 🔧 REPARACIÓN COMPLETA DE PERMISOS SUPABASE - ERP

## ✅ CAMBIOS APLICADOS

### 1. Unificación de Clientes Supabase
- **ANTES**: Había DOS clientes (`supabaseAdmin` y `supabaseServer`)
- **AHORA**: Todo usa SOLO `supabaseAdmin` para operaciones de usuarios y roles
- **Archivos corregidos**:
  - `lib/supabase-service.ts` - Reemplazados todos los usos de `supabaseServer` por `supabaseAdmin`

### 2. Verificación de SERVICE_ROLE_KEY
- `lib/supabase-admin.ts` ahora verifica:
  - Que la key existe
  - Que NO es igual a ANON_KEY
  - Que el rol decodificado es `service_role`
  - Muestra preview de la key en logs
  - Especifica explícitamente el schema `public`

### 3. Logs Detallados Añadidos
Todos los archivos críticos ahora muestran:
- Qué cliente se está usando (`supabaseAdmin`)
- Qué key se está usando (preview)
- Qué schema se consulta (`public`)
- Qué tabla se consulta
- Errores detallados con code, message, details, hint

**Archivos con logs mejorados**:
- `lib/supabase-admin.ts` - Logs de inicialización
- `lib/supabaseUsers.ts` - Logs en todas las operaciones
  - `findUserByEmailSupabase()`
  - `createUserSupabase()`
  - `getUserByIdSupabase()`
  - `updateUserRoleSupabase()`

### 4. Endpoint de Diagnóstico Creado
- **Ruta**: `/api/debug/supabase`
- **Funcionalidad**:
  - Verifica configuración (URL, keys)
  - Decodifica y verifica SERVICE_ROLE_KEY
  - Test SELECT de usuarios
  - Test SELECT de roles
  - Test INSERT usuarios (con rollback)
  - Test INSERT roles (con rollback)
  - Devuelve errores exactos con todos los detalles

## ✅ VERIFICACIONES REALIZADAS

### No hay uso de ANON_KEY
- ✅ Verificado: No existe ningún `createClient()` usando `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Verificado: `supabaseAdmin` usa SOLO `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Verificado: `supabaseServer` también usa `SUPABASE_SERVICE_ROLE_KEY` (pero ya no se usa para usuarios/roles)

### Archivos que usan supabaseAdmin (CORRECTO)
- ✅ `lib/supabaseUsers.ts` - Todas las operaciones de usuarios
- ✅ `lib/supabase-service.ts` - Todas las operaciones (ahora unificado)
- ✅ `app/api/auth/login/route.ts` - Consulta de roles
- ✅ `app/api/auth/me/route.ts` - Consulta de usuario y roles
- ✅ `app/api/auth/register/route.ts` - Usa funciones de `lib/auth.ts` que usan `supabaseAdmin`
- ✅ `app/api/auth/register-client/route.ts` - Usa funciones de `lib/auth.ts` que usan `supabaseAdmin`
- ✅ `app/api/owners/route.ts` - Usa `supabaseAdmin` para usuarios y roles
- ✅ `app/api/owners/complete/route.ts` - Usa `supabaseAdmin` para usuarios y roles

### Archivos que aún usan supabaseServer (NO CRÍTICOS)
Estos archivos usan `supabaseServer` pero NO son críticos para usuarios/roles:
- `app/api/soportes/bulk/route.ts` - Solo para soportes
- `app/api/soportes/export/pdf/route.ts` - Solo para soportes
- `app/api/soportes/upload/route.ts` - Solo para soportes/storage
- `app/api/soportes/import/route.ts` - Solo para soportes

**Nota**: `supabaseServer` también usa `SUPABASE_SERVICE_ROLE_KEY`, así que no es un problema de seguridad, pero para consistencia deberían migrarse a `supabaseAdmin` en el futuro.

## 🔍 CÓMO USAR EL ENDPOINT DE DIAGNÓSTICO

1. Abre: `http://localhost:3000/api/debug/supabase`
2. Revisa la respuesta JSON que incluye:
   - Configuración de variables de entorno
   - Información de la key decodificada
   - Resultados de todos los tests
   - Errores detallados si los hay

## 📋 PRÓXIMOS PASOS SI HAY ERRORES

Si el endpoint de diagnóstico muestra errores:

1. **Verifica las variables de entorno**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

2. **Verifica que la key sea service_role**:
   - El endpoint mostrará el rol decodificado
   - Debe ser exactamente `service_role`

3. **Verifica RLS en Supabase**:
   - Ve a Supabase Dashboard → Authentication → Policies
   - Asegúrate de que las tablas `usuarios` y `roles` tengan políticas que permitan acceso al `service_role`
   - O desactiva RLS temporalmente para testing

4. **Verifica permisos de tabla**:
   - El usuario `service_role` debe tener permisos SELECT, INSERT, UPDATE, DELETE en las tablas
   - Esto normalmente está garantizado, pero verifica en Supabase Dashboard

## ✅ RESULTADO ESPERADO

Después de estos cambios:
- ✅ Todas las operaciones de usuarios usan `supabaseAdmin` (SERVICE_ROLE_KEY)
- ✅ Todas las operaciones de roles usan `supabaseAdmin` (SERVICE_ROLE_KEY)
- ✅ Logs detallados muestran exactamente qué está pasando
- ✅ Endpoint de diagnóstico permite identificar problemas rápidamente
- ✅ No hay uso accidental de ANON_KEY

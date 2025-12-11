import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type AdminClient = SupabaseClient<any, 'public', any>;

/**
 * ⚠️ CLIENTE SUPABASE ADMIN - CONFIGURACIÓN CRÍTICA
 * 
 * Este cliente DEBE ejecutarse SOLO en Node.js Runtime con acceso completo a process.env.
 * Si se ejecuta en Edge Runtime, las variables privadas NO estarán disponibles.
 * 
 * CARACTERÍSTICAS:
 * - Lee EXPLÍCITAMENTE de process.env EN TIEMPO DE EJECUCIÓN (no caché)
 * - Lanza error inmediato si falta alguna variable (fail-fast)
 * - NO usa fallbacks peligrosos
 * - Valida que la SERVICE_ROLE_KEY no sea la anon key
 * - Logging obligatorio para debugging
 * 
 * REQUISITOS:
 * - La ruta que llame a esta función DEBE tener: export const runtime = 'nodejs'
 * - Variables requeridas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * 
 * USO:
 * Solo en Server Components, API Routes y Server Actions.
 * NUNCA importar en componentes cliente.
 */
export function getAdminSupabase(): AdminClient {
  // 🔴 LOGGING OBLIGATORIO: Verificar que estamos en Node Runtime
  console.log('🔍 [getAdminSupabase] Verificando runtime y variables de entorno...');
  console.log('🔍 [getAdminSupabase] Runtime:', process.env.NEXT_RUNTIME || 'nodejs (default)');
  console.log('🔍 [getAdminSupabase] CWD:', process.cwd());
  console.log('🔍 [getAdminSupabase] Node Version:', process.version);
  
  // Leer variables EXPLÍCITAMENTE (sin fallbacks peligrosos)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 🔴 VALIDACIÓN ESTRICTA: URL debe existir
  if (!supabaseUrl) {
    const allEnvKeys = Object.keys(process.env);
    const supabaseKeys = allEnvKeys.filter(k => k.includes('SUPABASE'));
    
    console.error('❌ [getAdminSupabase] CRÍTICO: NEXT_PUBLIC_SUPABASE_URL no encontrada');
    console.error('❌ [getAdminSupabase] Variables SUPABASE disponibles:', supabaseKeys.length > 0 ? supabaseKeys : 'NINGUNA');
    console.error('❌ [getAdminSupabase] Total variables env:', allEnvKeys.length);
    console.error('❌ [getAdminSupabase] Posibles causas:');
    console.error('   1. El archivo .env.local no existe o está en la ubicación incorrecta');
    console.error('   2. La ruta API se está ejecutando en Edge Runtime (debe ser nodejs)');
    console.error('   3. El servidor no se reinició después de cambios en .env.local');
    
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL no cargada. Verifica que la ruta usa runtime nodejs y que .env.local existe.');
  }

  // 🔴 VALIDACIÓN ESTRICTA: Service Role Key debe existir
  if (!serviceKey) {
    const allEnvKeys = Object.keys(process.env);
    const supabaseKeys = allEnvKeys.filter(k => k.includes('SUPABASE'));
    
    console.error('❌ [getAdminSupabase] CRÍTICO: SUPABASE_SERVICE_ROLE_KEY no encontrada');
    console.error('❌ [getAdminSupabase] Variables SUPABASE disponibles:', supabaseKeys.length > 0 ? supabaseKeys : 'NINGUNA');
    console.error('❌ [getAdminSupabase] Total variables env:', allEnvKeys.length);
    console.error('❌ [getAdminSupabase] Posibles causas:');
    console.error('   1. SUPABASE_SERVICE_ROLE_KEY no está definida en .env.local');
    console.error('   2. La ruta API se está ejecutando en Edge Runtime (debe ser nodejs)');
    console.error('   3. La variable tiene un nombre diferente (debe ser exactamente SUPABASE_SERVICE_ROLE_KEY)');
    
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY no cargada. Esta es una variable PRIVADA que solo funciona en Node Runtime.');
  }

  // 🔴 VALIDACIÓN DE SEGURIDAD: Service Role Key NO debe ser igual a Anon Key
  if (anonKey && serviceKey === anonKey) {
    console.error('❌ [getAdminSupabase] CRÍTICO: SERVICE_ROLE_KEY es igual a ANON_KEY');
    console.error('❌ [getAdminSupabase] Esto es un error de configuración de seguridad grave');
    throw new Error('❌ SERVICE_ROLE_KEY no puede ser igual a ANON_KEY. Verifica tu configuración de Supabase.');
  }

  // ✅ LOGGING DE ÉXITO (sin exponer secretos)
  console.log('✅ [getAdminSupabase] Variables cargadas correctamente');
  console.log('✅ [getAdminSupabase] Supabase URL:', supabaseUrl.substring(0, 35) + '...');
  console.log('✅ [getAdminSupabase] Service Key length:', serviceKey.length);
  console.log('✅ [getAdminSupabase] Service Key preview:', serviceKey.substring(0, 8) + '...' + serviceKey.substring(serviceKey.length - 4));
  console.log('✅ [getAdminSupabase] Cliente Admin inicializado correctamente');

  return createClient(supabaseUrl, serviceKey, {
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    },
    db: { 
      schema: 'public' 
    },
  });
}

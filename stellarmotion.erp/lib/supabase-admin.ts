import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificación de seguridad en runtime
if (!supabaseServiceRoleKey) {
  throw new Error('❌ FATAL: SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno del ERP.');
}

if (!supabaseUrl) {
  throw new Error('❌ FATAL: NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno del ERP.');
}

// Verificar que NO estamos usando la anon key por error
if (supabaseAnonKey && supabaseServiceRoleKey === supabaseAnonKey) {
  throw new Error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY no puede ser igual a NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Decodificación simple para verificar que es la key correcta en logs (sin revelar el secreto)
let keyInfo: any = {};
try {
  const [, payload] = supabaseServiceRoleKey.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
  keyInfo = decoded;
  console.log(`🔐 [Supabase Admin] Inicializando con rol: ${decoded.role}`);
  console.log(`🔐 [Supabase Admin] Key preview: ${supabaseServiceRoleKey.substring(0, 20)}...${supabaseServiceRoleKey.substring(supabaseServiceRoleKey.length - 10)}`);
  console.log(`🔐 [Supabase Admin] URL: ${supabaseUrl}`);
  console.log(`🔐 [Supabase Admin] Schema: public (default)`);
  
  if (decoded.role !== 'service_role') {
    console.error('⚠️ ALERTA CRÍTICA: La key configurada NO es service_role. Es: ' + decoded.role);
    throw new Error(`Key incorrecta: se esperaba service_role pero se encontró ${decoded.role}`);
  }
} catch (e: any) {
  if (e.message?.includes('Key incorrecta')) {
    throw e;
  }
  console.error('⚠️ No se pudo decodificar la key para verificación:', e.message);
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false, // CRÍTICO: No guardar sesión en memoria/cookies
  },
  db: {
    schema: 'public', // Especificar explícitamente el schema
  },
});

console.log('✅ [Supabase Admin] Cliente Admin inicializado correctamente');
console.log(`✅ [Supabase Admin] Usando SERVICE_ROLE_KEY (bypassa RLS)`);
console.log(`✅ [Supabase Admin] Schema: public`);

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Verificación de seguridad en runtime
if (!supabaseServiceRoleKey) {
  throw new Error('❌ FATAL: SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno del ERP.');
}

// Decodificación simple para verificar que es la key correcta en logs (sin revelar el secreto)
try {
  const [, payload] = supabaseServiceRoleKey.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
  console.log(`🔐 [Supabase Admin] Inicializando con rol: ${decoded.role}`);
  
  if (decoded.role !== 'service_role') {
    console.error('⚠️ ALERTA CRÍTICA: La key configurada NO es service_role. Es: ' + decoded.role);
  }
} catch (e) {
  console.error('⚠️ No se pudo decodificar la key para verificación.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false, // CRÍTICO: No guardar sesión en memoria/cookies
  },
  // Opcional: schemas personalizados si usas algo distinto a public
});

console.log('✅ [Supabase Admin] Cliente Admin inicializado correctamente');


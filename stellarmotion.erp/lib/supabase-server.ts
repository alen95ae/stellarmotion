// Supabase Server Client (Service Role)
// SOLO usar en server-side routes y funciones server-only
// NUNCA importar en componentes cliente

import { createClient } from '@supabase/supabase-js';

// Validación de variables de entorno
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL no está configurada');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY no está configurada');
}

// Verificar que NO estamos usando la anon key por error
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (anonKey && process.env.SUPABASE_SERVICE_ROLE_KEY === anonKey) {
  throw new Error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY no puede ser igual a NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Cliente del servidor con permisos completos (para operaciones administrativas)
// Bypasea RLS y tiene permisos totales
// IMPORTANTE: Este cliente usa SUPABASE_SERVICE_ROLE_KEY que bypassa completamente RLS
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // DEBE USAR ESTA
  {
    auth: { persistSession: false }
  }
);


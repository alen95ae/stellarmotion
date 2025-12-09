// Supabase Browser Client (Anon Key)
// Para uso en componentes cliente (browser)
// ESTE ARCHIVO YA NO SE USA - MANTENIDO POR COMPATIBILIDAD
// Usa supabase-server.ts para server-side

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada');
}

if (!supabaseAnonKey) {
  console.warn('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada');
}

// Cliente público para uso en el cliente (browser)
// Respeta RLS y tiene permisos limitados
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)


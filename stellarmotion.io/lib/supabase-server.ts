// Supabase Server Client (Service Role)
// SOLO usar en server-side routes y funciones server-only
// NUNCA importar en componentes cliente

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Función helper para crear cliente de Supabase
// Esto permite crear el cliente solo cuando se necesita, no al importar
export function getSupabaseServer() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('⚠️ Supabase variables no configuradas.')
    return null
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}

// Exportar instancia para compatibilidad con código existente
// Pero es mejor usar getSupabaseServer() en nuevos códigos
export const supabaseServer = getSupabaseServer()


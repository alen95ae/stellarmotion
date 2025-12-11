// Cliente SQL de Supabase (solo para consultas SQL, NO para autenticación)
// Este archivo mantiene la conexión a Supabase únicamente como base de datos SQL
// UNIFICADO: WEB y ERP usan la misma base de datos Supabase PostgreSQL

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL no está configurada en la WEB')
}

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no está configurada en la WEB')
}

// Cliente con Service Role Key para operaciones administrativas
// Solo se usa en el servidor (API routes) para consultas SQL directas
// NO se usa para autenticación
// IMPORTANTE: Este cliente usa la misma base de datos Supabase que el ERP
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public' // Especificar explícitamente el schema
    }
  }
)

if (supabaseUrl && supabaseServiceKey) {
  console.log('✅ [WEB Supabase Admin] Cliente Admin inicializado correctamente')
  console.log(`✅ [WEB Supabase Admin] URL: ${supabaseUrl}`)
  console.log(`✅ [WEB Supabase Admin] Schema: public`)
  console.log(`✅ [WEB Supabase Admin] Usando SERVICE_ROLE_KEY (bypassa RLS)`)
} else {
  console.warn('⚠️ [WEB Supabase Admin] Cliente inicializado con valores vacíos. Revisa las variables de entorno.')
}


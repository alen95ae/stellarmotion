// Cliente SQL de Supabase (solo para consultas SQL, NO para autenticación)
// Este archivo mantiene la conexión a Supabase únicamente como base de datos SQL
// UNIFICADO: WEB y ERP usan la misma base de datos Supabase PostgreSQL

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validación estricta en tiempo de inicialización
if (!supabaseUrl) {
  const error = '❌ CRÍTICO: NEXT_PUBLIC_SUPABASE_URL no está configurada en la WEB'
  console.error(error)
  throw new Error(error)
}

if (!supabaseServiceKey) {
  const error = '❌ CRÍTICO: SUPABASE_SERVICE_ROLE_KEY no está configurada en la WEB'
  console.error(error)
  console.error('   Esta variable es REQUERIDA para operaciones administrativas que ignoran RLS')
  throw new Error(error)
}

// Validar que la Service Role Key tiene el formato correcto (empieza con 'eyJ')
if (!supabaseServiceKey.startsWith('eyJ')) {
  console.warn('⚠️ [WEB Supabase Admin] SUPABASE_SERVICE_ROLE_KEY no parece ser un JWT válido')
  console.warn('   La Service Role Key debe empezar con "eyJ" (JWT)')
}

// Cliente con Service Role Key para operaciones administrativas
// IMPORTANTE: Este cliente BYPASEA RLS (Row Level Security) completamente
// Solo se usa en el servidor (API routes) para consultas SQL directas
// NO se usa para autenticación
// IMPORTANTE: Este cliente usa la misma base de datos Supabase que el ERP
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
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

// Logs de confirmación
console.log('✅ [WEB Supabase Admin] Cliente Admin inicializado correctamente')
console.log(`✅ [WEB Supabase Admin] URL: ${supabaseUrl}`)
console.log(`✅ [WEB Supabase Admin] Schema: public`)
console.log(`✅ [WEB Supabase Admin] Usando SERVICE_ROLE_KEY (bypassa RLS)`)
console.log(`✅ [WEB Supabase Admin] Service Role Key configurada: ${supabaseServiceKey.substring(0, 20)}... (${supabaseServiceKey.length} caracteres)`)
console.log(`✅ [WEB Supabase Admin] Este cliente IGNORA todas las políticas RLS`)


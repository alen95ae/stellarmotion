import { createClient } from "@supabase/supabase-js"

// Cliente de administración de Supabase.
// Este cliente usa la Service Role Key y SOLO debe usarse en el backend (API routes, server actions).
// Nunca importarlo en código que pueda ejecutarse en el cliente.

const url = process.env.SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  // No lanzamos error aquí para permitir que la app arranque sin estas vars en local si no se usa este módulo.
  // Las rutas que lo utilicen deben validar estas variables y responder con error claro si faltan.
}

export const supabaseAdmin = createClient(url || "", serviceRole || "")


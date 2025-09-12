import { createClient } from "@supabase/supabase-js"

// Cliente público de Supabase para uso en el frontend.
// Usa únicamente las variables NEXT_PUBLIC_* y no debe contener claves con privilegios elevados.
// Importa este cliente solo en componentes/archivos ejecutados en el navegador o en código sin privilegios.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)


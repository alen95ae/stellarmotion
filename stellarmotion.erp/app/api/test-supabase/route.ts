import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// POST /api/test-supabase
// Inserta un registro ficticio en la tabla `soportes` usando el cliente admin.
export async function POST() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor" },
        { status: 501 }
      )
    }

    const payload = {
      title: "Soporte de prueba",
      status: "DISPONIBLE",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin.from("soportes").insert(payload).select("*").single()
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true, soporte: data })
  } catch (error: any) {
    console.error("test-supabase error:", error)
    return NextResponse.json({ ok: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}


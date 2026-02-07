import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Body = {
  nombre?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  tipo_ubicacion?: string;
  metros_cuadrados?: number | null;
  direccion?: string;
};

/**
 * POST /api/leads/instalacion-soportes
 * Guarda lead del formulario "Instalación de soportes".
 *
 * Tabla en Supabase (crear si no existe):
 * create table public.leads_instalacion_soportes (
 *   id uuid primary key default gen_random_uuid(),
 *   created_at timestamptz default now(),
 *   nombre text,
 *   email text not null,
 *   telefono text,
 *   ciudad text,
 *   tipo_ubicacion text,
 *   metros_cuadrados numeric,
 *   direccion text
 * );
 */
export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { nombre, email, telefono, ciudad, tipo_ubicacion, metros_cuadrados, direccion } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email es obligatorio" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase.from("leads_instalacion_soportes").insert({
      nombre: nombre?.trim() || null,
      email: email.trim(),
      telefono: telefono?.trim() || null,
      ciudad: ciudad?.trim() || null,
      tipo_ubicacion: tipo_ubicacion || null,
      metros_cuadrados: metros_cuadrados ?? null,
      direccion: direccion?.trim() || null,
    });

    if (error) {
      console.error("[leads/instalacion-soportes] Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al guardar la solicitud. Si la tabla no existe, créala en Supabase (ver comentario en route.ts).",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[leads/instalacion-soportes]", e);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

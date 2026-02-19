import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUsuarioAutenticado } from "@/lib/cotizacionesBackend";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { nombre, email } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof nombre === "string") {
      updates.nombre = nombre.trim() || null;
    }
    if (typeof email === "string" && email.trim()) {
      updates.email = email.trim().toLowerCase();
    }

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update(updates)
      .eq("id", id)
      .select("id, nombre, email")
      .single();

    if (error) {
      console.error("Error PATCH usuario:", error);
      return NextResponse.json(
        { error: error.message || "Error al actualizar usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("PATCH /api/ajustes/usuarios/[id]:", err);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.from("usuarios").delete().eq("id", id);

    if (error) {
      console.error("Error DELETE usuario:", error);
      return NextResponse.json(
        { error: error.message || "Error al eliminar usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/ajustes/usuarios/[id]:", err);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}

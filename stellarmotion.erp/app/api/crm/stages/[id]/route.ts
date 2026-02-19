import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, is_archived } = body;

    const update: Record<string, unknown> = {};
    if (typeof nombre === "string") update.nombre = nombre.trim();
    if (typeof is_archived === "boolean") update.is_archived = is_archived;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere nombre o is_archived" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("sales_pipeline_stages")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Error al actualizar etapa" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error PATCH /api/crm/stages/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar etapa" },
      { status: 500 }
    );
  }
}

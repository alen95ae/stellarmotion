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

    const update: Record<string, unknown> = {};
    if (body.contacto_id !== undefined) update.contacto_id = body.contacto_id;
    else if (body.lead_id !== undefined) update.contacto_id = body.lead_id;
    if (body.descripcion !== undefined) update.descripcion = body.descripcion ?? null;
    if (body.valor_estimado !== undefined) update.valor_estimado = body.valor_estimado ?? null;
    if (body.moneda !== undefined) update.moneda = body.moneda || "EUR";
    if (body.ciudad !== undefined) update.ciudad = body.ciudad ?? null;
    if (body.origen !== undefined) update.origen = body.origen ?? null;
    if (body.interes !== undefined) update.interes = body.interes ?? null;
    if (body.estado !== undefined) update.estado = body.estado;
    if (body.motivo_perdida !== undefined) update.motivo_perdida = body.motivo_perdida ?? null;
    if (body.stage_id !== undefined) update.stage_id = body.stage_id;
    if (body.posicion_en_etapa !== undefined) update.posicion_en_etapa = body.posicion_en_etapa;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const { data, error } = await supabaseAdmin
      .from("sales_opportunities")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Error al actualizar oportunidad" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error PATCH /api/crm/opportunities/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar oportunidad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("sales_opportunities").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Error al eliminar oportunidad" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error DELETE /api/crm/opportunities/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al eliminar oportunidad" },
      { status: 500 }
    );
  }
}

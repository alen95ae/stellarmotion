import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage_id, opportunities } = body;

    if (!stage_id || !Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json(
        { success: false, error: "stage_id y opportunities son requeridos" },
        { status: 400 }
      );
    }

    for (const item of opportunities) {
      const { id, posicion_en_etapa } = item;
      if (!id || posicion_en_etapa == null) continue;
      const { error } = await supabaseAdmin
        .from("sales_opportunities")
        .update({ posicion_en_etapa })
        .eq("id", id)
        .eq("stage_id", stage_id);
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message || "Error al reordenar" },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error POST /api/crm/opportunities/reorder:", err);
    return NextResponse.json(
      { success: false, error: "Error al reordenar" },
      { status: 500 }
    );
  }
}

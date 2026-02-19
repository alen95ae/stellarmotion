import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pipeline_id,
      stage_id,
      contacto_id,
      lead_id,
      descripcion,
      valor_estimado,
      moneda,
      ciudad,
      origen,
      interes,
      estado,
      motivo_perdida,
    } = body;

    const contactId = contacto_id ?? lead_id;
    if (!pipeline_id || !stage_id) {
      return NextResponse.json(
        { success: false, error: "Pipeline y etapa son requeridos" },
        { status: 400 }
      );
    }
    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "El contacto es requerido" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("sales_opportunities")
      .select("posicion_en_etapa")
      .eq("stage_id", stage_id)
      .order("posicion_en_etapa", { ascending: false })
      .limit(1)
      .maybeSingle();

    const posicion_en_etapa = ((existing?.posicion_en_etapa as number) ?? 0) + 1;

    const insert: Record<string, unknown> = {
      pipeline_id,
      stage_id,
      contacto_id: contactId,
      descripcion: descripcion || null,
      valor_estimado: valor_estimado ?? null,
      moneda: moneda || "EUR",
      ciudad: ciudad || null,
      origen: origen || null,
      interes: interes || null,
      estado: estado || "abierta",
      motivo_perdida: motivo_perdida || null,
      posicion_en_etapa,
    };

    const { data, error } = await supabaseAdmin
      .from("sales_opportunities")
      .insert(insert)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Error al crear oportunidad" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error POST /api/crm/opportunities:", err);
    return NextResponse.json(
      { success: false, error: "Error al crear oportunidad" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const origen = searchParams.get("origen") || "";
    const interes = searchParams.get("interes") || "";
    const ciudad = searchParams.get("ciudad") || "";
    const estado = searchParams.get("estado") || "";

    let query = supabaseAdmin
      .from("sales_opportunities")
      .select("*")
      .eq("pipeline_id", pipelineId);

    if (q) query = query.ilike("descripcion", `%${q}%`);
    if (origen && origen !== "all") query = query.eq("origen", origen);
    if (interes && interes !== "all") query = query.eq("interes", interes);
    if (ciudad && ciudad !== "all") query = query.eq("ciudad", ciudad);
    if (estado && estado !== "all") query = query.eq("estado", estado);

    query = query.order("posicion_en_etapa", { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: true, data: [] });
    }

    const rows = data || [];
    const contactoIds = [...new Set(rows.map((o: { contacto_id?: string }) => o.contacto_id).filter(Boolean))] as string[];
    let contactoNombreMap: Record<string, string> = {};
    if (contactoIds.length > 0) {
      const { data: contactosData } = await supabaseAdmin
        .from("contactos")
        .select("id, nombre, razon_social")
        .in("id", contactoIds);
      const list = (contactosData as { id: string; nombre?: string | null; razon_social?: string | null }[]) || [];
      contactoNombreMap = Object.fromEntries(
        list.map((c) => [c.id, (c.nombre ?? c.razon_social ?? "").trim() || ""])
      );
    }

    const opportunities = rows.map((opp: Record<string, unknown>) => ({
      id: opp.id,
      pipeline_id: opp.pipeline_id,
      stage_id: opp.stage_id,
      lead_id: opp.contacto_id ?? null,
      lead_nombre: contactoNombreMap[(opp.contacto_id as string) ?? ""] ?? null,
      contacto_id: opp.contacto_id ?? null,
      titulo: opp.titulo,
      descripcion: opp.descripcion,
      valor_estimado: opp.valor_estimado,
      moneda: opp.moneda,
      probabilidad: opp.probabilidad,
      ciudad: opp.ciudad,
      origen: opp.origen,
      interes: opp.interes,
      estado: opp.estado,
      motivo_perdida: opp.motivo_perdida,
      fecha_cierre_estimada: opp.fecha_cierre_estimada,
      posicion_en_etapa: opp.posicion_en_etapa,
      lead: null,
      contacto: null,
      vendedor: null,
    }));

    return NextResponse.json({ success: true, data: opportunities });
  } catch (err) {
    console.error("Error GET /api/crm/pipelines/[id]/opportunities:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}

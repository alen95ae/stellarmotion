import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const { data, error } = await supabaseAdmin
      .from("sales_pipeline_stages")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .eq("is_archived", false)
      .order("posicion", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, data: [] });
      }
      return NextResponse.json(
        { success: false, error: "Error al obtener etapas" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("Error GET /api/crm/pipelines/[id]/stages:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener etapas" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const body = await request.json();
    const { nombre, posicion } = body;
    if (!nombre) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    let finalPosicion = posicion;
    if (finalPosicion == null) {
      const { data: lastStage } = await supabaseAdmin
        .from("sales_pipeline_stages")
        .select("posicion")
        .eq("pipeline_id", pipelineId)
        .order("posicion", { ascending: false })
        .limit(1)
        .maybeSingle();
      finalPosicion = lastStage ? (lastStage.posicion as number) + 1 : 0;
    }

    const { data, error } = await supabaseAdmin
      .from("sales_pipeline_stages")
      .insert({
        pipeline_id: pipelineId,
        nombre,
        posicion: finalPosicion,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { success: false, error: "La tabla de stages no existe en la base de datos" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Error al crear etapa" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error POST /api/crm/pipelines/[id]/stages:", err);
    return NextResponse.json(
      { success: false, error: "Error al crear etapa" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const body = await request.json();
    const { stages } = body;
    if (!Array.isArray(stages)) {
      return NextResponse.json(
        { success: false, error: "Se requiere un array de stages" },
        { status: 400 }
      );
    }

    const stagesNorm = stages.map((s: { id: string; nombre?: string; posicion?: number }) => ({
      id: String(s.id),
      nombre: String(s.nombre ?? ""),
      posicion: Number(s.posicion ?? 0),
    }));

    const tempOffset = 10000;
    for (let i = 0; i < stagesNorm.length; i++) {
      const { error: e1 } = await supabaseAdmin
        .from("sales_pipeline_stages")
        .update({ posicion: tempOffset + i })
        .eq("id", stagesNorm[i].id)
        .eq("pipeline_id", pipelineId);
      if (e1) {
        return NextResponse.json(
          { success: false, error: "Error al reordenar etapas" },
          { status: 500 }
        );
      }
    }
    for (let i = 0; i < stagesNorm.length; i++) {
      const { error: e2 } = await supabaseAdmin
        .from("sales_pipeline_stages")
        .update({ nombre: stagesNorm[i].nombre, posicion: i })
        .eq("id", stagesNorm[i].id)
        .eq("pipeline_id", pipelineId);
      if (e2) {
        return NextResponse.json(
          { success: false, error: "Error al reordenar etapas" },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error PUT /api/crm/pipelines/[id]/stages:", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar etapas" },
      { status: 500 }
    );
  }
}

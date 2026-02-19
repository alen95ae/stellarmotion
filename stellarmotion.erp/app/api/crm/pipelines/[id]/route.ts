import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("sales_pipelines")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Pipeline no encontrado" },
          { status: 404 }
        );
      }
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, data: null });
      }
      return NextResponse.json(
        { success: false, error: "Error al obtener pipeline" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error GET /api/crm/pipelines/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener pipeline" },
      { status: 500 }
    );
  }
}

async function updatePipeline(request: NextRequest, id: string) {
  const body = await request.json();
  const { nombre, descripcion, is_default } = body;

  if (is_default) {
    await supabaseAdmin
      .from("sales_pipelines")
      .update({ is_default: false })
      .neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("sales_pipelines")
    .update({
      nombre: nombre ?? undefined,
      descripcion: descripcion ?? null,
      is_default: is_default ?? false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { success: false, error: "La tabla de pipelines no existe en la base de datos" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Error al actualizar pipeline" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await updatePipeline(request, id);
  } catch (err) {
    console.error("Error PUT /api/crm/pipelines/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar pipeline" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await updatePipeline(request, id);
  } catch (err) {
    console.error("Error PATCH /api/crm/pipelines/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar pipeline" },
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
    const { error } = await supabaseAdmin
      .from("sales_pipelines")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { success: false, error: "La tabla de pipelines no existe en la base de datos" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Error al eliminar pipeline" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error DELETE /api/crm/pipelines/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error al eliminar pipeline" },
      { status: 500 }
    );
  }
}

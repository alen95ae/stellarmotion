import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("sales_pipelines")
      .select(
        `
        id,
        nombre,
        descripcion,
        is_default,
        is_archived,
        created_at,
        updated_at,
        sales_pipeline_stages (
          id,
          nombre,
          posicion,
          color,
          is_archived
        )
      `
      )
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    console.log("[GET /api/crm/pipelines] data:", data?.length ?? 0, "error:", error?.code ?? "none");

    if (error) {
      console.error("GET /api/crm/pipelines Supabase error:", error.code, error.message);
      if (error.code === "42P01") {
        return NextResponse.json(
          { success: false, error: "Tabla sales_pipelines no encontrada", details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener pipelines",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error GET /api/crm/pipelines:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener pipelines", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, is_default } = body;
    if (!nombre) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (is_default) {
      await supabaseAdmin
        .from("sales_pipelines")
        .update({ is_default: false })
        .neq("is_default", false);
    }

    const { data, error } = await supabaseAdmin
      .from("sales_pipelines")
      .insert({
        nombre,
        descripcion: descripcion || null,
        is_default: is_default || false,
        is_archived: false,
      })
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
        { success: false, error: "Error al crear pipeline" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error POST /api/crm/pipelines:", err);
    return NextResponse.json(
      { success: false, error: "Error al crear pipeline" },
      { status: 500 }
    );
  }
}

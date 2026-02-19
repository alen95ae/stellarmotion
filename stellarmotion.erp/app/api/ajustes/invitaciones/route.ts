import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUsuarioAutenticado } from "@/lib/cotizacionesBackend";

export const runtime = "nodejs";

const INVITACIONES_TABLE = "invitaciones";

export async function GET(request: NextRequest) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado")?.trim();

    let query = supabaseAdmin
      .from(INVITACIONES_TABLE)
      .select("id, email, rol_id, estado, fecha_creacion, expira_at, token, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false });

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data: rows, error, count } = await query;

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ invitaciones: [], total: 0 });
      }
      console.error("Error GET invitaciones:", error);
      return NextResponse.json(
        { error: "Error al obtener invitaciones" },
        { status: 500 }
      );
    }

    const roleIds = [
      ...new Set(
        (rows || []).map((r: { rol_id?: string }) => r.rol_id).filter(Boolean)
      ),
    ] as string[];
    let roleMap: Record<string, string> = {};
    if (roleIds.length > 0) {
      const { data: roles } = await supabaseAdmin
        .from("roles")
        .select("id, nombre")
        .in("id", roleIds);
      roleMap = Object.fromEntries(
        ((roles || []) as { id: string; nombre: string }[]).map((r) => [
          r.id,
          r.nombre,
        ])
      );
    }

    const invitaciones = (rows || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      email: r.email || "",
      rol: r.rol_id ? roleMap[r.rol_id as string] || null : null,
      estado: r.estado || "pendiente",
      fechaCreacion: r.fecha_creacion || r.created_at,
      expira: r.expira_at || null,
      token: r.token || null,
      enlace: r.token
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/registro?token=${r.token}`
        : null,
    }));

    return NextResponse.json({
      invitaciones,
      total: count ?? invitaciones.length,
    });
  } catch (err) {
    console.error("GET /api/ajustes/invitaciones:", err);
    return NextResponse.json(
      { error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, validezHoras = 72 } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "El email del invitado es requerido" },
        { status: 400 }
      );
    }

    const token =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `inv-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const now = new Date();
    const expiraAt = new Date(now.getTime() + (Number(validezHoras) || 72) * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
      .from(INVITACIONES_TABLE)
      .insert({
        email: email.trim().toLowerCase(),
        token,
        estado: "pendiente",
        fecha_creacion: now.toISOString(),
        expira_at: expiraAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select("id, email, token, expira_at")
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          {
            error:
              "La tabla de invitaciones no existe. Ejecuta el SQL de creación en Supabase.",
          },
          { status: 503 }
        );
      }
      console.error("Error POST invitaciones:", error);
      return NextResponse.json(
        { error: error.message || "Error al crear invitación" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const enlace = `${baseUrl}/registro?token=${data.token}`;

    return NextResponse.json({
      invitacion: {
        id: data.id,
        email: data.email,
        expira: data.expira_at,
        enlace,
      },
    });
  } catch (err) {
    console.error("POST /api/ajustes/invitaciones:", err);
    return NextResponse.json(
      { error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}

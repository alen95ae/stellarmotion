import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUsuarioAutenticado } from "@/lib/cotizacionesBackend";
import { createUserSupabase } from "@/lib/supabaseUsers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const search = (searchParams.get("search") || "").trim();

    const selectStr = `
      id, email, activo, ultimo_acceso, rol_id, created_at,
      contacto:contactos!contacto_id(id, nombre, razon_social)
    `;
    let query = supabaseAdmin.from("usuarios").select(selectStr, { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data: rows, error, count } = await query
      .order("created_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching users:", error.message, error.code, error.details);
      return NextResponse.json(
        { error: "Error al obtener usuarios", details: error.message },
        { status: 500 }
      );
    }

    const roleIds = [...new Set((rows || []).map((r: { rol_id?: string }) => r.rol_id).filter(Boolean))] as string[];
    let roleMap: Record<string, string> = {};
    if (roleIds.length > 0) {
      const { data: roles } = await supabaseAdmin.from("roles").select("id, nombre").in("id", roleIds);
      roleMap = Object.fromEntries(((roles || []) as { id: string; nombre: string }[]).map((r) => [r.id, r.nombre]));
    }

    const users = (rows || []).map((r: Record<string, unknown>) => {
      const contacto = r.contacto as { nombre?: string; razon_social?: string } | null;
      return {
        id: r.id,
        nombre: contacto?.nombre || contacto?.razon_social || "",
        email: r.email || "",
        fechaCreacion: r.created_at,
        ultimoAcceso: r.ultimo_acceso || null,
        activo: r.activo ?? true,
        rol: r.rol_id ? roleMap[r.rol_id as string] || null : null,
      };
    });

    return NextResponse.json({
      users,
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Error GET /api/ajustes/usuarios:", err);
    const e = err instanceof Error ? err : new Error(String(err));
    const details = err && typeof err === "object" && "message" in err ? { message: (err as Error).message } : undefined;
    return NextResponse.json(
      { error: e.message || "Error al obtener usuarios", details },
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
    const { nombre, email, activo = true, password, rol } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const passwordToUse = password && String(password).trim() ? String(password).trim() : undefined;
    if (!passwordToUse) {
      return NextResponse.json({ error: "La contraseña es requerida para crear usuario" }, { status: 400 });
    }

    const newUser = await createUserSupabase(
      email.trim(),
      passwordToUse,
      nombre?.trim() || undefined,
      rol === "admin" ? "admin" : "client"
    );

    if (!newUser) {
      return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });
    }

    if (activo === false) {
      await supabaseAdmin.from("usuarios").update({ activo: false }).eq("id", newUser.id);
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        nombre: newUser.fields.Nombre || "",
        email: newUser.fields.Email,
        activo,
      },
    });
  } catch (err) {
    console.error("Error POST /api/ajustes/usuarios:", err);
    const e = err instanceof Error ? err : new Error(String(err));
    const details = err && typeof err === "object" && "message" in err ? { message: (err as Error).message } : undefined;
    return NextResponse.json(
      { error: e.message || "Error al crear usuario", details },
      { status: 500 }
    );
  }
}

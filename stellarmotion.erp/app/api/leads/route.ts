export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getLeads, createLead, type LeadFormato } from "@/lib/contactos-unified";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const sector = searchParams.get("sector") || "";
    const interes = searchParams.get("interes") || "";
    const origen = searchParams.get("origen") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 500) : 50;

    const { data, total } = await getLeads({
      q: q || undefined,
      sector: sector !== "ALL" ? sector : undefined,
      interes: interes !== "ALL" ? interes : undefined,
      origen: origen !== "ALL" ? origen : undefined,
      page,
      limit,
      includeDeleted: false,
    });

    const totalPages = Math.ceil(total / limit) || 1;
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (e) {
    console.error("GET /api/leads:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "No se pudieron obtener los leads", details },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nombre || typeof body.nombre !== "string" || !body.nombre.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const payload: Partial<LeadFormato> = {
      nombre: body.nombre.trim(),
      email: Array.isArray(body.email) ? body.email : body.email ? [body.email] : undefined,
      telefono: body.telefono?.trim() || undefined,
      ciudad: body.ciudad?.trim() || undefined,
      calle: body.calle?.trim() || undefined,
      postal_code: body.postal_code?.trim() || undefined,
      pais: body.pais?.trim() || undefined,
      web: body.web?.trim() || undefined,
      sector: body.sector?.trim() || undefined,
      interes: body.interes?.trim() || undefined,
      origen: body.origen?.trim() || undefined,
      categories: Array.isArray(body.categories) ? body.categories : undefined,
      latitud: typeof body.latitud === "number" ? body.latitud : undefined,
      longitud: typeof body.longitud === "number" ? body.longitud : undefined,
    };

    const created = await createLead(payload);
    if (!created) {
      return NextResponse.json({ error: "Error al crear el lead (createLead devolvió null)" }, { status: 500 });
    }
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/leads:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al crear el lead", details },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

// #region agent log
console.log("API route contactos loaded");
// #endregion

import { NextResponse } from "next/server";
import {
  getContactos,
  createContacto,
  type ContactoFormato,
} from "@/lib/contactos-unified";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const relation = searchParams.get("relation") || "";
    const kind = searchParams.get("kind") || "";
    const origen = searchParams.get("origen") || "";
    const sector = searchParams.get("sector") || "";
    const interes = searchParams.get("interes") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 500);

    console.log("[GET /api/contactos] relation:", relation, "q:", q, "page:", page, "limit:", limit);

    const { data, total } = await getContactos({
      q: q || undefined,
      relation: relation !== "ALL" ? relation : undefined,
      kind: kind !== "ALL" ? kind : undefined,
      origen: origen !== "ALL" ? origen || undefined : undefined,
      sector: sector !== "ALL" ? sector || undefined : undefined,
      interes: interes !== "ALL" ? interes || undefined : undefined,
      page,
      limit,
    });

    console.log("[GET /api/contactos] results:", data.length, "total:", total);
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
    console.error("GET /api/contactos:", e);
    return NextResponse.json(
      { error: "No se pudieron obtener los contactos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "app/api/contactos/route.ts:POST",
      message: "POST handler entered",
      data: { method: request.method, url: request.url },
      timestamp: Date.now(),
      hypothesisId: "E",
    }),
  }).catch(() => {});
  // #endregion
  console.log("POST /api/contactos called", request.method, request.url);
  try {
    const body = await request.json();
    console.log("POST /api/contactos body (raw):", JSON.stringify(body));
    const name = (body.displayName ?? body.nombre ?? body.razonSocial ?? "").trim();
    if (!name) {
      console.log("POST /api/contactos validation failed: name empty", {
        displayName: body.displayName,
        nombre: body.nombre,
        razonSocial: body.razonSocial,
      });
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const payload: Partial<ContactoFormato> = {
      displayName: name,
      kind: body.kind === "COMPANY" ? "COMPANY" : "INDIVIDUAL",
      relation: body.relation === "OWNER" ? "OWNER" : body.relation || "CUSTOMER",
      nombre: body.nombre?.trim() || undefined,
      razonSocial: body.razonSocial?.trim() || undefined,
      email: body.email?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      nif: body.nif?.trim() || undefined,
      address: body.address?.trim() || undefined,
      city: body.city?.trim() || undefined,
      postalCode: body.postalCode?.trim() || undefined,
      country: body.country?.trim() || undefined,
      website: body.website?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      salesOwnerId: body.salesOwnerId || undefined,
      sector: body.sector?.trim() || undefined,
      interes: body.interes?.trim() || undefined,
      origen: body.origen?.trim() || undefined,
      categories: Array.isArray(body.categories) ? body.categories : undefined,
      persona_contacto: Array.isArray(body.persona_contacto) ? body.persona_contacto : undefined,
      latitud: body.latitud ?? undefined,
      longitud: body.longitud ?? undefined,
    };

    console.log("Payload recibido (para createContacto):", JSON.stringify(payload));
    console.log("Calling createContacto...");
    const created = await createContacto(payload);
    console.log("createContacto returned:", created ? "ok (contacto creado)" : "null (fallo)");
    if (!created) {
      return NextResponse.json({ error: "Error al crear el contacto" }, { status: 500 });
    }
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/contactos exception:", e);
    return NextResponse.json({ error: "Error al crear el contacto" }, { status: 500 });
  }
}

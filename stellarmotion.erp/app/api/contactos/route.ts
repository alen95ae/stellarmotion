export const dynamic = "force-dynamic";

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
  try {
    const body = await request.json();
    if (!body.displayName || typeof body.displayName !== "string" || !body.displayName.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const payload: Partial<ContactoFormato> = {
      displayName: body.displayName.trim(),
      kind: body.kind === "COMPANY" ? "COMPANY" : "INDIVIDUAL",
      relation: body.relation || "CUSTOMER",
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
    };

    const created = await createContacto(payload);
    if (!created) {
      return NextResponse.json({ error: "Error al crear el contacto" }, { status: 500 });
    }
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/contactos:", e);
    return NextResponse.json({ error: "Error al crear el contacto" }, { status: 500 });
  }
}

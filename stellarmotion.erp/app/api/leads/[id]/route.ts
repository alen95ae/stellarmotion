export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getLeadById, updateLead, softDeleteLead } from "@/lib/contactos-unified";
import type { LeadFormato } from "@/lib/contactos-unified";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }
  return NextResponse.json(lead);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const payload: Partial<LeadFormato> = {};
  if (body.nombre !== undefined) payload.nombre = body.nombre;
  if (body.email !== undefined) payload.email = body.email;
  if (body.telefono !== undefined) payload.telefono = body.telefono;
  if (body.ciudad !== undefined) payload.ciudad = body.ciudad;
  if (body.calle !== undefined) payload.calle = body.calle;
  if (body.postal_code !== undefined) payload.postal_code = body.postal_code;
  if (body.pais !== undefined) payload.pais = body.pais;
  if (body.web !== undefined) payload.web = body.web;
  if (body.sector !== undefined) payload.sector = body.sector;
  if (body.interes !== undefined) payload.interes = body.interes;
  if (body.origen !== undefined) payload.origen = body.origen;
  if (body.categories !== undefined) payload.categories = body.categories;
  if (body.latitud !== undefined) payload.latitud = body.latitud;
  if (body.longitud !== undefined) payload.longitud = body.longitud;

  const updated = await updateLead(id, payload);
  if (!updated) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await softDeleteLead(id);
  if (!ok) {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getContactoById,
  updateContacto,
  deleteContacto,
  type ContactoFormato,
} from "@/lib/contactos-unified";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contact = await getContactoById(id);
  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(contact);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const payload: Partial<ContactoFormato> = {};
  if (body.displayName !== undefined) payload.displayName = body.displayName;
  if (body.nombre !== undefined) payload.nombre = body.nombre;
  if (body.razonSocial !== undefined) payload.razonSocial = body.razonSocial;
  if (body.kind !== undefined) payload.kind = body.kind;
  if (body.relation !== undefined) payload.relation = body.relation;
  if (body.email !== undefined) payload.email = body.email;
  if (body.phone !== undefined) payload.phone = body.phone;
  if (body.nif !== undefined) payload.nif = body.nif;
  if (body.address !== undefined) payload.address = body.address;
  if (body.city !== undefined) payload.city = body.city;
  if (body.postalCode !== undefined) payload.postalCode = body.postalCode;
  if (body.country !== undefined) payload.country = body.country;
  if (body.website !== undefined) payload.website = body.website;
  if (body.notes !== undefined) payload.notes = body.notes;
  if (body.salesOwnerId !== undefined) payload.salesOwnerId = body.salesOwnerId;
  if (body.sector !== undefined) payload.sector = body.sector;
  if (body.origen !== undefined) payload.origen = body.origen;
  if (body.interes !== undefined) payload.interes = body.interes;
  if (body.persona_contacto !== undefined) payload.persona_contacto = body.persona_contacto;
  if (body.categories !== undefined) payload.categories = body.categories;
  if (body.latitud !== undefined) payload.latitud = body.latitud;
  if (body.longitud !== undefined) payload.longitud = body.longitud;
  if (Array.isArray(body.roles)) payload.roles = body.roles;

  const updated = await updateContacto(id, payload);
  if (!updated) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteContacto(id);
  if (!ok) {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

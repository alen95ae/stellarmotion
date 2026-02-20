export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { convertLeadToContacto } from "@/lib/contactos-unified";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id ?? body.leadId;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }
    const contact = await convertLeadToContacto(id);
    if (!contact) {
      return NextResponse.json({ error: "No se pudo convertir" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (e) {
    console.error("POST /api/leads/convert-to-contact:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al convertir", details },
      { status: 500 }
    );
  }
}

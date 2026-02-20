export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { softDeleteLead } from "@/lib/contactos-unified";

/** POST /api/leads/kill - soft delete uno o varios leads */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids = body.ids ?? (body.id ? [body.id] : []);
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids (array) es requerido" }, { status: 400 });
    }
    let count = 0;
    for (const id of ids) {
      if (typeof id === "string") {
        const ok = await softDeleteLead(id);
        if (ok) count++;
      }
    }
    return NextResponse.json({ success: true, count });
  } catch (e) {
    console.error("POST /api/leads/kill:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al eliminar", details },
      { status: 500 }
    );
  }
}

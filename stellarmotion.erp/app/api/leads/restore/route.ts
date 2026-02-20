export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { restoreLead } from "@/lib/contactos-unified";

/** POST /api/leads/restore - restaurar uno o varios leads (id o ids[]) */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids = body.ids ?? (body.id ? [body.id] : body.leadId ? [body.leadId] : []);
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "id o ids (array) es requerido" }, { status: 400 });
    }
    let count = 0;
    for (const id of ids) {
      if (typeof id === "string") {
        const ok = await restoreLead(id);
        if (ok) count++;
      }
    }
    return NextResponse.json({ success: true, count });
  } catch (e) {
    console.error("POST /api/leads/restore:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al restaurar", details },
      { status: 500 }
    );
  }
}

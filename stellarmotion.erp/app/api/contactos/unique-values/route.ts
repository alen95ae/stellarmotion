export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getContactosUniqueValues } from "@/lib/contactos-unified";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field") as "origen" | "sector" | "interes" | null;
    const relation = searchParams.get("relation") || undefined;
    if (!field || !["origen", "sector", "interes"].includes(field)) {
      return NextResponse.json({ error: "field debe ser origen, sector o interes" }, { status: 400 });
    }
    const values = await getContactosUniqueValues(field, relation);
    return NextResponse.json(values);
  } catch (e) {
    console.error("GET /api/contactos/unique-values:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al obtener valores", details },
      { status: 500 }
    );
  }
}

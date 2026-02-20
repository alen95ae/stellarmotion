export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getLeadsUniqueValues } from "@/lib/contactos-unified";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field") as "sector" | "interes" | "origen" | null;
    if (!field || !["sector", "interes", "origen"].includes(field)) {
      return NextResponse.json({ error: "field debe ser sector, interes u origen" }, { status: 400 });
    }
    const values = await getLeadsUniqueValues(field);
    return NextResponse.json(values);
  } catch (e) {
    console.error("GET /api/leads/unique-values:", e);
    const err = e instanceof Error ? e : new Error(String(e));
    const details = e && typeof e === "object" && "message" in e ? { message: (e as Error).message } : undefined;
    return NextResponse.json(
      { error: err.message || "Error al obtener valores", details },
      { status: 500 }
    );
  }
}

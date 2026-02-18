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
    return NextResponse.json({ error: "Error al obtener valores" }, { status: 500 });
  }
}

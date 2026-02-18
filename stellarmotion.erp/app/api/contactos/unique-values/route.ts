export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getContactosUniqueValues } from "@/lib/contactos-unified";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field") as "origen" | "sector" | "interes" | null;
    if (!field || !["origen", "sector", "interes"].includes(field)) {
      return NextResponse.json({ error: "field debe ser origen, sector o interes" }, { status: 400 });
    }
    const values = await getContactosUniqueValues(field);
    return NextResponse.json(values);
  } catch (e) {
    console.error("GET /api/contactos/unique-values:", e);
    return NextResponse.json({ error: "Error al obtener valores" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getLeadsPapelera } from "@/lib/contactos-unified";

/** GET papelera: leads con deleted_at no null */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 500);

    const { data, total } = await getLeadsPapelera({ q: q || undefined, page, limit });
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
    console.error("GET /api/leads/papelera:", e);
    return NextResponse.json({ error: "Error al obtener papelera" }, { status: 500 });
  }
}

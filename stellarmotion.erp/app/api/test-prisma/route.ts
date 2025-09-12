import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/test-prisma
// Devuelve una lista de soportes usando Prisma.
export async function GET() {
  try {
    // En la base de datos del ERP el modelo es `Support` (tabla por defecto "Support").
    const soportes = await prisma.support.findMany({ take: 10, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ ok: true, count: soportes.length, soportes })
  } catch (error: any) {
    console.error("test-prisma error:", error)
    return NextResponse.json({ ok: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}


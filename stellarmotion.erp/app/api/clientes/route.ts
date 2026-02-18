import { NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

// Mapear Cliente (Supabase) al formato Contact que espera el frontend (brands)
function clienteToContact(cliente: { id: string; nombre: string; email: string; telefono: string; direccion: string; nit: string; estado: string }) {
  return {
    id: cliente.id,
    displayName: cliente.nombre || "",
    legalName: cliente.nombre || undefined,
    taxId: cliente.nit || undefined,
    phone: cliente.telefono || undefined,
    email: cliente.email || undefined,
    address: cliente.direccion || undefined,
    city: undefined,
    postalCode: undefined,
    country: undefined,
    relation: "brand",
    status: cliente.estado || "activo",
    notes: undefined,
    kind: "company",
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || searchParams.get("search") || ""
    const relation = searchParams.get("relation") || ""
    const kind = searchParams.get("kind") || ""
    const estado = searchParams.get("estado") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500)

    let clientes: Awaited<ReturnType<typeof SupabaseService.getClientes>>
    try {
      clientes = await SupabaseService.getClientes()
    } catch (err) {
      console.error("Error fetching clientes from Supabase (tabla clientes puede no existir):", err)
      return withCors(NextResponse.json({
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
      }))
    }

    if (!Array.isArray(clientes)) {
      clientes = []
    }

    // Filtro búsqueda (q o search)
    if (q.trim()) {
      const searchLower = q.toLowerCase().trim()
      clientes = clientes.filter(c =>
        (c.nombre || "").toLowerCase().includes(searchLower) ||
        (c.email || "").toLowerCase().includes(searchLower) ||
        (c.telefono || "").includes(q) ||
        (c.nit || "").includes(q)
      )
    }

    if (estado) {
      clientes = clientes.filter(c => (c.estado || "").toLowerCase() === estado.toLowerCase())
    }

    const total = clientes.length
    const startIndex = (page - 1) * limit
    const paginated = clientes.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(total / limit) || 1

    const data = paginated.map(clienteToContact)

    return withCors(NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }))
  } catch (error) {
    console.error("Error fetching clientes:", error)
    return withCors(NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
    }))
  }
}

export async function POST(request: Request) {
  try {
    // LOG TEMPORAL: Verificar que estamos usando service role
    console.log("🔐 Using service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
    const data = await request.json()
    
    const newCliente = await SupabaseService.createCliente({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      nit: data.nit,
      estado: data.estado || 'activo'
    })

    return withCors(NextResponse.json(newCliente, { status: 201 }))
  } catch (error) {
    console.error("Error creating cliente:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

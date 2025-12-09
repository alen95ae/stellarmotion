import { NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const estado = searchParams.get("estado") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    let clientes = await SupabaseService.getClientes()

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      clientes = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchLower) ||
        cliente.email.toLowerCase().includes(searchLower) ||
        cliente.telefono.includes(search) ||
        cliente.nit.includes(search)
      )
    }

    if (estado) {
      clientes = clientes.filter(cliente => cliente.estado === estado)
    }

    // Aplicar paginación
    const total = clientes.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedClientes = clientes.slice(startIndex, endIndex)

    const totalPages = Math.ceil(total / limit)

    return withCors(NextResponse.json({
      clientes: paginatedClientes,
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
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
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

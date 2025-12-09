import { NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("q") || ""
    const relation = searchParams.get("relation") || ""
    const kind = searchParams.get("kind") || ""

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

    if (relation && relation !== "ALL") {
      // Filtro por relación si existe en los datos
      // clientes = clientes.filter(cliente => cliente.relacion === relation)
    }

    if (kind && kind !== "ALL") {
      // Filtro por tipo si existe en los datos
      // clientes = clientes.filter(cliente => cliente.tipo === kind)
    }

    const ids = clientes.map(cliente => cliente.id)

    return withCors(NextResponse.json({ ids }))
  } catch (error) {
    console.error("Error fetching client IDs:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

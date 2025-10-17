import { NextResponse } from "next/server"
import { mockSoportes, MockDatabase } from "@/lib/mock-data"

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
    const categoria = searchParams.get("categoria") || ""
    const estado = searchParams.get("estado") || ""
    const tipo = searchParams.get("tipo") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let filteredSoportes = [...mockSoportes]
    
    if (search) {
      filteredSoportes = filteredSoportes.filter(soporte => 
        soporte.nombre.toLowerCase().includes(search.toLowerCase()) ||
        soporte.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        soporte.ubicacion.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (categoria) {
      filteredSoportes = filteredSoportes.filter(soporte => soporte.categoria === categoria)
    }
    
    if (estado) {
      filteredSoportes = filteredSoportes.filter(soporte => soporte.estado === estado)
    }
    
    if (tipo) {
      filteredSoportes = filteredSoportes.filter(soporte => soporte.tipo === tipo)
    }

    // Ordenar
    filteredSoportes.sort((a, b) => {
      const aValue = (a as any)[sortBy]
      const bValue = (b as any)[sortBy]
      
      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

    const total = filteredSoportes.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const soportes = filteredSoportes.slice(startIndex, endIndex)

    const totalPages = Math.ceil(total / limit)

    return withCors(NextResponse.json({
      soportes,
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
    console.error("Error fetching soportes:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const newSoporte = await MockDatabase.create(mockSoportes, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      latitud: data.latitud,
      longitud: data.longitud,
      tipo: data.tipo,
      estado: data.estado || 'disponible',
      precio: data.precio,
      dimensiones: {
        ancho: data.dimensiones?.ancho || 0,
        alto: data.dimensiones?.alto || 0,
        area: data.dimensiones?.area || 0
      },
      imagenes: data.imagenes || [],
      categoria: data.categoria
    })

    return withCors(NextResponse.json(newSoporte, { status: 201 }))
  } catch (error) {
    console.error("Error creating soporte:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}
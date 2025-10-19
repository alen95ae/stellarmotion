import { NextResponse } from "next/server"
import { AirtableService } from "@/lib/airtable"

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

    const soportes = await AirtableService.getSoportes({
      search: search || undefined,
      categoria: categoria || undefined,
      estado: estado || undefined,
      tipo: tipo || undefined
    })

    // Aplicar paginación
    const total = soportes.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSoportes = soportes.slice(startIndex, endIndex)

    const totalPages = Math.ceil(total / limit)

    return withCors(NextResponse.json({
      soportes: paginatedSoportes,
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
    
    console.log('🆕 Creando nuevo soporte con datos:', data)
    
    // Validación básica
    if (!data['Título del soporte']) {
      return withCors(NextResponse.json(
        { error: "Título del soporte es requerido" },
        { status: 400 }
      ));
    }
    
    // Mapear datos al formato de Airtable
    const createData = {
      'Título del soporte': data['Título del soporte'],
      'Descripción': data['Descripción'] || '',
      'Tipo de soporte': data['Tipo de soporte'] || '',
      'Estado del soporte': data['Estado del soporte'] || 'DISPONIBLE',
      'Precio por mes': data['Precio por mes'] || null,
      dimensiones: data.dimensiones || { ancho: 0, alto: 0, area: 0 },
      imagenes: data.imagenes || [],
      ubicacion: data.ubicacion || '',
      ciudad: data.ciudad || '',
      pais: data.pais || '',
      'Código interno': data['Código interno'] || '',
      'Código cliente': data['Código cliente'] || '',
      'Impactos diarios': data['Impactos diarios'] || null,
      'Enlace de Google Maps': data['Enlace de Google Maps'] || '',
      'Propietario': data['Propietario'] || '',
      'Iluminación': data['Iluminación'] || false,
      'Destacado': data['Destacado'] || false
    }
    
    console.log('📤 Datos que se enviarán a Airtable:', createData)
    
    const newSoporte = await AirtableService.createSoporte(createData)
    
    if (!newSoporte) {
      console.error('❌ Error: AirtableService.createSoporte returned null');
      return withCors(NextResponse.json(
        { 
          success: false,
          error: "Error al crear en Airtable",
          details: "El servicio de Airtable no pudo crear el registro"
        },
        { status: 500 }
      ));
    }
    
    console.log('✅ Soporte creado exitosamente:', newSoporte);
    return withCors(NextResponse.json({
      success: true,
      data: newSoporte,
      message: "Soporte creado correctamente"
    }, { status: 201 }))
  } catch (error) {
    console.error("Error creating soporte:", error)
    return withCors(NextResponse.json(
      { 
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    ))
  }
}
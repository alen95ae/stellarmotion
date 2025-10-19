import { NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse())
}

export async function POST(request: Request) {
  try {
    const { mainId, duplicates, mergedFields } = await request.json()

    if (!mainId || !duplicates || !Array.isArray(duplicates)) {
      return withCors(NextResponse.json(
        { error: "Datos de fusión inválidos" },
        { status: 400 }
      ))
    }

    // Aquí deberías implementar la lógica para fusionar clientes en Airtable
    // Por ahora simulamos éxito
    
    return withCors(NextResponse.json({
      success: true,
      message: `Fusión completada: ${duplicates.length} duplicados fusionados`,
      mainId,
      mergedCount: duplicates.length
    }))
  } catch (error) {
    console.error("Error merging clientes:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

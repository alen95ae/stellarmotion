import { NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

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
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return withCors(NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      ))
    }

    const text = await file.text()
    const records = parse(text, { columns: true })

    let created = 0
    let updated = 0
    const errors: string[] = []

    for (const record of records) {
      try {
        // Mapear campos del CSV a la estructura de cliente
        const clienteData = {
          nombre: record.Nombre || record.nombre || '',
          email: record.Email || record.email || '',
          telefono: record.Teléfono || record.telefono || record.Telefono || '',
          direccion: record.Dirección || record.direccion || record.Direccion || '',
          nit: record.NIT || record.nit || '',
          estado: record.Estado || record.estado || 'activo'
        }

        // Validar campos requeridos
        if (!clienteData.nombre || !clienteData.email) {
          errors.push(`Registro inválido: ${JSON.stringify(record)}`)
          continue
        }

        // Aquí deberías implementar la lógica para crear/actualizar en Airtable
        // Por ahora simulamos éxito
        created++
      } catch (error) {
        errors.push(`Error procesando registro: ${error}`)
      }
    }

    return withCors(NextResponse.json({
      success: true,
      created,
      updated,
      errors: errors.slice(0, 10), // Limitar errores mostrados
      totalErrors: errors.length
    }))
  } catch (error) {
    console.error("Error importing clientes:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

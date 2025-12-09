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
    const ids = searchParams.get("ids")

    let clientes = await SupabaseService.getClientes()

    // Si se especifican IDs, filtrar solo esos clientes
    if (ids) {
      const idArray = ids.split(',')
      clientes = clientes.filter(cliente => idArray.includes(cliente.id))
    }

    // Convertir a CSV
    const csvHeaders = [
      'ID',
      'Nombre',
      'Email',
      'Teléfono',
      'Dirección',
      'NIT',
      'Estado',
      'Creado',
      'Actualizado'
    ]

    const csvRows = clientes.map(cliente => [
      cliente.id,
      cliente.nombre,
      cliente.email,
      cliente.telefono,
      cliente.direccion,
      cliente.nit,
      cliente.estado,
      cliente.createdAt.toISOString(),
      cliente.updatedAt.toISOString()
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', 'attachment; filename="clientes.csv"')
    
    return withCors(response)
  } catch (error) {
    console.error("Error exporting clientes:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

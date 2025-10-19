import { NextResponse } from 'next/server'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse())
}

export async function GET() {
  try {
    const csvContent = [
      'Nombre,Email,Teléfono,Dirección,NIT,Estado',
      'Ejemplo Cliente,cliente@ejemplo.com,1234567890,Calle 123,123456789,activo'
    ].join('\n')

    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', 'attachment; filename="plantilla_clientes.csv"')
    
    return withCors(response)
  } catch (error) {
    console.error("Error generating template:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

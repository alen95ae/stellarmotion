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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const clientes = await SupabaseService.getClientes()
    const cliente = clientes.find(c => c.id === id)

    if (!cliente) {
      return withCors(NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      ))
    }

    return withCors(NextResponse.json(cliente))
  } catch (error) {
    console.error("Error fetching cliente:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await req.json()

    // Aquí deberías implementar la lógica para actualizar en Airtable
    // Por ahora simulamos éxito
    
    return withCors(NextResponse.json({
      success: true,
      message: "Cliente actualizado correctamente"
    }))
  } catch (error) {
    console.error("Error updating cliente:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Aquí deberías implementar la lógica para eliminar en Airtable
    // Por ahora simulamos éxito
    
    return withCors(NextResponse.json({
      success: true,
      message: "Cliente eliminado correctamente"
    }))
  } catch (error) {
    console.error("Error deleting cliente:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

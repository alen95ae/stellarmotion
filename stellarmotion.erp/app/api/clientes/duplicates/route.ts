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

export async function GET() {
  try {
    const clientes = await SupabaseService.getClientes()
    
    // Agrupar por email para detectar duplicados
    const emailGroups = new Map<string, any[]>()
    
    clientes.forEach(cliente => {
      if (cliente.email) {
        const email = cliente.email.toLowerCase()
        if (!emailGroups.has(email)) {
          emailGroups.set(email, [])
        }
        emailGroups.get(email)!.push(cliente)
      }
    })

    // Filtrar solo grupos con más de un cliente
    const duplicates = Array.from(emailGroups.values())
      .filter(group => group.length > 1)
      .map(group => ({
        email: group[0].email,
        count: group.length,
        clients: group.map(c => ({
          id: c.id,
          nombre: c.nombre,
          email: c.email,
          telefono: c.telefono
        }))
      }))

    return withCors(NextResponse.json({
      duplicates,
      totalDuplicates: duplicates.reduce((sum, group) => sum + group.count, 0)
    }))
  } catch (error) {
    console.error("Error detecting duplicates:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const supportId = searchParams.get('supportId')
    const status = searchParams.get('status')
    
    const where: any = {}
    
    if (clientId) where.clientId = clientId
    if (supportId) where.supportId = supportId
    if (status) where.status = status
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true
          }
        },
        support: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            city: true,
            priceMonth: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    return withCors(NextResponse.json(reservations))
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validación básica
    if (!data.supportId || !data.clientId || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "supportId, clientId, startDate y endDate son requeridos" },
        { status: 400 }
      )
    }
    
    // Verificar que el soporte existe y está disponible
    const support = await prisma.support.findUnique({
      where: { id: data.supportId }
    })
    
    if (!support) {
      return NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      )
    }
    
    if (!support.available) {
      return NextResponse.json(
        { error: "Soporte no disponible" },
        { status: 409 }
      )
    }
    
    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: data.clientId }
    })
    
    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }
    
    // Calcular duración y monto
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = support.priceMonth ? (support.priceMonth / 30) * durationDays : 0
    
    const created = await prisma.reservation.create({ 
      data: {
        supportId: data.supportId,
        clientId: data.clientId,
        startDate: startDate,
        endDate: endDate,
        status: data.status || 'PENDING',
        notes: data.notes || null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true
          }
        },
        support: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            city: true,
            priceMonth: true,
            slug: true
          }
        }
      }
    })
    
    return withCors(NextResponse.json(created, { status: 201 }))
  } catch (error) {
    console.error("Error creating reservation:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

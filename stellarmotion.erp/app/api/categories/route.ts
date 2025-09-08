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
    const slug = searchParams.get('slug')
    
    // Si se busca por slug específico
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          supports: {
            where: { available: true },
            select: {
              id: true,
              slug: true,
              title: true,
              priceMonth: true,
              city: true,
              country: true,
              featured: true,
              imageUrl: true
            }
          }
        }
      })
      return withCors(NextResponse.json(category))
    }
    
    // Obtener todas las categorías
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            supports: {
              where: { available: true }
            }
          }
        }
      },
      orderBy: { label: 'asc' }
    })
    
    return withCors(NextResponse.json(categories))
  } catch (error) {
    console.error("Error fetching categories:", error)
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
    if (!data.slug || !data.label || !data.iconKey) {
      return NextResponse.json(
        { error: "Slug, label e iconKey son requeridos" },
        { status: 400 }
      )
    }
    
    const created = await prisma.category.create({ 
      data: {
        slug: data.slug,
        label: data.label,
        iconKey: data.iconKey
      }
    })
    
    return withCors(NextResponse.json(created, { status: 201 }))
  } catch (error) {
    console.error("Error creating category:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

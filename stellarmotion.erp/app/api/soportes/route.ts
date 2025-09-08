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

// Funciones de normalización y cálculo
function toNum(n: any) { const x = Number(n); return isFinite(x) ? x : 0 }
function calcArea(widthM?: any, heightM?: any) {
  return +(toNum(widthM) * toNum(heightM)).toFixed(2)
}
function calcProductionCost(areaM2: number, pricePerM2?: any) {
  return +(areaM2 * toNum(pricePerM2)).toFixed(2)
}
function mapAvailableFromStatus(status?: string) {
  return status === 'DISPONIBLE'
}

async function normalizeSupportInput(data: any, existing?: any) {
  // Usar los valores enviados directamente, solo usar existentes si no se envió nada
  const widthM  = data.widthM !== undefined ? data.widthM : existing?.widthM
  const heightM = data.heightM !== undefined ? data.heightM : existing?.heightM
  const areaM2  = calcArea(widthM, heightM)

  const status = (data.status ?? existing?.status ?? 'DISPONIBLE') as any

  // Calcula coste si NO está en override
  let productionCost = data.productionCost
  const override = Boolean(data.productionCostOverride ?? existing?.productionCostOverride)
  if (!override) {
    productionCost = calcProductionCost(areaM2, data.pricePerM2 ?? existing?.pricePerM2)
  }

  return {
    ...data,
    status,
    areaM2,
    productionCost,
    available: mapAvailableFromStatus(status), // compatibilidad con el booleano existente
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const statuses = (searchParams.get('status') || '')
      .split(',').map(s => s.trim()).filter(Boolean)
    const categoryId = searchParams.get('categoryId')
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const available = searchParams.get('available')
    
    // Si se busca por slug específico, devolver solo ese soporte
    if (slug) {
      const support = await prisma.support.findUnique({
        where: { slug },
        include: {
          company: { select: { name: true } },
          category: { select: { id: true, slug: true, label: true, iconKey: true } }
        }
      })
      return NextResponse.json(support)
    }
    
    const where: any = {
      AND: [
        statuses.length ? { status: { in: statuses as any } } : {},
        categoryId ? { categoryId } : {},
        featured ? { featured: featured === 'true' } : {},
        city ? { city: { contains: city } } : {},
        country ? { country: { contains: country } } : {},
        available ? { available: available === 'true' } : {},
        {
          OR: [
            { code: { contains: q } },
            { title: { contains: q } },
            { type: { contains: q } },
            { city: { contains: q } },
            { owner: { contains: q } },
            { slug: { contains: q } },
            { shortDescription: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ]
        }
      ]
    }
    
    if (!q && !statuses.length && !categoryId && !featured && !city && !country && !available) {
      delete where.AND
      where.OR = [
        { code: { contains: '' } },
        { title: { contains: '' } },
        { type: { contains: '' } },
        { city: { contains: '' } },
        { owner: { contains: '' } },
      ]
    }
    
    const supports = await prisma.support.findMany({
      where,
      include: {
        company: {
          select: { name: true }
        },
        category: {
          select: { id: true, slug: true, label: true, iconKey: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Para el panel de administración, devolver todos los soportes
    // Para la web pública, filtrar solo los que tienen coordenadas válidas
    const isPublicWeb = req.headers.get('referer')?.includes('/buscar-un-espacio') || 
                       req.headers.get('referer')?.includes('/search') ||
                       req.headers.get('user-agent')?.includes('bot')
    
    if (isPublicWeb) {
      // Filtrar soportes con coordenadas válidas para la web pública
      const validSupports = supports.filter(support => {
        const lat = support.latitude
        const lng = support.longitude
        return lat != null && lng != null && 
               typeof lat === 'number' && typeof lng === 'number' &&
               !isNaN(lat) && !isNaN(lng) &&
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180
      })
      return withCors(NextResponse.json(validSupports))
    }
    
    // Para el panel de administración, devolver todos los soportes
    return withCors(NextResponse.json(supports))
  } catch (error) {
    console.error("Error fetching supports:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validación básica - para web pública, slug es opcional pero recomendado
    if (!data.title) {
      return NextResponse.json(
        { error: "Título es requerido" },
        { status: 400 }
      )
    }
    
    // Si no hay código, generar uno automáticamente con formato SM-0001, SM-0002, etc.
    if (!data.code) {
      // Buscar el último código existente con formato SM-XXXX
      const lastSupport = await prisma.support.findFirst({
        where: {
          code: {
            startsWith: 'SM-'
          }
        },
        orderBy: {
          code: 'desc'
        }
      })
      
      let nextNumber = 1
      if (lastSupport) {
        // Extraer el número del último código (ej: SM-0001 -> 1)
        const match = lastSupport.code.match(/SM-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      // Generar el nuevo código con formato SM-0001, SM-0002, etc.
      data.code = `SM-${nextNumber.toString().padStart(4, '0')}`
    }
    
    // Si no hay slug, generar uno automáticamente basado en el título
    if (!data.slug) {
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      let slug = baseSlug
      let counter = 1
      
      // Verificar que el slug sea único
      while (await prisma.support.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      data.slug = slug
    }
    
    const payload = await normalizeSupportInput(data)
    
    const created = await prisma.support.create({ 
      data: {
        ...payload,
        priceMonth: payload.priceMonth ? parseFloat(payload.priceMonth) : null,
        widthM: payload.widthM ? parseFloat(payload.widthM) : null,
        heightM: payload.heightM ? parseFloat(payload.heightM) : null,
        latitude: payload.latitude ? parseFloat(payload.latitude) : null,
        longitude: payload.longitude ? parseFloat(payload.longitude) : null,
        pricePerM2: payload.pricePerM2 ? parseFloat(payload.pricePerM2) : null,
        areaM2: payload.areaM2 ? parseFloat(payload.areaM2) : null,
        productionCost: payload.productionCost ? parseFloat(payload.productionCost) : null,
        dailyImpressions: payload.dailyImpressions ? parseInt(payload.dailyImpressions) : null,
        rating: payload.rating ? parseFloat(payload.rating) : null,
        reviewsCount: payload.reviewsCount ? parseInt(payload.reviewsCount) : 0,
        printingCost: payload.printingCost ? parseFloat(payload.printingCost) : null,
      }
    })
    
    return withCors(NextResponse.json(created, { status: 201 }))
  } catch (error) {
    console.error("Error creating support:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

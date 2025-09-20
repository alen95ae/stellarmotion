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

// GET - Obtener un soporte específico
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return withCors(NextResponse.json(
        { error: "ID de soporte requerido" },
        { status: 400 }
      ));
    }

    const support = await prisma.support.findUnique({
      where: { id },
      include: {
        company: { select: { name: true } },
        category: { select: { id: true, slug: true, label: true, iconKey: true } },
        partner: { select: { id: true, name: true, companyName: true, email: true } }
      }
    });

    if (!support) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    return withCors(NextResponse.json(support));
  } catch (error) {
    console.error("Error fetching support:", error);
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ));
  }
}

// PUT - Actualizar un soporte existente
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json()
    
    console.log('ERP: Actualizando soporte con ID:', id);
    console.log('ERP: Datos recibidos:', data);
    
    if (!id) {
      return withCors(NextResponse.json(
        { error: "ID de soporte requerido" },
        { status: 400 }
      ));
    }

    // Verificar que el soporte existe
    const existingSupport = await prisma.support.findUnique({
      where: { id }
    });

    console.log('ERP: Soporte encontrado:', existingSupport ? 'SÍ' : 'NO');
    if (existingSupport) {
      console.log('ERP: Soporte existente:', existingSupport.id, existingSupport.title);
    }

    if (!existingSupport) {
      console.log('ERP: Error - Soporte no encontrado con ID:', id);
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    // Permitir edición sin verificación de permisos por ahora
    
    // Si no hay partnerId en los datos, usar el existente
    if (!data.partnerId) {
      data.partnerId = existingSupport.partnerId;
    }
    
    // Validar que el partner existe
    if (data.partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: data.partnerId }
      })
      if (!partner) {
        return withCors(NextResponse.json(
          { error: "Partner no encontrado" },
          { status: 400 }
        ));
      }
    }
    
    // Validación básica
    if (!data.title) {
      return withCors(NextResponse.json(
        { error: "Título es requerido" },
        { status: 400 }
      ));
    }
    
    const payload = await normalizeSupportInput(data, existingSupport)
    
    // Normalizar imageUrl: si es una ruta local, asegurar que empiece con /
    let normalizedImageUrl = payload.imageUrl
    if (normalizedImageUrl && !normalizedImageUrl.startsWith('http') && !normalizedImageUrl.startsWith('/')) {
      normalizedImageUrl = `/${normalizedImageUrl}`
    }
    
    // Normalizar images: procesar array de imágenes
    let normalizedImages = payload.images
    if (normalizedImages) {
      if (typeof normalizedImages === 'string') {
        try {
          normalizedImages = JSON.parse(normalizedImages)
        } catch (e) {
          console.warn('Error parsing images JSON:', e)
          normalizedImages = []
        }
      }
      if (Array.isArray(normalizedImages)) {
        normalizedImages = normalizedImages.map(img => {
          if (img && !img.startsWith('http') && !img.startsWith('/')) {
            return `/${img}`
          }
          return img
        }).filter(Boolean)
      }
    }
    
    const updated = await prisma.support.update({
      where: { id },
      data: {
        ...payload,
        imageUrl: normalizedImageUrl || null,
        images: normalizedImages ? JSON.stringify(normalizedImages) : null,
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
    
    return withCors(NextResponse.json(updated, { status: 200 }))
  } catch (error) {
    console.error("Error updating support:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}

// DELETE - Eliminar un soporte
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return withCors(NextResponse.json(
        { error: "ID de soporte requerido" },
        { status: 400 }
      ));
    }

    // Verificar que el soporte existe
    const existingSupport = await prisma.support.findUnique({
      where: { id }
    });

    if (!existingSupport) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    // Permitir eliminación sin verificación de permisos por ahora
    
    await prisma.support.delete({
      where: { id }
    })
    
    return withCors(NextResponse.json({ success: true }, { status: 200 }))
  } catch (error) {
    console.error("Error deleting support:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}
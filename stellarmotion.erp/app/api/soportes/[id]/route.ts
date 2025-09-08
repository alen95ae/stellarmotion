import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
  const widthM  = data.widthM ?? existing?.widthM
  const heightM = data.heightM ?? existing?.heightM
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await prisma.support.findUnique({ 
      where: { id },
      include: {
        company: {
          select: { name: true }
        }
      }
    })
    
    if (!item) {
      return NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching support:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await req.json()
    
    console.log("API PUT - Datos recibidos:", data)
    console.log("API PUT - ID:", id)
    
    // Validación básica
    if (!data.code || !data.title) {
      console.log("API PUT - Error de validación:", { code: data.code, title: data.title })
      return NextResponse.json(
        { error: "Código y título son requeridos" },
        { status: 400 }
      )
    }
    
    // Leer el soporte existente para normalización
    const existing = await prisma.support.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      )
    }
    
    const payload = await normalizeSupportInput(data, existing)
    console.log("API PUT - Payload normalizado:", payload)
    
    const allowedKeys = [
      'code','title','type','status','owner','imageUrl','description','city','country','lighting','available','slug','categoryId','featured',
      // numéricas/casteadas
      'priceMonth','widthM','heightM','latitude','longitude','pricePerM2','areaM2','productionCost','dailyImpressions','printingCost','rating','reviewsCount'
    ] as const

    const base: Record<string, any> = {}
    for (const k of Object.keys(payload)) {
      if ((allowedKeys as readonly string[]).includes(k)) base[k] = (payload as any)[k]
    }

    const updateData = {
      ...base,
      priceMonth: base.priceMonth !== undefined ? parseFloat(base.priceMonth) : null,
      widthM: base.widthM !== undefined ? parseFloat(base.widthM) : null,
      heightM: base.heightM !== undefined ? parseFloat(base.heightM) : null,
      latitude: base.latitude !== undefined ? parseFloat(base.latitude) : null,
      longitude: base.longitude !== undefined ? parseFloat(base.longitude) : null,
      pricePerM2: base.pricePerM2 !== undefined ? parseFloat(base.pricePerM2) : null,
      areaM2: base.areaM2 !== undefined ? parseFloat(base.areaM2) : null,
      productionCost: base.productionCost !== undefined ? parseFloat(base.productionCost) : null,
      dailyImpressions: base.dailyImpressions !== undefined ? parseInt(base.dailyImpressions) : null,
      printingCost: base.printingCost !== undefined ? parseFloat(base.printingCost) : null,
      rating: base.rating !== undefined ? parseFloat(base.rating) : null,
      reviewsCount: base.reviewsCount !== undefined ? parseInt(base.reviewsCount) : 0,
    }
    
    console.log("API PUT - Datos finales para actualizar:", updateData)
    
    let updated
    try {
      updated = await prisma.support.update({ 
        where: { id }, 
        data: updateData
      })
    } catch (e: any) {
      console.error('API PUT - Prisma error:', e)
      if (e?.code === 'P2002') {
        return NextResponse.json({ error: 'Código duplicado' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Error al actualizar en base de datos' }, { status: 500 })
    }
    
    console.log("API PUT - Soporte actualizado:", updated)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating support:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.support.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting support:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

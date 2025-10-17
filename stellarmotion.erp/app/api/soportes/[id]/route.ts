import { NextResponse } from "next/server"
import { AirtableService } from "@/lib/airtable"

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

    const support = await AirtableService.getSoporteById(id);

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
    const existingSupport = await AirtableService.getSoporteById(id);

    console.log('ERP: Soporte encontrado:', existingSupport ? 'SÍ' : 'NO');
    if (existingSupport) {
      console.log('ERP: Soporte existente:', existingSupport.id, existingSupport.nombre);
    }

    if (!existingSupport) {
      console.log('ERP: Error - Soporte no encontrado con ID:', id);
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    // Validación básica
    if (!data.nombre) {
      return withCors(NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      ));
    }
    
    // Mapear datos al formato de Airtable
    const updateData = {
      nombre: data.nombre || existingSupport.nombre,
      descripcion: data.descripcion || existingSupport.descripcion,
      ubicacion: data.ubicacion || existingSupport.ubicacion,
      latitud: data.latitud || existingSupport.latitud,
      longitud: data.longitud || existingSupport.longitud,
      tipo: data.tipo || existingSupport.tipo,
      estado: data.estado || existingSupport.estado,
      precio: data.precio || existingSupport.precio,
      dimensiones: data.dimensiones || existingSupport.dimensiones,
      imagenes: data.imagenes || existingSupport.imagenes,
      categoria: data.categoria || existingSupport.categoria
    }
    
    const updated = await AirtableService.updateSoporte(id, updateData);
    
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
    const existingSupport = await AirtableService.getSoporteById(id);

    if (!existingSupport) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    const success = await AirtableService.deleteSoporte(id);
    
    if (!success) {
      return withCors(NextResponse.json(
        { error: "Error al eliminar el soporte" },
        { status: 500 }
      ));
    }
    
    return withCors(NextResponse.json({ success: true }, { status: 200 }))
  } catch (error) {
    console.error("Error deleting support:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}
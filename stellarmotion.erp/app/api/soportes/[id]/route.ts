import { NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
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

    const support = await SupabaseService.getSoporteById(id);

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

// Tipos válidos de la UI (según especificación)
const TIPOS_UI_VALIDOS = [
  'Valla',
  'Pantalla',
  'Mural',
  'Mupi',
  'Parada de Bus',
  'Display',
  'Letrero',
  'Cartelera'
] as const;

// Normalizar tipo: usar los valores de la UI (Valla, Mupi, etc.) con casing consistente.
// Sin mapeo a Unipolar ni valores de otro sistema.
function normalizarTipoSoporte(tipo: string): string {
  const trimmed = String(tipo).trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  const canonical = TIPOS_UI_VALIDOS.find(t => t.toLowerCase() === lower);
  if (canonical) return canonical;
  // Si no coincide exacto, devolver con primera letra en mayúscula por palabra
  return trimmed.replace(/\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// Validación dura: verificar que el tipo esté en la lista permitida de la UI
function validarTipoSoporte(tipo: string): { valido: boolean; error?: string } {
  const tipoTrimmed = String(tipo).trim();
  
  // Verificar si está en la lista de tipos válidos de la UI (case-insensitive)
  const tipoLower = tipoTrimmed.toLowerCase();
  const tiposValidosLower = TIPOS_UI_VALIDOS.map(t => t.toLowerCase());
  
  if (!tiposValidosLower.includes(tipoLower)) {
    return {
      valido: false,
      error: `Tipo de soporte inválido: "${tipoTrimmed}". Tipos permitidos: ${TIPOS_UI_VALIDOS.join(', ')}`
    };
  }
  
  return { valido: true };
}

// PUT - Actualizar un soporte existente
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("🔐 Using service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
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
    const existingSupport = await SupabaseService.getSoporteById(id);

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

    // ✅ CORRECCIÓN: Aceptar 'title' O 'titulo' O 'Título del soporte' (igual que POST)
    const titulo = data.title || data.titulo || data['Título del soporte'] || existingSupport.nombre;
    
    if (!titulo || !titulo.trim()) {
      return withCors(NextResponse.json(
        { error: "Título del soporte es requerido" },
        { status: 400 }
      ));
    }
    
    // ✅ Validar y normalizar tipo de soporte (igual que POST)
    const tipoRaw = data.type || data.tipo || data['Tipo de soporte'] || existingSupport.tipo;
    
    if (tipoRaw && tipoRaw.trim()) {
      // Validación dura: debe estar en la lista de tipos válidos de la UI
      const validacion = validarTipoSoporte(tipoRaw);
      if (!validacion.valido) {
        return withCors(NextResponse.json(
          { error: validacion.error },
          { status: 400 }
        ));
      }
    }
    
    // Normalizar al enum de Supabase
    const tipoNormalizado = tipoRaw && tipoRaw.trim() 
      ? normalizarTipoSoporte(tipoRaw)
      : existingSupport.tipo;
    
    if (tipoRaw && tipoRaw.trim()) {
      console.log(`🔄 Tipo normalizado: "${tipoRaw}" → "${tipoNormalizado}"`);
    }
    
    // Preparar datos para actualizar soporte
    // ✅ Normalizar todos los campos desde inglés/español (igual que POST)
    const updateData = {
      'Título del soporte': titulo,
      'Descripción': data.description || data.descripcion || data['Descripción'] || existingSupport.descripcion,
      ubicacion: data.address || data.ubicacion || existingSupport.ubicacion,
      ciudad: data.city || data.ciudad || existingSupport.ciudad,
      pais: data.country || data.pais || existingSupport.pais,
      latitud: data.latitude || data.latitud || existingSupport.latitud,
      longitud: data.longitude || data.longitud || existingSupport.longitud,
      streetViewHeading: data.streetViewHeading !== undefined ? data.streetViewHeading : (existingSupport as any).streetViewHeading,
      streetViewPitch: data.streetViewPitch !== undefined ? data.streetViewPitch : (existingSupport as any).streetViewPitch,
      streetViewZoom: data.streetViewZoom !== undefined ? data.streetViewZoom : (existingSupport as any).streetViewZoom,
      'Tipo de soporte': tipoNormalizado,
      'Estado del soporte': data.status || data.estado || data['Estado del soporte'] || existingSupport.estado,
      'Precio por mes': data.priceMonth || data.pricePerMonth || data.precio_mes || data['Precio por mes'] || existingSupport.precio,
      dimensiones: data.dimensiones || { 
        ancho: data.widthM || data.ancho || existingSupport.dimensiones?.ancho || 0, 
        alto: data.heightM || data.alto || existingSupport.dimensiones?.alto || 0, 
        area: ((data.widthM || data.ancho || existingSupport.dimensiones?.ancho || 0) * (data.heightM || data.alto || existingSupport.dimensiones?.alto || 0))
      },
      imagenes: data.images || data.imagenes || existingSupport.imagenes,
      categoria: data.categoria || existingSupport.categoria,
      'Código interno': data.code || data.codigo || data.codigo_interno || data['Código interno'] || existingSupport.codigoInterno,
      'Código cliente': data.codigo_cliente || data['Código cliente'] || existingSupport.codigoCliente,
      'Enlace de Google Maps': data.googleMapsLink || data.google_maps_url || data.enlace_maps || data['Enlace de Google Maps'] || existingSupport.googleMapsLink,
      showApproximateLocation: data.showApproximateLocation !== undefined ? data.showApproximateLocation : (existingSupport as any).showApproximateLocation,
      approximateRadius: data.approximateRadius !== undefined ? data.approximateRadius : (existingSupport as any).approximateRadius,
      priceRangeEnabled: data.priceRangeEnabled !== undefined ? data.priceRangeEnabled : (existingSupport as any).priceRangeEnabled,
      priceMin: data.priceMin !== undefined ? data.priceMin : (existingSupport as any).priceMin,
      priceMax: data.priceMax !== undefined ? data.priceMax : (existingSupport as any).priceMax,
      rentalPeriod: data.rentalPeriod !== undefined ? data.rentalPeriod : (existingSupport as any).rentalPeriod,
      'Propietario': data.owner || data.propietario || data.usuarioId || data['Propietario'] || existingSupport.owner,
      'Iluminación': data.lighting !== undefined ? data.lighting : (data.iluminacion !== undefined ? data.iluminacion : (data['Iluminación'] !== undefined ? data['Iluminación'] : existingSupport.iluminacion)),
      'Destacado': data.featured !== undefined ? data.featured : (data.destacado !== undefined ? data.destacado : (data['Destacado'] !== undefined ? data['Destacado'] : existingSupport.destacado))
    }
    
    console.log('📤 Datos que se enviarán a Supabase:', updateData);
    
    const updated = await SupabaseService.updateSoporte(id, updateData);
    
    if (!updated) {
      console.error('❌ Error: SupabaseService.updateSoporte returned null');
      return withCors(NextResponse.json(
        { 
          success: false,
          error: "Error al actualizar el soporte",
          details: "No se pudo actualizar el registro en Supabase"
        },
        { status: 500 }
      ));
    }
    
    console.log('✅ Soporte actualizado exitosamente:', updated);
    return withCors(NextResponse.json({
      success: true,
      data: updated,
      message: "Soporte actualizado correctamente"
    }, { status: 200 }))
  } catch (error) {
    console.error("Error updating support:", error)
    return withCors(NextResponse.json(
      { 
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    ))
  }
}

// PATCH - Actualización parcial (p. ej. solo destacado)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return withCors(NextResponse.json(
        { error: "ID de soporte requerido" },
        { status: 400 }
      ));
    }
    const data = await req.json().catch(() => ({}));
    const featured = data.featured ?? data.destacado ?? data['Destacado'];
    if (typeof featured !== 'boolean') {
      return withCors(NextResponse.json(
        { error: "Se requiere 'featured' (boolean)" },
        { status: 400 }
      ));
    }
    const existingSupport = await SupabaseService.getSoporteById(id);
    if (!existingSupport) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }
    const updated = await SupabaseService.updateSoporte(id, { destacado: featured });
    if (!updated) {
      return withCors(NextResponse.json(
        { error: "Error al actualizar el soporte" },
        { status: 500 }
      ));
    }
    return withCors(NextResponse.json({ success: true, data: updated }, { status: 200 }));
  } catch (error) {
    console.error("Error PATCH support:", error);
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ));
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
    const existingSupport = await SupabaseService.getSoporteById(id);

    if (!existingSupport) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ));
    }

    const success = await SupabaseService.deleteSoporte(id);
    
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
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SupabaseService } from "@/lib/supabase-service"
import { verifySession } from "@/lib/auth"

// Forzar runtime Node.js (no edge) para asegurar carga correcta de variables de entorno
export const runtime = "nodejs"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  try {
    // DIAGNÓSTICO: Verificar Service Role Key en runtime
    const srkStatus = process.env.SUPABASE_SERVICE_ROLE_KEY ? "LOADED" : "EMPTY";
    console.log('📡 GET /api/soportes - Iniciando...');
    console.log('🔑 [soportes] SRK:', srkStatus);
    
    if (srkStatus === "EMPTY") {
      console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is EMPTY at runtime!');
      console.error('  cwd:', process.cwd());
      console.error('  NODE_ENV:', process.env.NODE_ENV);
    }
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || searchParams.get("q") || ""
    const categoria = searchParams.get("categoria") || ""
    // El frontend envía 'status' pero también puede venir como 'estado'
    const estado = searchParams.get("estado") || searchParams.get("status") || ""
    const tipo = searchParams.get("tipo") || ""
    const usuarioId = searchParams.get("usuarioId") || ""
    let ownerId = searchParams.get("ownerId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!ownerId) {
      try {
        const cookieStore = await cookies()
        const token = cookieStore.get("st_session")?.value
        if (token) {
          const payload = await verifySession(token)
          const role = (payload?.role as string)?.toLowerCase?.()
          if (role === "owner" && payload?.sub) ownerId = payload.sub
        }
      } catch (_) {}
    }

    console.log('🔍 Filtros recibidos:', { 
      search, 
      categoria, 
      estado, 
      tipo, 
      usuarioId,
      ownerId: ownerId || undefined,
      page,
      limit,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Si estado viene como array (ej: "DISPONIBLE,RESERVADO"), no aplicar filtro en DB
    // Lo filtraremos en memoria después
    const estadoFilter = estado.includes(',') ? undefined : (estado || undefined);

    // Llamar a getSoportes con paginación real
    const { soportes, total: totalBeforeMultiEstado } = await SupabaseService.getSoportes({
      search: search || undefined,
      categoria: categoria || undefined,
      estado: estadoFilter,
      tipo: tipo || undefined,
      usuarioId: usuarioId || undefined,
      ownerId: ownerId || undefined,
      page,
      limit
    })

    // Si hay múltiples estados, filtrar en memoria (edge case poco común)
    let filteredSoportes = soportes;
    let total = totalBeforeMultiEstado;
    
    if (estado && estado.includes(',')) {
      const estadosArray = estado.split(',').map(e => e.trim().toLowerCase());
      filteredSoportes = soportes.filter(s => 
        estadosArray.includes(s.estado.toLowerCase())
      );
      total = filteredSoportes.length; // Nota: esto es aproximado para el caso multi-estado
      console.log(`🔍 Filtrado por múltiples estados: ${filteredSoportes.length} en esta página`);
    }

    console.log(`✅ Soportes obtenidos: ${filteredSoportes.length}`);

    const totalPages = Math.ceil(total / limit)

    console.log(`📊 Paginación: ${filteredSoportes.length} de ${total} (página ${page}/${totalPages})`);

    return withCors(NextResponse.json({
      soportes: filteredSoportes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }))
  } catch (error) {
    console.error("❌ Error fetching soportes:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    // Mensaje más descriptivo según el tipo de error
    let errorMessage = "Error interno del servidor";
    if (error instanceof Error) {
      if (error.message.includes('SUPABASE') || error.message.includes('configurada')) {
        errorMessage = `Error de configuración: ${error.message}`;
      } else if (error.message.includes('JWT') || error.message.includes('autenticación')) {
        errorMessage = `Error de autenticación con Supabase: ${error.message}`;
      } else {
        errorMessage = error.message;
      }
    }
    
    return withCors(NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    ))
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

export async function POST(request: Request) {
  try {
    console.log("🔐 Using service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
    const data = await request.json()
    
    console.log('🆕 Creando nuevo soporte con datos:', data)
    
    // ✅ CORRECCIÓN: Aceptar 'title' O 'Título del soporte'
    const titulo = data.title || data.titulo || data['Título del soporte']
    
    if (!titulo || !titulo.trim()) {
      return withCors(NextResponse.json(
        { error: "Título del soporte es requerido" },
        { status: 400 }
      ));
    }
    
    // ✅ Validar y normalizar tipo de soporte
    const tipoRaw = data.type || data.tipo || data['Tipo de soporte'] || '';
    
    if (!tipoRaw || !tipoRaw.trim()) {
      return withCors(NextResponse.json(
        { error: "Tipo de soporte es requerido" },
        { status: 400 }
      ));
    }
    
    // Validación dura: debe estar en la lista de tipos válidos de la UI
    const validacion = validarTipoSoporte(tipoRaw);
    if (!validacion.valido) {
      return withCors(NextResponse.json(
        { error: validacion.error },
        { status: 400 }
      ));
    }
    
    // Normalizar al enum de Supabase
    const tipoNormalizado = normalizarTipoSoporte(tipoRaw);
    console.log(`🔄 Tipo normalizado: "${tipoRaw}" → "${tipoNormalizado}"`)
    
    // Preparar datos para crear soporte
    // ✅ Normalizar todos los campos desde inglés/español
    const createData = {
      'Título del soporte': titulo,
      'Descripción': data.description || data.descripcion || data['Descripción'] || '',
      'Tipo de soporte': tipoNormalizado,
      'Estado del soporte': data.status || data.estado || data['Estado del soporte'] || 'DISPONIBLE',
      'Precio por mes': data.priceMonth || data.pricePerMonth || data.precio_mes || data['Precio por mes'] || null,
      dimensiones: data.dimensiones || { 
        ancho: data.widthM || data.ancho || 0, 
        alto: data.heightM || data.alto || 0, 
        area: (data.widthM || 0) * (data.heightM || 0) 
      },
      imagenes: data.images || data.imagenes || [],
      ubicacion: data.address || data.ubicacion || '',
      ciudad: data.city || data.ciudad || '',
      pais: data.country || data.pais || '',
      'Código interno': data.code || data.codigo || data.codigo_interno || data['Código interno'] || '',
      'Código cliente': data.codigo_cliente || data['Código cliente'] || '',
      'Impactos diarios': data.dailyImpressions || data.impactos_diarios || data.impactosDiarios || data['Impactos diarios'] || null,
      'Enlace de Google Maps': data.googleMapsLink || data.google_maps_url || data.enlace_maps || data['Enlace de Google Maps'] || '',
      latitud: data.latitud != null ? data.latitud : null,
      longitud: data.longitud != null ? data.longitud : null,
      streetViewHeading: data.streetViewHeading,
      streetViewPitch: data.streetViewPitch,
      streetViewZoom: data.streetViewZoom,
      'Propietario': data.owner || data.propietario || data.usuarioId || data['Propietario'] || '',
      'Iluminación': data.lighting || data.iluminacion || data['Iluminación'] || false,
      'Destacado': data.featured || data.destacado || data['Destacado'] || false
    }
    
    console.log('📤 Datos que se enviarán a Supabase:', createData)
    
    const newSoporte = await SupabaseService.createSoporte(createData)
    
    if (!newSoporte) {
      console.error('❌ Error: SupabaseService.createSoporte returned null');
      return withCors(NextResponse.json(
        { 
          success: false,
          error: "Error al crear el soporte",
          details: "No se pudo crear el registro en Supabase"
        },
        { status: 500 }
      ));
    }
    
    console.log('✅ Soporte creado exitosamente:', newSoporte);
    return withCors(NextResponse.json({
      success: true,
      data: newSoporte,
      message: "Soporte creado correctamente"
    }, { status: 201 }))
  } catch (error) {
    console.error("Error creating soporte:", error)
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

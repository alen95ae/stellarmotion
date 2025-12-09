import { NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

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
    const ownerId = searchParams.get("ownerId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    console.log('🔍 Filtros recibidos:', { 
      search, 
      categoria, 
      estado, 
      tipo, 
      ownerId,
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

export async function POST(request: Request) {
  try {
    // LOG TEMPORAL: Verificar que estamos usando service role
    console.log("🔐 Using service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
    const data = await request.json()
    
    console.log('🆕 Creando nuevo soporte con datos:', data)
    
    // Validación básica
    if (!data['Título del soporte']) {
      return withCors(NextResponse.json(
        { error: "Título del soporte es requerido" },
        { status: 400 }
      ));
    }
    
    // Mapear datos al formato de Airtable
    const createData = {
      'Título del soporte': data['Título del soporte'],
      'Descripción': data['Descripción'] || '',
      'Tipo de soporte': data['Tipo de soporte'] || '',
      'Estado del soporte': data['Estado del soporte'] || 'DISPONIBLE',
      'Precio por mes': data['Precio por mes'] || null,
      dimensiones: data.dimensiones || { ancho: 0, alto: 0, area: 0 },
      imagenes: data.imagenes || [],
      ubicacion: data.ubicacion || '',
      ciudad: data.ciudad || '',
      pais: data.pais || '',
      'Código interno': data['Código interno'] || '',
      'Código cliente': data['Código cliente'] || '',
      'Impactos diarios': data['Impactos diarios'] || null,
      'Enlace de Google Maps': data['Enlace de Google Maps'] || '',
      'Propietario': data['Propietario'] || '',
      'Iluminación': data['Iluminación'] || false,
      'Destacado': data['Destacado'] || false
    }
    
    console.log('📤 Datos que se enviarán a Airtable:', createData)
    
    const newSoporte = await SupabaseService.createSoporte(createData)
    
    if (!newSoporte) {
      console.error('❌ Error: SupabaseService.createSoporte returned null');
      return withCors(NextResponse.json(
        { 
          success: false,
          error: "Error al crear en Airtable",
          details: "El servicio de Airtable no pudo crear el registro"
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
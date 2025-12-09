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

export async function GET() {
  const startTime = Date.now();
  try {
    console.log('📡 GET /api/categories - Iniciando...');
    
    const categorias = await SupabaseService.getCategorias()
    
    const duration = Date.now() - startTime;
    console.log(`✅ GET /api/categories completado en ${duration}ms, ${categorias.length} categorias`);
    
    return withCors(NextResponse.json(categorias))
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ GET /api/categories falló después de ${duration}ms:`, error);
    
    // Mensaje específico según el tipo de error
    let errorMessage = "Error al obtener categorías";
    let statusCode = 500;
    
    if (error instanceof Error) {
      const msg = error.message;
      
      // Error de tabla no existente
      if (msg.includes('relation') && msg.includes('does not exist')) {
        console.warn('⚠️ Tabla "categorias" no existe en Supabase');
        errorMessage = 'Tabla de categorías no configurada';
        statusCode = 503; // Service Unavailable
      }
      // Error de autenticación
      else if (msg.includes('JWT') || msg.includes('autenticación') || msg.includes('SUPABASE')) {
        errorMessage = `Error de configuración: ${msg}`;
        statusCode = 500;
      }
      // Otros errores
      else {
        errorMessage = msg;
      }
    }
    
    console.error(`❌ Respondiendo con error ${statusCode}: ${errorMessage}`);
    
    return withCors(NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        categorias: [] // Fallback: retornar array vacío para no romper el frontend
      },
      { status: statusCode }
    ))
  }
}
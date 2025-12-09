import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

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
  
  // DIAGNÓSTICO CRÍTICO: Verificar variables en runtime
  const srkStatus = process.env.SUPABASE_SERVICE_ROLE_KEY ? "LOADED" : "EMPTY";
  const urlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? "LOADED" : "EMPTY";
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const srkLength = srk.length;
  const srkStartsWithEyJ = srk.startsWith('eyJ');
  const srkFirstChars = srk.substring(0, 20);
  
  console.log('🧪 [test-supabase] Testing Supabase connection...');
  console.log('📡 [test-supabase] SRK:', srkStatus);
  console.log('📡 [test-supabase] URL:', urlStatus);
  console.log('📡 [test-supabase] cwd:', process.cwd());
  console.log('📡 [test-supabase] SRK length:', srkLength);
  console.log('📡 [test-supabase] SRK starts with eyJ:', srkStartsWithEyJ);
  
  try {
    
    // Test 1: Verificar conexión básica
    const { data: testData, error: testError } = await supabaseServer
      .from('soportes')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection test failed:', testError);
      return withCors(NextResponse.json({
        ok: false,
        success: false,
        message: 'Error de conexión con Supabase',
        error: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint,
        env: {
          urlStatus,
          srkStatus,
          urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          srkLength,
          srkStartsWithEyJ,
          srkFirstChars: srkFirstChars + '...'
        },
        elapsedMs: Date.now() - startTime
      }, { status: 500 }));
    }

    // Test 2: Contar registros
    const { count, error: countError } = await supabaseServer
      .from('soportes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting records:', countError);
    }

    // Test 3: Obtener un registro completo
    const { data: sampleData, error: sampleError } = await supabaseServer
      .from('soportes')
      .select('*')
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('❌ Error fetching sample:', sampleError);
    }

    const elapsedMs = Date.now() - startTime;

    return withCors(NextResponse.json({
      ok: true,
      success: true,
      message: '✅ Conexión exitosa con Supabase',
      connection: true,
      count: count || 0,
      elapsedMs,
      sampleRecord: sampleData ? {
        id: sampleData.id,
        titulo: sampleData.titulo,
        tipo_soporte: sampleData.tipo_soporte,
        estado: sampleData.estado
      } : null,
      env: {
        urlStatus,
        srkStatus,
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        cwd: process.cwd(),
        srkLength,
        srkStartsWithEyJ,
        srkFirstChars: srkFirstChars + '...'
      }
    }));
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    return withCors(NextResponse.json({
      ok: false,
      success: false,
      message: 'Error interno del servidor',
      connection: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        urlStatus,
        srkStatus,
        cwd: process.cwd(),
        srkLength,
        srkStartsWithEyJ,
        srkFirstChars: srkFirstChars + '...'
      },
      elapsedMs: Date.now() - startTime
    }, { status: 500 }));
  }
}


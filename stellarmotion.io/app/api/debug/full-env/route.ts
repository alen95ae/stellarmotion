import { NextResponse } from 'next/server';

// ⚠️ FORZAR RUNTIME NODE.JS - CRÍTICO PARA ACCESO A process.env
export const runtime = 'nodejs';

/**
 * 🔍 ENDPOINT DE DIAGNÓSTICO PROFUNDO
 * 
 * Este endpoint verifica TODA la configuración del entorno de ejecución:
 * - Runtime actual (debe ser nodejs, NO edge)
 * - Variables de entorno cargadas
 * - Directorio de trabajo
 * - Versión de Node.js
 * - Estado de variables críticas de Supabase
 * 
 * USO: http://localhost:3001/api/debug/full-env
 * 
 * IMPORTANTE: Solo para desarrollo - NO usar en producción
 */
export async function GET() {
  try {
    // Información del runtime
    const runtime = process.env.NEXT_RUNTIME || 'nodejs';
    const cwd = process.cwd();
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;

    // Variables de entorno de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Todas las claves de variables de entorno
    const allEnvKeys = Object.keys(process.env);
    const supabaseKeys = allEnvKeys.filter(k => k.includes('SUPABASE'));
    const nextKeys = allEnvKeys.filter(k => k.startsWith('NEXT_'));

    // Estado de variables críticas
    const criticalVars = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ CARGADA' : '❌ FALTA',
      SUPABASE_SERVICE_ROLE_KEY: serviceKey ? '✅ CARGADA' : '❌ FALTA',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? '✅ CARGADA' : '❌ FALTA',
    };

    // Validaciones de seguridad
    const securityChecks = {
      serviceKeyIsNotAnonKey: serviceKey && anonKey ? serviceKey !== anonKey : true,
      allVariablesPresent: !!(supabaseUrl && serviceKey && anonKey),
      serviceKeyLength: serviceKey?.length || 0,
      urlIsValid: supabaseUrl ? supabaseUrl.startsWith('http') : false,
    };

    // Preview de variables (parcialmente enmascaradas)
    const varPreviews = {
      supabaseUrl: supabaseUrl 
        ? `${supabaseUrl.substring(0, 35)}...${supabaseUrl.substring(supabaseUrl.length - 10)}` 
        : 'NOT SET',
      serviceKey: serviceKey 
        ? `${serviceKey.substring(0, 8)}...${serviceKey.substring(serviceKey.length - 4)} (${serviceKey.length} chars)` 
        : 'NOT SET',
      anonKey: anonKey 
        ? `${anonKey.substring(0, 8)}...${anonKey.substring(anonKey.length - 4)} (${anonKey.length} chars)` 
        : 'NOT SET',
    };

    // Diagnóstico completo
    const diagnosis = {
      status: securityChecks.allVariablesPresent ? '✅ OK' : '❌ ERROR',
      timestamp: new Date().toISOString(),
      
      // 1. Runtime y sistema
      system: {
        runtime,
        runtimeIsNodejs: runtime === 'nodejs',
        nodeVersion,
        platform,
        architecture: arch,
        cwd,
        processId: process.pid,
      },

      // 2. Variables de entorno
      environment: {
        totalEnvVars: allEnvKeys.length,
        supabaseVarsCount: supabaseKeys.length,
        nextVarsCount: nextKeys.length,
        nodeEnv: process.env.NODE_ENV || 'development',
      },

      // 3. Estado de variables críticas
      criticalVariables: criticalVars,

      // 4. Previews de variables (parcialmente enmascaradas)
      variablePreviews: varPreviews,

      // 5. Validaciones de seguridad
      securityValidation: securityChecks,

      // 6. Todas las claves de variables de Supabase
      supabaseVariables: supabaseKeys,

      // 7. Todas las claves de variables NEXT_
      nextVariables: nextKeys,

      // 8. Diagnóstico de problemas
      possibleIssues: [
        ...(!supabaseUrl ? ['⚠️ NEXT_PUBLIC_SUPABASE_URL no encontrada - verifica .env.local'] : []),
        ...(!serviceKey ? ['⚠️ SUPABASE_SERVICE_ROLE_KEY no encontrada - debe estar en .env.local'] : []),
        ...(!anonKey ? ['⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada - verifica .env.local'] : []),
        ...(runtime !== 'nodejs' ? ['⚠️ Runtime NO es nodejs - las variables privadas no funcionarán'] : []),
        ...(serviceKey && anonKey && serviceKey === anonKey ? ['🚨 SERVICE_ROLE_KEY es igual a ANON_KEY - ERROR DE SEGURIDAD'] : []),
        ...(serviceKey && serviceKey.length < 20 ? ['⚠️ SERVICE_ROLE_KEY parece demasiado corta'] : []),
      ],

      // 9. Recomendaciones
      recommendations: [
        ...(runtime !== 'nodejs' ? ['Agregar: export const runtime = "nodejs" al inicio de la ruta'] : []),
        ...(!supabaseUrl ? ['Verificar que NEXT_PUBLIC_SUPABASE_URL está en .env.local'] : []),
        ...(!serviceKey ? ['Verificar que SUPABASE_SERVICE_ROLE_KEY está en .env.local'] : []),
        ...(supabaseKeys.length === 0 ? ['Ninguna variable SUPABASE encontrada - .env.local puede no estar cargándose'] : []),
      ],
    };

    return NextResponse.json(diagnosis, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('🔥 [FULL-ENV DEBUG] Error fatal:', error);
    
    return NextResponse.json({
      status: '❌ ERROR CRÍTICO',
      error: error.message,
      stack: error.stack,
      message: 'Error al generar diagnóstico. Esto puede indicar que el runtime no es nodejs.',
    }, { status: 500 });
  }
}

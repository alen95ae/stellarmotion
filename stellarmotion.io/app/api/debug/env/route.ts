import { NextResponse } from 'next/server';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

/**
 * Endpoint de debug para verificar carga de variables de entorno
 * Solo para desarrollo - NO usar en producción
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Obtener todas las variables de entorno relacionadas con Supabase
  const allSupabaseVars = Object.keys(process.env)
    .filter(k => k.includes('SUPABASE'))
    .reduce((acc, key) => {
      acc[key] = process.env[key] ? '✅ Configurada' : '❌ No configurada';
      return acc;
    }, {} as Record<string, string>);

  return NextResponse.json({
    status: url && service ? 'OK' : 'ERROR',
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: url ? '✅ OK' : '❌ FALTA',
      SUPABASE_SERVICE_ROLE_KEY: service ? '✅ OK' : '❌ FALTA',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? '✅ OK' : '❌ FALTA',
    },
    previews: {
      supabaseUrl: url ? `${url.substring(0, 30)}...` : 'NOT SET',
      serviceKey: service ? `${service.substring(0, 6)}...${service.substring(service.length - 4)}` : 'NOT SET',
      anonKey: anonKey ? `${anonKey.substring(0, 6)}...${anonKey.substring(anonKey.length - 4)}` : 'NOT SET',
    },
    system: {
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV || 'development',
      envFile: '.env.local (auto-loaded by Next.js)',
    },
    allSupabaseVars,
    validation: {
      hasUrl: !!url,
      hasServiceKey: !!service,
      hasAnonKey: !!anonKey,
      serviceKeyIsAnonKey: !!(service && anonKey && service === anonKey),
      allRequired: !!(url && service),
    },
  });
}



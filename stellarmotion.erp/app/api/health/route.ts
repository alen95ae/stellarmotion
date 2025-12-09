import { NextResponse } from "next/server"

export async function GET() {
  const env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` 
      : 'NOT SET',
  };

  return NextResponse.json({
    status: 'ok',
    env,
    message: env.hasSupabaseUrl && env.hasSupabaseServiceRoleKey 
      ? 'Variables de entorno configuradas correctamente' 
      : 'Faltan variables de entorno de Supabase'
  });
}


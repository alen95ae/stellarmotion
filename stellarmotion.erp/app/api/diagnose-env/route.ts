import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const cwd = process.cwd();
  const envLocalPath = join(cwd, '.env.local');
  const envPath = join(cwd, '.env');
  const envExamplePath = join(cwd, 'env.example');
  
  const diagnostics = {
    cwd,
    nodeEnv: process.env.NODE_ENV,
    files: {
      '.env.local': {
        exists: existsSync(envLocalPath),
        path: envLocalPath,
        readable: existsSync(envLocalPath) ? (() => {
          try {
            readFileSync(envLocalPath, 'utf8');
            return true;
          } catch {
            return false;
          }
        })() : false
      },
      '.env': {
        exists: existsSync(envPath),
        path: envPath
      },
      'env.example': {
        exists: existsSync(envExamplePath),
        path: envExamplePath
      }
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : null
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...` : null,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : null
      }
    },
    nextConfig: {
      outputFileTracingRoot: 'configured'
    }
  };

  // Si .env.local existe, leer su contenido (sin valores sensibles)
  if (existsSync(envLocalPath)) {
    try {
      const content = readFileSync(envLocalPath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      diagnostics.files['.env.local'].lineCount = lines.length;
      diagnostics.files['.env.local'].hasSupabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL');
      diagnostics.files['.env.local'].hasServiceRoleKey = content.includes('SUPABASE_SERVICE_ROLE_KEY');
    } catch (e) {
      diagnostics.files['.env.local'].readError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}


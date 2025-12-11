import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth/users';
import { getAdminSupabase } from '@/lib/supabase/admin';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 [WEB CHECK-EMAIL] Verificando email en Supabase:', email);

    // Verificar en tabla usuarios
    const user = await findUserByEmail(email);
    
    // Verificar en tabla owners
    const supabase = getAdminSupabase();
    const { data: owner } = await supabase
      .from('owners')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    const exists = !!(user || owner);
    
    console.log('✅ [WEB CHECK-EMAIL] Email existe:', exists);
    
    return NextResponse.json({ exists }, { status: 200 });
  } catch (error: any) {
    console.error('❌ [WEB CHECK-EMAIL] Error:', error);
    // Si hay error, permitir continuar (no bloquear registro)
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}


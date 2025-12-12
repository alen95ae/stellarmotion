import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth/users';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verificar en tabla usuarios
    const user = await findUserByEmail(email);
    const exists = !!user;
    
    return NextResponse.json({ exists }, { status: 200 });
  } catch (error: any) {
    // Si hay error, permitir continuar (no bloquear registro)
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}

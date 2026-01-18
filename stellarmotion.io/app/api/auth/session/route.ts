import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st || !st.value) {
      return NextResponse.json(
        { 
          success: false,
          error: "No autorizado" 
        }, 
        { status: 401 }
      );
    }

    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { 
          success: false,
          error: "Sesión inválida" 
        }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        rol: payload.role || 'client',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}




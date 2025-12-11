import { NextRequest, NextResponse } from 'next/server';

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

    // Hacer proxy al ERP que tiene la service role key
    const erpBaseUrl = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000';
    
    // Timeout de 10 segundos (más corto porque es una verificación rápida)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    let response: Response;
    try {
      response = await fetch(`${erpBaseUrl}/api/owners?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Si hay error de conexión, permitir continuar (no bloquear registro)
      console.warn('Error de conexión al verificar email en ERP:', fetchError);
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    if (!response.ok) {
      // Si hay error, permitir continuar (no bloquear registro)
      console.warn('Error checking email in ERP:', response.status);
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Si hay error parseando, permitir continuar
      console.warn('Error parseando respuesta del ERP:', jsonError);
      return NextResponse.json({ exists: false }, { status: 200 });
    }
    
    // Si el ERP devuelve un array con datos, el email existe
    const exists = Array.isArray(data) && data.length > 0;
    
    return NextResponse.json({ exists }, { status: 200 });
  } catch (error: any) {
    console.error('Error in check-email:', error);
    // Si hay error, permitir continuar (no bloquear registro)
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}


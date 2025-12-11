import { NextResponse } from "next/server";

const ERP_BASE_URL = process.env.ERP_BASE_URL || process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${ERP_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Error en registro", backendStatus: res.status, data },
        { status: res.status }
      );
    }

    // Crear respuesta primero
    const response = NextResponse.json({ ok: true, data }, { status: res.status });

    // Leer cookie usando headers.get() (funciona mejor que raw() en algunos casos)
    const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');

    if (setCookie) {
      // Copiar la cookie directamente al navegador
      response.headers.set("Set-Cookie", setCookie);
      console.log('✅ [WEB REGISTER] Cookie copiada al navegador:', setCookie.substring(0, 80) + '...');
    } else {
      console.error('❌ [WEB REGISTER] ERROR: No se pudo leer la cookie del ERP');
      // Fallback: intentar con raw()
      const raw = (res.headers as any).raw?.();
      const cookies = raw?.["set-cookie"] ?? [];
      if (cookies.length > 0) {
        cookies.forEach((cookie: string) => {
          response.headers.append("Set-Cookie", cookie.trim());
          console.log('✅ [WEB REGISTER] Cookie copiada (fallback raw):', cookie.substring(0, 80) + '...');
        });
      }
    }

    return response;
  } catch (error) {
    console.error('❌ [WEB REGISTER] Error en API proxy de registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

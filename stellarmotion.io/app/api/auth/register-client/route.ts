import { NextResponse } from 'next/server';

const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📡 [WEB] Enviando registro de cliente al ERP...");

    // Timeout de 20 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let res: Response;
    try {
      res = await fetch(`${ERP_BASE_URL}/api/auth/register-client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("🔥 [WEB] Error de conexión al ERP:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Error desconocido';

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Timeout: El ERP no respondió a tiempo. Verifica que esté corriendo en localhost:3000" },
          { status: 500 }
        );
      }

      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Failed to fetch')) {
        return NextResponse.json(
          { error: `No se pudo conectar con el ERP en ${ERP_BASE_URL}. Verifica que el servidor esté corriendo.` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Error de conexión: ${errorMessage}` },
        { status: 500 }
      );
    }

    let result: any;
    try {
      result = await res.json();
    } catch (jsonError) {
      console.error("🔥 [WEB] Error parseando respuesta del ERP:", jsonError);
      return NextResponse.json(
        { error: "Respuesta inválida del ERP" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      console.error("❌ [WEB] Error del ERP:", result);
      return NextResponse.json(
        { error: result.error || "Error en ERP", action: result.action, message: result.message },
        { status: res.status }
      );
    }

    // Sincronizar usuario con ERP (asegurar que esté en tabla usuarios)
    if (result.user_id || result.user?.id) {
      try {
        const userId = result.user_id || result.user?.id;
        console.log('🔄 [WEB REGISTER-CLIENT] Sincronizando usuario con ERP...', { userId, email: result.email });
        
        const syncResponse = await fetch(`${ERP_BASE_URL}/api/auth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            email: result.email || result.user?.email,
            name: result.nombre_contacto || result.user?.name || '',
            role: result.role || 'client'
          }),
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('✅ [WEB REGISTER-CLIENT] Usuario sincronizado con ERP:', syncData.message);
        } else {
          const syncError = await syncResponse.json().catch(() => ({ error: 'Error desconocido' }));
          console.warn('⚠️ [WEB REGISTER-CLIENT] Error sincronizando usuario (no crítico):', syncError.error);
        }
      } catch (syncErr) {
        console.warn('⚠️ [WEB REGISTER-CLIENT] Error en sincronización (no crítico):', syncErr);
      }
    }

    // Crear respuesta primero
    const response = NextResponse.json(result, { status: res.status });

    // Leer cookie usando headers.get() (funciona mejor que raw() en algunos casos)
    const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');

    if (setCookie) {
      // Copiar la cookie directamente al navegador
      response.headers.set("Set-Cookie", setCookie);
      console.log('✅ [WEB REGISTER-CLIENT] Cookie copiada al navegador:', setCookie.substring(0, 80) + '...');
    } else {
      console.error('❌ [WEB REGISTER-CLIENT] ERROR: No se pudo leer la cookie del ERP');
      // Fallback: intentar con raw()
      const raw = (res.headers as any).raw?.();
      const cookies = raw?.["set-cookie"] ?? [];
      if (cookies.length > 0) {
        cookies.forEach((cookie: string) => {
          response.headers.append("Set-Cookie", cookie.trim());
          console.log('✅ [WEB REGISTER-CLIENT] Cookie copiada (fallback raw):', cookie.substring(0, 80) + '...');
        });
      }
    }

    return response;

  } catch (error) {
    console.error("🔥 [WEB] Error en register-client API:", error);
    return NextResponse.json(
      { error: "Error interno en API Web" },
      { status: 500 }
    );
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ERP_BASE_URL = process.env.ERP_BASE_URL || process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st) {
      console.log('❌ [WEB /api/auth/me] No se encontró cookie st_session');
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log('✅ [WEB /api/auth/me] Cookie encontrada, enviando al ERP:', st.value.substring(0, 20) + '...');

    const backendRes = await fetch(`${ERP_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Cookie": `st_session=${st.value}`, // Reenviar token exacto
        "Content-Type": "application/json",
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      console.error('❌ [WEB /api/auth/me] ERP respondió con error:', backendRes.status, errorData);
      return NextResponse.json({ error: errorData.error || "Sesión inválida" }, { status: 401 });
    }

    const data = await backendRes.json().catch(() => ({}));
    console.log('✅ [WEB /api/auth/me] Usuario obtenido correctamente:', data.user?.email || 'N/A');
    
    // Si el usuario existe, sincronizarlo con el ERP para asegurar que esté en la tabla usuarios
    if (data.success && data.user) {
      try {
        console.log('🔄 [WEB /api/auth/me] Sincronizando usuario con ERP...', {
          id: data.user.id || data.user.sub,
          email: data.user.email
        });

        const syncResponse = await fetch(`${ERP_BASE_URL}/api/auth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data.user.id || data.user.sub,
            email: data.user.email,
            name: data.user.name || data.user.nombre || '',
            role: data.user.role || data.user.rol || 'client'
          }),
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('✅ [WEB /api/auth/me] Usuario sincronizado con ERP:', syncData.message);
        } else {
          const syncError = await syncResponse.json().catch(() => ({ error: 'Error desconocido' }));
          console.warn('⚠️ [WEB /api/auth/me] Error sincronizando usuario (no crítico):', syncError.error);
          // No fallar si la sincronización falla, solo loguear
        }
      } catch (syncErr) {
        console.warn('⚠️ [WEB /api/auth/me] Error en sincronización (no crítico):', syncErr);
        // No fallar si la sincronización falla, solo loguear
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [WEB /api/auth/me] Error en API proxy de me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

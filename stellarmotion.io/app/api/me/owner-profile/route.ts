import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    // Obtener todas las cookies y enviarlas al ERP
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Obtener usuario actual primero
    const userResponse = await fetch(`${ERP_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    
    if (!userData.success || !userData.user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userId = userData.user.id || userData.user.sub;
    const userEmail = userData.user.email;

    // Obtener datos del owner desde el ERP (buscar por email ya que el ERP solo acepta email)
    const ownerResponse = await fetch(`${ERP_BASE_URL}/api/owners?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!ownerResponse.ok) {
      return NextResponse.json(
        { empresa: null, tipo_empresa: null }
      );
    }

    const ownerData = await ownerResponse.json();
    
    // Si es un array, tomar el primer elemento
    const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData;

    return NextResponse.json({
      empresa: owner?.empresa || owner?.razon_social || null,
      tipo_empresa: owner?.tipo_empresa || null,
      telefono: owner?.telefono || null,
      pais: owner?.pais || null,
      nombre_contacto: owner?.nombre_contacto || null,
    });
  } catch (error) {
    console.error('Error obteniendo perfil de owner:', error);
    return NextResponse.json(
      { empresa: null, tipo_empresa: null },
      { status: 200 } // Devolver null en caso de error, no romper la app
    );
  }
}


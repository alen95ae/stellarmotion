import { NextRequest, NextResponse } from 'next/server';

// Forzar runtime Node.js para consistencia
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soporteId = searchParams.get('id');
    
    if (!soporteId) {
      return NextResponse.json({ error: 'Soporte ID is required' }, { status: 400 });
    }

    console.log('Getting coordinates for soporte:', soporteId);

    // Mapeo de coordenadas exactas extraídas del backend
    const soporteCoordinates: Record<string, {lat: number, lng: number}> = {
      'recRXZ6QiugaX7HMO': { lat: 37.390193, lng: -5.974056 }, // Lona Edificio Plaza Mayor - Sevilla
      'recRhlu5E74BIgnxx': { lat: 43.262665, lng: -2.935307 }, // Vehículo Publicitario Ruta 1 - Bilbao
      'recV3r1s4CjVPMCOQ': { lat: 40.439402, lng: -3.690855 }, // Valla Gran Vía 120 - Madrid
      'recbzAqCey0loWDJt': { lat: 39.470178, lng: -0.370803 }, // Mupi Av. América - Valencia
      'receu2qOYz5JBaT7g': { lat: 41.393682, lng: 2.166639 }  // Pantalla LED Circunvalación - Barcelona
    };

    const coords = soporteCoordinates[soporteId];
    if (coords) {
      console.log('Found coordinates for soporte:', soporteId, coords);
      return NextResponse.json(coords);
    }

    console.log('No coordinates found for soporte:', soporteId);
    return NextResponse.json({ error: 'No coordinates found' }, { status: 404 });

  } catch (error) {
    console.error('Error getting soporte coordinates:', error);
    return NextResponse.json({ error: 'Failed to get coordinates' }, { status: 500 });
  }
}

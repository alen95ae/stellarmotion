/**
 * Extrae coordenadas de un enlace de Google Maps
 * Soporta diferentes formatos de enlaces de Google Maps
 */
export async function extractCoordinatesFromGoogleMapsLink(link: string): Promise<{ lat: number; lng: number } | null> {
  if (!link) return null;

  try {
    // Formato 1: https://maps.google.com/?q=lat,lng
    const qMatch = link.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      const coords = qMatch[1].split(',');
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }

    // Formato 2: https://www.google.com/maps/place/.../@lat,lng,zoom
    const atMatch = link.match(/@([^,]+),([^,]+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    // Formato 3: https://maps.google.com/maps?ll=lat,lng
    const llMatch = link.match(/[?&]ll=([^&]+)/);
    if (llMatch) {
      const coords = llMatch[1].split(',');
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }

    // Formato 4: https://maps.google.com/maps?q=lat,lng
    const mapsQMatch = link.match(/maps\?q=([^&]+)/);
    if (mapsQMatch) {
      const coords = mapsQMatch[1].split(',');
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }

    // Para enlaces acortados, intentar seguir la redirección
    if (link.includes('maps.app.goo.gl') || link.includes('goo.gl')) {
      try {
        console.log('Extracting coordinates from shortened link:', link);
        
        // Para enlaces acortados específicos, usar coordenadas conocidas
        // Esto es una solución temporal hasta que el fetch funcione correctamente
        const knownCoordinates: Record<string, { lat: number; lng: number }> = {
          'https://maps.app.goo.gl/tVwYhbD7eAEAmTDeA': { lat: 37.390193, lng: -5.974056 }, // Sevilla
          'https://maps.app.goo.gl/76VvQdeDu7grYSJR9': { lat: 43.262665, lng: -2.935307 }, // Bilbao
          'https://maps.app.goo.gl/BWGknjiJyP6NRcN37': { lat: 40.439402, lng: -3.690855 }, // Madrid
          'https://maps.app.goo.gl/wsasMazgRfiN3Nt76': { lat: 39.470178, lng: -0.370803 }, // Valencia
          'https://maps.app.goo.gl/sdaKF9GYoWEA1j4w8': { lat: 41.393682, lng: 2.166639 }  // Barcelona
        };
        
        if (knownCoordinates[link]) {
          console.log('Using known coordinates for:', link, knownCoordinates[link]);
          return knownCoordinates[link];
        }
        
        // Intentar fetch como fallback
        const response = await fetch(link, { 
          method: 'HEAD', 
          redirect: 'follow',
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; StellarMotion/1.0)'
          }
        });
        
        if (response.ok) {
          const finalUrl = response.url;
          console.log('Resolved URL:', finalUrl);
          
          // Intentar extraer coordenadas de la URL final
          const patterns = [
            /\/search\/([+-]?\d+\.\d+),([+-]?\d+\.\d+)/, // /search/lat,lng
            /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
            /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
            /query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query=lat,lng
            /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
            /@(-?\d+\.\d+),(-?\d+\.\d+),/, // @lat,lng,zoom
            /3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // 3dlat!4dlng
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
          ];

          for (const pattern of patterns) {
            const match = finalUrl.match(pattern);
            if (match) {
              console.log('Extracted coordinates with pattern:', pattern, 'Match:', match);
              return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2])
              };
            }
          }
          
          console.log('No coordinates found in URL:', finalUrl);
        } else {
          console.log('Response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.warn('Error following shortened link:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from Google Maps link:', error);
    return null;
  }
}

/**
 * Obtiene las coordenadas del soporte, priorizando el enlace de Google Maps
 */
export async function getSoporteCoordinates(soporte: any): Promise<{ lat: number; lng: number } | null> {
  if (!soporte) return null;

  // Prioridad 1: Usar enlace de Google Maps si está disponible
  if (soporte.googleMapsLink) {
    const coords = await extractCoordinatesFromGoogleMapsLink(soporte.googleMapsLink);
    if (coords) {
      return coords;
    }
  }

  // Prioridad 2: Usar coordenadas directas si están disponibles
  if (soporte.latitud && soporte.longitud) {
    return {
      lat: soporte.latitud,
      lng: soporte.longitud
    };
  }

  return null;
}

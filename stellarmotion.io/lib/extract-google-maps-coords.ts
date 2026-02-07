/**
 * Extrae coordenadas de un enlace de Google Maps (enlace largo o corto).
 * Copiado del ERP de publicidadvialimagen: mismo comportamiento para enlaces
 * con coordenadas en la URL y para enlaces acortados (maps.app.goo.gl, goo.gl).
 */
export async function extractCoordinatesFromGoogleMapsLink(
  link: string
): Promise<{ lat: number | null; lng: number | null }> {
  if (!link || !link.trim()) return { lat: null, lng: null };

  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
    /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
    /query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query=lat,lng (API format)
    /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
    /@(-?\d+\.\d+),(-?\d+\.\d+),/, // @lat,lng,zoom
    /3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // 3dlat!4dlng (sin ! inicial)
    /\/search\/([^/?]+)/, // /search/lat,lng (puede tener + en lng)
  ];

  const tryMatch = (url: string): { lat: number | null; lng: number | null } => {
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (!match) continue;
      if (match.length >= 3 && match[1] != null && match[2] != null) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      } else if (match[1]) {
        // /search/lat,lng o lat,+lng (un solo grupo capturado)
        const coordString = match[1].replace(/\+/g, '').trim();
        const parts = coordString.split(',').map((c) => c.trim());
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
      }
    }
    return { lat: null, lng: null };
  };

  const direct = tryMatch(link);
  if (direct.lat !== null && direct.lng !== null) return direct;

  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'maps.app.goo.gl' || hostname === 'goo.gl') {
      const res = await fetch(`/api/soportes/resolve-map-link?url=${encodeURIComponent(link)}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.lat === 'number' && typeof data.lng === 'number') {
          return { lat: data.lat, lng: data.lng };
        }
      }
    }
  } catch {
    // ignore
  }

  return { lat: null, lng: null };
}

/**
 * Genera un enlace de Google Maps para unas coordenadas (para actualizar el campo al arrastrar la chincheta).
 */
export function buildGoogleMapsLinkFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Extrae coordenadas de un enlace de Google Maps (enlace largo o acortado).
 */
export async function extractCoordinatesFromGoogleMapsLink(
  link: string
): Promise<{ lat: number; lng: number } | null> {
  if (!link?.trim()) return null;

  try {
    const qMatch = link.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      const coords = qMatch[1].split(",");
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }

    const atMatch = link.match(/@([^,]+),([^,]+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    const llMatch = link.match(/[?&]ll=([^&]+)/);
    if (llMatch) {
      const coords = llMatch[1].split(",");
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }

    const mapsQMatch = link.match(/maps\?q=([^&]+)/);
    if (mapsQMatch) {
      const coords = mapsQMatch[1].split(",");
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }

    const format5Match = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (format5Match) {
      const lat = parseFloat(format5Match[1]);
      const lng = parseFloat(format5Match[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    if (link.includes("maps.app.goo.gl") || link.includes("goo.gl")) {
      try {
        const response = await fetch(link, {
          method: "HEAD",
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        if (response.ok) {
          const finalUrl = response.url;
          const patterns = [
            /\/search\/([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
            /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
          ];
          for (const pattern of patterns) {
            const match = finalUrl.match(pattern);
            if (match) {
              return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2]),
              };
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Genera un enlace de Google Maps para unas coordenadas (para actualizar el campo al arrastrar la chincheta).
 */
export function buildGoogleMapsLinkFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Resuelve un enlace de Google Maps (largo o corto) y devuelve las coordenadas.
 * Usado desde el cliente para evitar CORS en enlaces cortos (maps.app.goo.gl, goo.gl).
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url');
  if (!urlParam?.trim()) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const link = urlParam.trim();
  const patterns: Array<{ pattern: RegExp; twoGroups?: boolean }> = [
    // /place/.../@lat,lng,zoom o @lat,lng (cualquier cosa después de lat,lng)
    { pattern: /@(-?\d+\.\d+),(-?\d+\.\d+)/, twoGroups: true },
    { pattern: /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, twoGroups: true },
    { pattern: /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, twoGroups: true },
    { pattern: /\/search\/([^/?]+)/ },
    { pattern: /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)(?:&|$)/, twoGroups: true },
    { pattern: /[?&]q=([^&]+)/ },
  ];

  const tryMatch = (url: string): { lat: number; lng: number } | null => {
    for (const { pattern, twoGroups } of patterns) {
      const match = url.match(pattern);
      if (!match || !match[1]) continue;
      if (twoGroups && match[2] != null) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      } else {
        const coordString = match[1].replace(/\+/g, '').trim();
        const parts = coordString.split(',').map((c) => c.trim());
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
      }
    }
    return null;
  };

  let urlToCheck = link;

  try {
    const parsed = new URL(link);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'maps.app.goo.gl' || hostname === 'goo.gl') {
      const response = await fetch(link, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      });
      urlToCheck = response.url || link;
    }

    const coords = tryMatch(urlToCheck);
    if (coords) {
      return NextResponse.json(coords);
    }
  } catch (e) {
    console.error('resolve-map-link error:', e);
    return NextResponse.json({ error: 'Could not resolve link' }, { status: 422 });
  }

  return NextResponse.json({ error: 'No coordinates found in link' }, { status: 422 });
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Extracting coordinates from URL:', url);

    // Hacer petición para obtener la URL final (desenlace el redirect)
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const finalUrl = response.url;
    console.log('Final URL after redirects:', finalUrl);

    // Extraer coordenadas de la URL final
    const patterns = [
      // Formato /search/lat,lng
      /\/search\/([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
      // Formato @lat,lng
      /@([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
      // Formato !3dlat!4dlng
      /!3d([+-]?\d+\.\d+)!4d([+-]?\d+\.\d+)/,
      // Formato ll=lat,lng
      /ll=([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
      // Formato q=lat,lng
      /q=([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
      // Formato center=lat,lng
      /center=([+-]?\d+\.\d+),([+-]?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          console.log('Extracted coordinates:', { lat, lng });
          return NextResponse.json({ lat, lng });
        }
      }
    }

    console.log('No coordinates found in URL');
    return NextResponse.json({ error: 'No coordinates found' }, { status: 404 });

  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return NextResponse.json({ error: 'Failed to extract coordinates' }, { status: 500 });
  }
}

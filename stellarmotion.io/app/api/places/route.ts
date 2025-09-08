import { NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_API_KEY;

// Mock data for testing when Google API fails
const mockPlaces = [
  { label: "Madrid, España", lat: 40.4168, lng: -3.7038 },
  { label: "Barcelona, España", lat: 41.3851, lng: 2.1734 },
  { label: "Valencia, España", lat: 39.4699, lng: -0.3763 },
  { label: "Sevilla, España", lat: 37.3891, lng: -5.9845 },
  { label: "Bilbao, España", lat: 43.2627, lng: -2.9253 },
  { label: "Málaga, España", lat: 36.7213, lng: -4.4217 },
  { label: "Zaragoza, España", lat: 41.6488, lng: -0.8891 },
  { label: "Granada, España", lat: 37.1765, lng: -3.5976 },
  { label: "Alicante, España", lat: 38.3452, lng: -0.4815 },
  { label: "Córdoba, España", lat: 37.8882, lng: -4.7794 }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const useMock = searchParams.get("mock") === "true";

    // If mock is requested or no API key, use mock data
    if (useMock || !KEY) {
      if (lat && lng) {
        // Mock reverse geocoding
        return NextResponse.json({
          label: "Ubicación actual (Mock)",
          lat: Number(lat),
          lng: Number(lng),
        });
      }
      
      if (q) {
        // Mock autocomplete
        const filtered = mockPlaces.filter(place => 
          place.label.toLowerCase().includes(q.toLowerCase())
        );
        return NextResponse.json(filtered.slice(0, 5));
      }
      
      return NextResponse.json([]);
    }

    // Try Google Maps API first
    try {
      // Reverse geocoding
      if (lat && lng) {
        const geo = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}&language=es`
        ).then((r) => r.json());

        if (geo.status === "OK") {
          const first = geo.results?.[0];
          return NextResponse.json({
            label: first?.formatted_address ?? "Ubicación",
            lat: Number(lat),
            lng: Number(lng),
          });
        }
      }

      // Autocomplete + details
      if (q) {
        const auto = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            q
          )}&key=${KEY}&language=es`
        ).then((r) => r.json());

        if (auto.status === "OK") {
          const predictions: any[] = auto.predictions ?? [];
          const top = predictions.slice(0, 5);

          const results = await Promise.all(
            top.map(async (p) => {
              const det = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry,name,formatted_address&key=${KEY}&language=es`
              ).then((r) => r.json());
              const loc = det?.result?.geometry?.location ?? { lat: null, lng: null };
              return {
                label: det?.result?.formatted_address ?? p?.description ?? "Lugar",
                lat: loc.lat,
                lng: loc.lng,
              };
            })
          );

          return NextResponse.json(results);
        }
      }
    } catch (googleError) {
      console.error("Google Maps API error:", googleError);
    }

    // Fallback to OpenStreetMap Nominatim if Google API fails
    if (lat && lng) {
      try {
        // Try OpenStreetMap Nominatim as fallback
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es&addressdetails=1`
        );
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          if (nominatimData.display_name) {
            return NextResponse.json({
              label: nominatimData.display_name,
              lat: Number(lat),
              lng: Number(lng),
            });
          }
        }
      } catch (nominatimError) {
        console.error("Nominatim API error:", nominatimError);
      }
      
      // Final fallback with coordinates
      return NextResponse.json({
        label: `Ubicación (${lat}, ${lng})`,
        lat: Number(lat),
        lng: Number(lng),
      });
    }
    
    if (q) {
      const filtered = mockPlaces.filter(place => 
        place.label.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json(filtered.slice(0, 5));
    }

    return NextResponse.json([]);
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Error servidor /api/places", message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

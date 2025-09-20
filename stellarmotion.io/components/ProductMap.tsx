'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { loadGoogle } from '@/lib/google';

interface ProductMapProps {
  lat: number;
  lng: number;
  title: string;
  city: string;
  country: string;
  className?: string;
  height?: string;
}

export default function ProductMap({
  lat,
  lng,
  title,
  city,
  country,
  className = '',
  height = '300px'
}: ProductMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Usar useLayoutEffect para evitar conflictos con React DOM
  useLayoutEffect(() => {
    let isMounted = true;
    let mapInstance: google.maps.Map | null = null;

    const loadMap = async () => {
      if (!mapRef.current || !isMounted) return;

      try {
        // Verificar que las coordenadas sean válidas
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
          console.warn('ProductMap: Invalid coordinates', { lat, lng });
          if (isMounted) {
            setMapError('Coordenadas inválidas');
          }
          return;
        }

        // Cargar Google Maps
        const google = await loadGoogle();

        if (!isMounted || !mapRef.current) return;

        // Crear el mapa centrado en la ubicación del producto
        mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat, lng },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        if (!isMounted) return;

        mapInstanceRef.current = mapInstance;

        // Crear marcador personalizado
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="#D7514C" stroke="white" stroke-width="3"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        markerRef.current = marker;

        // Crear info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-semibold text-gray-900 text-sm mb-1">${title}</h3>
              <p class="text-gray-600 text-xs">${city}, ${country}</p>
            </div>
          `
        });

        // Añadir evento click al marcador
        marker.addListener('click', () => {
          if (isMounted && mapInstance) {
            infoWindow.open(mapInstance, marker);
          }
        });

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        if (isMounted) {
          setMapError('Error al cargar el mapa de Google');
        }
      }
    };

    loadMap();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Limpiar marcador
      if (markerRef.current) {
        try {
          markerRef.current.setMap(null);
        } catch (e) {
          // Ignorar errores de limpieza
        }
        markerRef.current = null;
      }
      
      // Limpiar referencias
      mapInstanceRef.current = null;
      mapInstance = null;
    };
  }, [lat, lng, title, city, country]);

  if (mapError) {
    return (
      <div 
        className={`w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-500 mb-2">Error al cargar el mapa</p>
          <p className="text-gray-400 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" style={{ height }} />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}

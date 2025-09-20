'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { loadGoogle } from '@/lib/google';

interface Product {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  pricePerMonth: number;
  featured: boolean;
}

interface SearchMapProps {
  products: Product[];
  className?: string;
  height?: string;
}

const PIN_SVG_ENCODED = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372.98 375.81">
    <defs>
      <style>.cls-1{fill:#e94446;}</style>
    </defs>
    <rect class="cls-1" x="31.88" y="53.47" width="304.53" height="165.14" />
    <path d="M211.12,224.69v3q0,32.82,0,65.65a5.91,5.91,0,0,0,1.68,4.43c5.48,5.81,10.81,11.76,16.31,17.55a6,6,0,0,0,3.39,1.45c2,.26,4,0,6,.17a12.33,12.33,0,0,1,11,12.15c.07,3,.05,6,0,9s-1.69,4.75-4.76,4.92c-.74,0-1.5,0-2.24,0H125.66c-5.75,0-6.93-1.13-6.88-6.81a53.92,53.92,0,0,1,.4-9.44c1.1-6,5.89-10.16,12-9.8,4.51.26,7.38-1.33,10.15-4.62,4.67-5.52,9.75-10.69,14.59-16.07a4.24,4.24,0,0,0,1.16-2.56q.1-33.94,0-67.89a7.33,7.33,0,0,0-.18-1c-.91,0-1.86-.12-2.82-.12H38.31a15.58,15.58,0,0,1-2.74-.14,4.13,4.13,0,0,1-3.72-4.29c0-.75,0-1.5,0-2.25V54.77c0-4.78,1.24-6,6.1-6,7.32,0,14.65,0,22,0,1.55,0,2.42-.21,3.06-2,1.81-5,5.58-7.85,11-7.94q12.73-.21,25.46,0c5.81.11,9.35,3.24,11.63,9.77.66,0,1.39.12,2.13.12,14.81,0,29.62,0,44.43,0,1.51,0,2.28-.28,2.84-1.92,1.79-5.15,5.9-8,11.41-8q12.36-.12,24.71,0A11.62,11.62,0,0,1,207.9,47c.41,1.15.76,1.81,2.15,1.8,15.48-.05,30.95,0,46.43-.05a3.15,3.15,0,0,0,.69-.16c3-7.7,6.13-9.77,14.55-9.77h21.22c6.56,0,10.08,2.48,12.66,8.53A3.09,3.09,0,0,0,308,48.69c7.4.1,14.81.06,22.22.06,5,0,6.24,1.18,6.24,6.12V218.61c0,4.77-1.29,6.08-6.08,6.08H211.12ZM40.67,57.7v158H327.59v-158H306c0,1.86,0,3.59,0,5.31,0,3.7-1.44,5.15-5.13,5.15q-19.22,0-38.44,0c-3.75,0-5.23-1.53-5.28-5.35,0-1.7,0-3.41,0-5H208.56c0,1.94,0,3.68,0,5.42-.06,3.36-1.58,5-4.85,5q-19.61,0-39.19,0c-3.16,0-4.74-1.62-4.82-4.76,0-1.88,0-3.77,0-5.68H111.11c0,2.06.08,4,0,5.85-.15,2.93-1.72,4.57-4.52,4.58q-20,.06-39.93,0c-2.75,0-4.27-1.64-4.36-4.4-.06-2,0-4,0-6Zm138.93,259c0-.93.11-1.73.11-2.54,0-5.41,0-10.82,0-16.23,0-3.43,1.72-5.46,4.48-5.42s4.31,2.06,4.33,5.33c0,5.41,0,10.82,0,16.22v2.58h13.74V224.88H166v91.81Zm-51.72,17.39H240.36c1-7.88-.25-8.48-6.56-8.46q-49.5.15-99,0c-7.48,0-7.36,1.2-7.14,7.82A2.79,2.79,0,0,0,127.88,334.08Zm-57-274.73H102.3c0-2.86,0-5.58,0-8.3-.06-2.39-1.12-3.42-3.61-3.43-8,0-16.11,0-24.16,0-2.26,0-3.46,1.17-3.57,3.29C70.81,53.61,70.91,56.35,70.91,59.35Zm195.06,0h31.34c0-3,.13-5.93,0-8.8a2.92,2.92,0,0,0-3.14-2.91q-12.45,0-24.92,0a2.92,2.92,0,0,0-3.22,3C265.9,53.5,266,56.32,266,59.33Zm-66.18,0c0-3,.06-5.78,0-8.52a3,3,0,0,0-3.32-3.24c-8.23,0-16.46-.08-24.69.1-1.06,0-2.88,1.36-3,2.25a79.41,79.41,0,0,0-.14,9.41ZM157,308.17l-7.87,8.51H157Zm61.36,8.55-7.09-7.61v7.61Z" />
    <path d="M183.93,207.27H61.14a24.78,24.78,0,0,1-3-.07,4.2,4.2,0,0,1-3.94-4.35,4.31,4.31,0,0,1,3.95-4.37,16.76,16.76,0,0,1,2.24-.05H307.74a11.88,11.88,0,0,1,3.43.37,3.91,3.91,0,0,1,2.85,4.43,4,4,0,0,1-3.56,3.9,16.45,16.45,0,0,1-3,.13Z" />
    <rect x="68.22" y="45.19" width="37.27" height="16.25" />
    <rect x="165.55" y="45.35" width="37.27" height="16.25" />
    <rect x="263.02" y="45.35" width="37.27" height="16.25" />
  </svg>
`);

export default function SearchMap({ products, className = '', height = '500px' }: SearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Usar useLayoutEffect para evitar conflictos con React DOM
  useLayoutEffect(() => {
    let isMounted = true;
    let mapInstance: google.maps.Map | null = null;

    const loadMap = async () => {
      try {
        // Verificar que el contenedor existe
        const mapContainer = mapRef.current;
        if (!mapContainer || !isMounted) {
          console.warn('Map container not found or component unmounted');
          return;
        }

        // Cargar Google Maps
        const google = await loadGoogle();

        if (!isMounted || !mapContainer) return;

        // Crear el mapa
        mapInstance = new google.maps.Map(mapContainer, {
          zoom: 6,
          center: { lat: 40.4168, lng: -3.7038 }, // Centro en España
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

        // Añadir marcadores para cada producto
        const bounds = new google.maps.LatLngBounds();
        let hasValidMarkers = false;

        products.forEach((product) => {
          if (!isMounted || !mapInstance) return;

          // Verificar que las coordenadas sean válidas
          if (typeof product.latitude !== 'number' || typeof product.longitude !== 'number' || 
              isNaN(product.latitude) || isNaN(product.longitude) ||
              product.latitude === null || product.longitude === null) {
            console.warn('SearchMap: Invalid coordinates for product', { 
              id: product.id, 
              title: product.title, 
              latitude: product.latitude, 
              longitude: product.longitude 
            });
            return;
          }

          const position = { lat: product.latitude, lng: product.longitude };
          
          // Crear marcador
          const marker = new google.maps.Marker({
            position,
            map: mapInstance,
            title: product.title,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${PIN_SVG_ENCODED}`,
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 48)
            }
          });

          markersRef.current.push(marker);
          bounds.extend(position);
          hasValidMarkers = true;

          // Crear info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 min-w-[250px]">
                <h3 class="font-semibold text-gray-900 text-sm mb-2">${product.title}</h3>
                <p class="text-gray-600 text-xs mb-2">${product.city}, ${product.country}</p>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg font-bold text-rose-600">$${product.pricePerMonth}</span>
                  <span class="text-xs text-gray-500">/ mes</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  ${product.featured ? '<span class="bg-[#D7514C] text-white text-xs px-2 py-1 rounded-full">Destacado</span>' : ''}
                  <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Soporte</span>
                </div>
                <div class="mt-3">
                  <a href="/product/${product.slug}" class="text-[#D7514C] text-sm font-medium hover:underline">Ver detalles →</a>
                </div>
              </div>
            `
          });

          // Añadir evento click al marcador
          marker.addListener('click', () => {
            if (isMounted && mapInstance) {
              infoWindow.open(mapInstance, marker);
            }
          });
        });

        // Ajustar la vista para mostrar todos los marcadores
        if (hasValidMarkers && isMounted && mapInstance) {
          mapInstance.fitBounds(bounds);
        }

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

    // Solo cargar el mapa si hay productos
    if (products.length > 0) {
      loadMap();
    } else {
      setMapLoaded(true);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Limpiar marcadores
      markersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          // Ignorar errores de limpieza
        }
      });
      markersRef.current = [];
      
      // Limpiar referencia del mapa
      mapInstanceRef.current = null;
      mapInstance = null;
    };
  }, [products]);

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
      <div ref={mapRef} className="w-full h-full" />

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

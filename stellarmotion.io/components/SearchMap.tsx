'use client';

import { useEffect, useState, useRef } from 'react';

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

export default function SearchMap({ products, className = '', height = '500px' }: SearchMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Cargar Leaflet dinámicamente para evitar errores de SSR
    const loadMap = async () => {
      try {
        // Verificar que el contenedor existe
        const mapContainer = document.getElementById('search-map');
        if (!mapContainer) {
          console.warn('Map container not found');
          return;
        }

        // Limpiar mapa existente si existe
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Importar Leaflet dinámicamente
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix for default markers in Leaflet with Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Crear el mapa
        const map = L.map(mapContainer);
        mapInstanceRef.current = map;

        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Añadir marcadores para cada producto
        const markers: any[] = [];
        
        products.forEach((product) => {
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

          const marker = L.marker([product.latitude, product.longitude]).addTo(map);
          markers.push(marker);
          
          // Crear popup con información del producto
          const popupContent = `
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
          `;
          marker.bindPopup(popupContent);
        });

        // Ajustar la vista para mostrar todos los marcadores
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.1));
        } else {
          // Si no hay productos, centrar en España
          map.setView([40.4168, -3.7038], 6);
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Error al cargar el mapa');
      }
    };

    // Solo cargar el mapa si hay productos
    if (products.length > 0) {
      loadMap();
    } else {
      setMapLoaded(true);
    }

    // Cleanup function para limpiar el mapa cuando el componente se desmonte
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
    <div 
      id="search-map"
      className={`w-full rounded-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ height }}
    >
      {!mapLoaded && (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}

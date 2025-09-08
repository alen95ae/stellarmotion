'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Product {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  priceMonth: number;
  featured: boolean;
}

interface SearchMapProps {
  products: Product[];
  className?: string;
  height?: string;
}

export default function SearchMap({ products, className = '', height = '500px' }: SearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear el mapa
    const map = L.map(mapRef.current);
    mapInstanceRef.current = map;

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Añadir marcadores para cada producto
    const markers: L.Marker[] = [];
    
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
            <span class="text-lg font-bold text-rose-600">$${product.priceMonth}</span>
            <span class="text-xs text-gray-500">/ mes</span>
          </div>
          <div class="flex items-center gap-2 mb-2">
            ${product.featured ? '<span class="bg-[#D7514C] text-white text-xs px-2 py-1 rounded-full">Destacado</span>' : ''}
            <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">${product.type || 'Soporte'}</span>
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
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    } else {
      // Si no hay productos, centrar en La Paz, Bolivia
      map.setView([-16.4897, -68.1193], 13);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [products]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ height }}
    />
  );
}

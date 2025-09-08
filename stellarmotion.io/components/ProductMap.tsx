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
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Verificar que las coordenadas sean válidas
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.warn('ProductMap: Invalid coordinates', { lat, lng });
      return;
    }

    // Crear el mapa centrado en la ubicación del producto
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Añadir marcador para el producto
    const marker = L.marker([lat, lng]).addTo(map);
    
    // Crear popup con información del producto
    const popupContent = `
      <div class="p-2">
        <h3 class="font-semibold text-gray-900 text-sm">${title}</h3>
        <p class="text-gray-600 text-xs mt-1">${city}, ${country}</p>
      </div>
    `;
    marker.bindPopup(popupContent);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, title, city, country]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ height }}
    />
  );
}

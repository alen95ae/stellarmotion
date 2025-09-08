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

interface OpenStreetMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title?: string;
    description?: string;
  }>;
  className?: string;
  height?: string;
}

export default function OpenStreetMap({
  center = [-16.4897, -68.1193], // La Paz, Bolivia por defecto
  zoom = 13,
  markers = [],
  className = '',
  height = '400px'
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear el mapa
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Añadir marcadores
    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.position).addTo(map);
      
      if (marker.title || marker.description) {
        const popupContent = `
          ${marker.title ? `<h3 class="font-semibold text-gray-900">${marker.title}</h3>` : ''}
          ${marker.description ? `<p class="text-gray-600 text-sm mt-1">${marker.description}</p>` : ''}
        `;
        leafletMarker.bindPopup(popupContent);
      }
    });

    // Si hay marcadores, ajustar la vista para mostrarlos todos
    if (markers.length > 0) {
      const group = new L.featureGroup(markers.map(m => L.marker(m.position)));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${className}`}
      style={{ height }}
    />
  );
}

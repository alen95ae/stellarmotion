'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type LatLng = { lat: number; lng: number };
type MapStyle = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

interface LeafletMapProps {
  center?: LatLng;
  zoom?: number;
  markers?: LatLng[];
  className?: string;
  height?: string;
  mapStyle?: MapStyle;
  onMapClick?: (lat: number, lng: number) => void;
}

// Estilos que imitan Google Maps
const mapStyles = {
  roadmap: {
    name: 'Google Maps Roadmap Style',
    attribution: '© OpenStreetMap contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  satellite: {
    name: 'Google Maps Satellite Style',
    attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  },
  hybrid: {
    name: 'Google Maps Hybrid Style',
    attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  },
  terrain: {
    name: 'Google Maps Terrain Style',
    attribution: '© OpenStreetMap contributors',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  }
};

export default function LeafletMap({
  center = { lat: 40.4168, lng: -3.7038 },
  zoom = 12,
  markers = [],
  className = "h-[420px] w-full rounded-2xl overflow-hidden border",
  height = '420px',
  mapStyle = 'roadmap',
  onMapClick
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      console.log('Creating Leaflet map with center:', center);
      
      // Crear el mapa
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });

      mapInstanceRef.current = map;

      // Añadir capa base según el estilo
      const style = mapStyles[mapStyle];
      L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Añadir marcadores
      markers.forEach((marker, index) => {
        const leafletMarker = L.marker([marker.lat, marker.lng]).addTo(map);
        markersRef.current.push(leafletMarker);
      });

      // Añadir evento de click al mapa
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Ajustar vista si hay marcadores
      if (markers.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      console.log('Leaflet map created successfully');
      setIsLoaded(true);
    } catch (err) {
      console.error('Error creating Leaflet map:', err);
      setError('Error al cargar el mapa');
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [center.lat, center.lng, zoom, mapStyle]);

  if (error) {
    return (
      <div className={className} style={{ height }}>
        <div className="p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
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

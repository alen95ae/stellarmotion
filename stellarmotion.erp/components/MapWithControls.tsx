'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, SatelliteIcon, MountainIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importar el mapa de forma dinámica
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});

type LatLng = { lat: number; lng: number };
type MapStyle = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

interface MapWithControlsProps {
  center?: LatLng;
  markers?: LatLng[];
  className?: string;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const mapStyles = [
  { 
    key: 'roadmap' as MapStyle, 
    label: 'Mapa', 
    icon: MapIcon,
    description: 'Vista de mapa estándar'
  },
  { 
    key: 'satellite' as MapStyle, 
    label: 'Satélite', 
    icon: SatelliteIcon,
    description: 'Vista satelital'
  },
  { 
    key: 'terrain' as MapStyle, 
    label: 'Terreno', 
    icon: MountainIcon,
    description: 'Vista de terreno'
  },
];

export default function MapWithControls({
  center,
  markers = [],
  className = '',
  height = '500px',
  onMapClick
}: MapWithControlsProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>('roadmap');

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Selector de estilos flotante */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 flex gap-1">
        {mapStyles.map((style) => {
          const Icon = style.icon;
          return (
            <Button
              key={style.key}
              variant={mapStyle === style.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapStyle(style.key)}
              className="flex items-center gap-2"
              title={style.description}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{style.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Mapa */}
      <LeafletMap
        center={center}
        markers={markers}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-200"
        mapStyle={mapStyle}
        onMapClick={onMapClick}
      />
    </div>
  );
}

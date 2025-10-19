"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Importar Leaflet dinámicamente
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  [key: string]: any;
}

export interface MapViewerLeafletProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  points?: MapPoint[];
  height?: string | number;
  width?: string | number;
  className?: string;
  style?: "streets" | "satellite" | "hybrid";
  showControls?: boolean;
  enableClustering?: boolean;
  onMarkerClick?: (point: MapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapViewerLeaflet({
  lat = -16.5000,
  lng = -68.1500,
  zoom = 13,
  points = [],
  height = "500px",
  width = "100%",
  className = "",
  style = "streets",
  showControls = true,
  enableClustering = false,
  onMarkerClick,
  onMapClick,
}: MapViewerLeafletProps) {
  const [mapStyle, setMapStyle] = useState(style);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Convertir puntos a formato de LeafletMap
  const markers = points.map(point => ({
    lat: point.lat,
    lng: point.lng,
    title: point.title || '',
    description: point.description || ''
  }));

  // Mapear estilos - Exactamente como en LeafletHybridMap
  const getLeafletStyle = (style: string) => {
    switch (style) {
      case 'streets':
        return 'roadmap'; // Google Maps callejero
      case 'satellite':
        return 'satellite'; // Google Satélite
      case 'hybrid':
        return 'hybrid'; // OpenStreetMap
      default:
        return 'roadmap';
    }
  };

  const handleStyleChange = (newStyle: "streets" | "satellite" | "hybrid") => {
    setMapStyle(newStyle);
  };

  const handleMapLoad = (map: any) => {
    setMapInstance(map);
    setIsLoaded(true);
  };

  const zoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor del mapa */}
      <div className="map-container w-full h-full rounded-lg overflow-hidden" style={{ minHeight: "300px" }}>
        <LeafletMap
          center={{ lat, lng }}
          zoom={zoom}
          markers={markers}
          mapStyle={getLeafletStyle(mapStyle)}
          onMapClick={onMapClick}
          onMapLoad={handleMapLoad}
        />
      </div>

      {/* Controles del mapa - Replicando exactamente el estilo de LeafletHybridMap */}
      {showControls && (
        <>
          {/* Controles de zoom - Estilo Leaflet */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 cursor-pointer"
              title="Acercar"
              style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={zoomOut}
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 cursor-pointer"
              title="Alejar"
              style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* Botón de pantalla completa - Estilo exacto de LeafletHybridMap */}
          <div className="absolute top-4 right-16">
            <button
              onClick={toggleFullscreen}
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 cursor-pointer"
              title="Pantalla completa"
              style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.4)' }}
            >
              <span className="text-lg font-bold">⤢</span>
            </button>
          </div>

          {/* Controles de estilo - Estilo Leaflet */}
          <div className="absolute top-4 left-4">
            <div className="bg-white rounded-md shadow-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => handleStyleChange("streets")}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  mapStyle === "streets"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Vista de mapa"
              >
                🗺️ Mapa
              </button>
              <button
                onClick={() => handleStyleChange("satellite")}
                className={`px-3 py-2 text-xs font-medium transition-colors border-t border-gray-200 ${
                  mapStyle === "satellite"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Vista satelital"
              >
                🌍 Satélite
              </button>
              <button
                onClick={() => handleStyleChange("hybrid")}
                className={`px-3 py-2 text-xs font-medium transition-colors border-t border-gray-200 ${
                  mapStyle === "hybrid"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Vista híbrida"
              >
                📖 OSM
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

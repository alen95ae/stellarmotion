"use client";
import { useEffect, useRef, useState } from "react";

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

export interface MapViewerMapLibreProps {
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

export default function MapViewerMapLibre({
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
}: MapViewerMapLibreProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapStyle, setMapStyle] = useState(style);
  const [isLoaded, setIsLoaded] = useState(false);

  // Estilos de mapa Google-like
  const getMapStyle = (style: string) => {
    switch (style) {
      case 'streets':
        // Estilo Google Maps Light - usando OpenStreetMap con estilo personalizado
        return {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        };
      case 'satellite':
        // Modo satélite con Esri World Imagery
        return {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256
            }
          },
          layers: [
            {
              id: 'satellite',
              type: 'raster',
              source: 'esri-satellite'
            }
          ]
        };
      case 'hybrid':
        // Modo híbrido: satélite + OpenStreetMap superpuesto
        return {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256
            },
            'osm': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256
            }
          },
          layers: [
            {
              id: 'satellite',
              type: 'raster',
              source: 'esri-satellite'
            },
            {
              id: 'osm-overlay',
              type: 'raster',
              source: 'osm',
              paint: {
                'raster-opacity': 0.3
              }
            }
          ]
        };
      default:
        return getMapStyle('streets');
    }
  };

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Cargar MapLibre GL JS dinámicamente
    const loadMapLibre = async () => {
      // Cargar CSS
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Cargar JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js';
      script.onload = () => {
        const maplibregl = (window as any).maplibregl;
        
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: getMapStyle(mapStyle),
          center: [lng, lat],
          zoom: zoom,
          attributionControl: true
        });

        // Añadir controles
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

        // Eventos
        map.current.on('load', () => {
          setIsLoaded(true);
        });

        map.current.on('click', (e: any) => {
          if (onMapClick) {
            onMapClick(e.lngLat.lat, e.lngLat.lng);
          }
        });
      };
      document.head.appendChild(script);
    };

    loadMapLibre();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambien los puntos
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Añadir nuevos marcadores
    points.forEach((point) => {
      const marker = new (window as any).maplibregl.Marker({
        color: '#d52b1e'
      })
        .setLngLat([point.lng, point.lat])
        .setPopup(
          new (window as any).maplibregl.Popup()
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${point.title || 'Marcador'}</h3>
                ${point.description ? `<p class="text-sm text-gray-600 mt-1">${point.description}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      marker.getElement().addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(point);
        }
      });

      markers.current.push(marker);
    });
  }, [points, isLoaded, onMarkerClick]);

  // Cambiar estilo del mapa
  const handleStyleChange = (newStyle: "streets" | "satellite" | "hybrid") => {
    if (!map.current) return;
    
    setMapStyle(newStyle);
    map.current.setStyle(getMapStyle(newStyle));
  };

  // Controles de zoom
  const zoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainer.current) return;

    if (!document.fullscreenElement) {
      mapContainer.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden" 
        style={{ minHeight: "300px" }}
      />

      {/* Controles del mapa - Estilo Google Maps */}
      {showControls && (
        <>
          {/* Controles de zoom - Estilo Google */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="bg-white border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 cursor-pointer"
              title="Acercar"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={zoomOut}
              className="bg-white border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 cursor-pointer"
              title="Alejar"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* Botón de pantalla completa */}
          <div className="absolute top-4 right-16">
            <button
              onClick={toggleFullscreen}
              className="bg-white border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 cursor-pointer"
              title="Pantalla completa"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              <span className="text-lg font-bold">⤢</span>
            </button>
          </div>

          {/* Controles de estilo - Estilo Google */}
          <div className="absolute top-4 left-4">
            <div className="bg-white rounded-md shadow-lg border border-gray-300 overflow-hidden">
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
                📖 Híbrido
              </button>
            </div>
          </div>
        </>
      )}

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando mapa...</div>
        </div>
      )}
    </div>
  );
}
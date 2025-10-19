"use client";
import { useEffect, useRef, useState } from "react";

// Importar estilos de MapLibre
import "maplibre-gl/dist/maplibre-gl.css";

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

export interface MapViewerProps {
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

export default function MapViewer({
  lat = -16.5000,
  lng = -68.1500,
  zoom = 13,
  points = [],
  height = "500px",
  width = "100%",
  className = "",
  style = "streets",
  showControls = true,
  enableClustering = true,
  onMarkerClick,
  onMapClick,
}: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const cluster = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState(style);

  // Obtener la clave de MapTiler del entorno
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  // Definir estilos de mapa - Replicando exactamente los estilos de LeafletHybridMap
  const mapStyles = {
    streets: {
      version: 8,
      sources: {
        "google-streets": {
          type: "raster",
          tiles: ["https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"],
          tileSize: 256,
          attribution: "© Google"
        }
      },
      layers: [
        {
          id: "google-streets",
          type: "raster",
          source: "google-streets",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    },
    satellite: {
      version: 8,
      sources: {
        "google-satellite": {
          type: "raster",
          tiles: ["https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"],
          tileSize: 256,
          attribution: "© Google Sat"
        }
      },
      layers: [
        {
          id: "google-satellite",
          type: "raster",
          source: "google-satellite",
          minzoom: 0,
          maxzoom: 20
        }
      ]
    },
    hybrid: {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap"
        }
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster",
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  };

  // Cargar MapLibre dinámicamente
  const loadMapLibre = async () => {
    try {
      const maplibregl = await import('maplibre-gl');
      const Supercluster = await import('supercluster');
      
      return { maplibregl: maplibregl.default, Supercluster: Supercluster.default };
    } catch (error) {
      console.error('Error loading MapLibre:', error);
      throw error;
    }
  };

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        // Cargar MapLibre dinámicamente
        const { maplibregl, Supercluster } = await loadMapLibre();

        // Limpiar mapa anterior si existe
        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        // Crear nuevo mapa
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: mapStyles[currentStyle],
          center: [lng, lat],
          zoom: zoom,
          attributionControl: true,
          logoPosition: "bottom-right"
        });

        // Configurar atribuciones
        if (map.current.attributionControl) {
          map.current.attributionControl.addAttribution(
            currentStyle === "satellite" 
              ? "© Google Sat" 
              : currentStyle === "streets"
              ? "© Google"
              : "© OpenStreetMap"
          );
        }

        // Eventos del mapa
        map.current.on("load", () => {
          setIsLoaded(true);
          setError(null);
        });

        map.current.on("error", (e) => {
          console.error("Map error:", e);
          setError("Error al cargar el mapa");
        });

        // Click en el mapa
        if (onMapClick) {
          map.current.on("click", (e) => {
            onMapClick(e.lngLat.lat, e.lngLat.lng);
          });
        }

        // Inicializar clustering si está habilitado
        if (enableClustering && points.length > 0) {
          cluster.current = new Supercluster({
            radius: 40,
            maxZoom: 16,
            minZoom: 0
          });
        }

      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Error al inicializar el mapa");
      }
    };

    // Ejecutar inicialización
    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, zoom, currentStyle]);

  // Actualizar marcadores cuando cambien los puntos
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const addMarkers = async () => {
      try {
        const maplibregl = await import('maplibre-gl');
        
        // Limpiar marcadores existentes
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        if (points.length === 0) return;

        if (enableClustering && cluster.current && points.length > 10) {
          // Usar clustering para muchos puntos
          const clusterPoints = points.map(point => ({
            type: "Feature",
            properties: { ...point },
            geometry: {
              type: "Point",
              coordinates: [point.lng, point.lat]
            }
          }));

          cluster.current.load(clusterPoints);
          const clusters = cluster.current.getClusters([-180, -85, 180, 85], map.current.getZoom());

          clusters.forEach(cluster => {
            if (cluster.properties.cluster) {
              // Crear marcador de cluster
              const marker = new maplibregl.default.Marker({
                element: createClusterElement(cluster.properties.point_count)
              })
                .setLngLat(cluster.geometry.coordinates)
                .addTo(map.current!);

              marker.getElement().addEventListener("click", () => {
                const expansionZoom = cluster.current!.getClusterExpansionZoom(cluster.id);
                map.current!.easeTo({
                  center: cluster.geometry.coordinates,
                  zoom: expansionZoom
                });
              });

              markers.current.push(marker);
            } else {
              // Crear marcador individual
              const point = cluster.properties;
              const marker = new maplibregl.default.Marker({
                element: createMarkerElement(point)
              })
                .setLngLat([point.lng, point.lat])
                .addTo(map.current!);

              if (onMarkerClick) {
                marker.getElement().addEventListener("click", () => {
                  onMarkerClick(point);
                });
              }

              markers.current.push(marker);
            }
          });
        } else {
          // Crear marcadores individuales
          points.forEach(point => {
            const marker = new maplibregl.default.Marker({
              element: createMarkerElement(point)
            })
              .setLngLat([point.lng, point.lat])
              .addTo(map.current!);

            if (onMarkerClick) {
              marker.getElement().addEventListener("click", () => {
                onMarkerClick(point);
              });
            }

            markers.current.push(marker);
          });
        }
      } catch (err) {
        console.error("Error adding markers:", err);
      }
    };

    addMarkers();
  }, [points, isLoaded, enableClustering, onMarkerClick]);

  // Crear elemento HTML para marcador
  const createMarkerElement = (point: MapPoint) => {
    const el = document.createElement("div");
    el.className = "map-marker";
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      transition: transform 0.2s;
    `;

    el.innerHTML = "📍";
    el.title = point.title || "Marcador";

    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.1)";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });

    return el;
  };

  // Crear elemento HTML para cluster
  const createClusterElement = (count: number) => {
    const el = document.createElement("div");
    el.className = "map-cluster";
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      transition: transform 0.2s;
    `;

    el.textContent = count.toString();
    el.title = `${count} marcadores`;

    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.1)";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });

    return el;
  };

  // Cambiar estilo del mapa
  const changeStyle = async (newStyle: "streets" | "satellite" | "hybrid") => {
    if (!map.current) return;
    
    try {
      setCurrentStyle(newStyle);
      map.current.setStyle(mapStyles[newStyle]);
    } catch (error) {
      console.error("Error changing style:", error);
    }
  };

  // Geolocalización
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada por este navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.current) {
          map.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("No se pudo obtener la ubicación");
      }
    );
  };

  // Pantalla completa
  const toggleFullscreen = () => {
    if (!mapContainer.current) return;

    if (!document.fullscreenElement) {
      mapContainer.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Error al cargar el mapa</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor del mapa */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }}
      />

      {/* Controles del mapa - Replicando exactamente el estilo de LeafletHybridMap */}
      {showControls && isLoaded && (
        <>
          {/* Controles de zoom - Estilo Leaflet */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <button
              onClick={() => map.current?.zoomIn()}
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50"
              title="Acercar"
              style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={() => map.current?.zoomOut()}
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50"
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
              className="bg-white border-2 border-gray-300 rounded-md w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50"
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
                onClick={() => changeStyle("streets")}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  currentStyle === "streets"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Vista de mapa"
              >
                🗺️ Mapa
              </button>
              <button
                onClick={() => changeStyle("satellite")}
                className={`px-3 py-2 text-xs font-medium transition-colors border-t border-gray-200 ${
                  currentStyle === "satellite"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Vista satelital"
              >
                🌍 Satélite
              </button>
              <button
                onClick={() => changeStyle("hybrid")}
                className={`px-3 py-2 text-xs font-medium transition-colors border-t border-gray-200 ${
                  currentStyle === "hybrid"
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

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}

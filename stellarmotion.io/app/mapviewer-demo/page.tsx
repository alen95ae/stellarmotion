"use client";
import { useState } from "react";
import MapViewer, { MapPoint } from "@/components/MapViewer";

export default function MapViewerDemoPage() {
  const [points, setPoints] = useState<MapPoint[]>([
    {
      id: "1",
      lat: -16.5000,
      lng: -68.1500,
      title: "La Paz, Bolivia",
      description: "Capital de Bolivia",
      type: "city"
    },
    {
      id: "2",
      lat: -16.5100,
      lng: -68.1600,
      title: "El Alto, Bolivia",
      description: "Ciudad hermana de La Paz",
      type: "city"
    }
  ]);

  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "hybrid">("streets");
  const [center, setCenter] = useState({ lat: -16.5000, lng: -68.1500 });
  const [zoom, setZoom] = useState(13);

  const addRandomPoint = () => {
    const newPoint: MapPoint = {
      id: `random_${Date.now()}`,
      lat: -16.5000 + (Math.random() - 0.5) * 0.1,
      lng: -68.1500 + (Math.random() - 0.5) * 0.1,
      title: `Punto Aleatorio ${points.length + 1}`,
      description: `Descripción del punto ${points.length + 1}`,
      type: "marker"
    };
    setPoints([...points, newPoint]);
  };

  const clearPoints = () => {
    setPoints([]);
  };

  const handleMarkerClick = (point: MapPoint) => {
    alert(`Marcador clickeado: ${point.title}`);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log("Mapa clickeado:", lat, lng);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MapViewer Demo</h1>
              <p className="text-gray-600 mt-1">
                Demostración del nuevo mapa 100% libre con MapLibre GL JS
              </p>
            </div>
            
            {/* Controles */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Estilo:</span>
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as "streets" | "satellite" | "hybrid")}
                  className="px-3 py-1 text-xs rounded-md border border-gray-200"
                >
                  <option value="streets">🗺️ Mapa</option>
                  <option value="satellite">🌍 Satélite</option>
                  <option value="hybrid">🔄 Híbrido</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addRandomPoint}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-200"
                >
                  📍 Añadir Punto
                </button>
                <button
                  onClick={clearPoints}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md border border-red-200 hover:bg-red-200"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mapa Interactivo</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Mapa 100% libre usando MapLibre GL JS, OpenStreetMap y Esri World Imagery
                </p>
              </div>
              
              <div className="relative">
                <MapViewer
                  lat={center.lat}
                  lng={center.lng}
                  zoom={zoom}
                  points={points}
                  height="600px"
                  style={mapStyle}
                  showControls={true}
                  enableClustering={true}
                  onMarkerClick={handleMarkerClick}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>
          </div>

          {/* Panel de Información */}
          <div className="space-y-6">
            {/* Información del Mapa */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Mapa</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Centro:</span>
                  <p className="text-sm text-gray-600">
                    {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Zoom:</span>
                  <p className="text-sm text-gray-600">{zoom}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Estilo:</span>
                  <p className="text-sm text-gray-600 capitalize">{mapStyle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Marcadores:</span>
                  <p className="text-sm text-gray-600">{points.length}</p>
                </div>
              </div>
            </div>

            {/* Lista de Marcadores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Marcadores</h3>
              {points.length === 0 ? (
                <p className="text-sm text-gray-500">No hay marcadores</p>
              ) : (
                <div className="space-y-2">
                  {points.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{point.title}</p>
                        <p className="text-xs text-gray-500">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => setPoints(points.filter(p => p.id !== point.id))}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Características */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">✅ Características</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>100% Libre:</strong> Sin dependencias de Google</li>
                <li>• <strong>MapLibre GL JS:</strong> Motor de mapas vectoriales</li>
                <li>• <strong>OpenStreetMap:</strong> Datos de mapas libres</li>
                <li>• <strong>Esri World Imagery:</strong> Imágenes satelitales</li>
                <li>• <strong>Clustering:</strong> Agrupación automática de marcadores</li>
                <li>• <strong>Controles:</strong> Zoom, geolocalización, pantalla completa</li>
                <li>• <strong>Responsive:</strong> Adaptable a cualquier dispositivo</li>
              </ul>
            </div>

            {/* Código de Ejemplo */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💻 Código de Ejemplo</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                <pre>{`import MapViewer from '@/components/MapViewer';

<MapViewer
  lat={-16.5000}
  lng={-68.1500}
  zoom={13}
  points={points}
  style="streets"
  showControls={true}
  enableClustering={true}
  onMarkerClick={(point) => 
    console.log('Marcador:', point)
  }
  onMapClick={(lat, lng) => 
    console.log('Click:', lat, lng)
  }
/>`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Importar el nuevo MapViewer con Google Maps
const MapViewer = dynamic(
  () => import("@/components/MapViewerGoogleMaps"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando Google Maps...</div>
      </div>
    )
  }
);

export default function MapaTestPage() {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'hybrid'>('streets');
  const [points] = useState([]); // Sin puntos de datos

  const handleStyleChange = (style: 'streets' | 'satellite' | 'hybrid') => {
    setMapStyle(style);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa Test - Google Maps</h1>
              <p className="text-gray-600 mt-1">
                Mapa con Google Maps API - Vista satelital y callejera
              </p>
            </div>
            
            {/* Style Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Estilo:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleStyleChange('streets')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      mapStyle === 'streets'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    🗺️ Mapa
                  </button>
                  <button
                    onClick={() => handleStyleChange('satellite')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      mapStyle === 'satellite'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    🌍 Satélite
                  </button>
                  <button
                    onClick={() => handleStyleChange('hybrid')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      mapStyle === 'hybrid'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    📖 OSM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mapa Interactivo - Google Maps</h2>
            <p className="text-sm text-gray-600 mt-1">
              Mapa con Google Maps API - Vista satelital y callejera
            </p>
          </div>
          
          {/* Map */}
          <div className="relative">
            <MapViewer
              lat={-16.5000}
              lng={-68.1500}
              zoom={13}
              points={points}
              height="600px"
              style={mapStyle}
              showControls={true}
              enableClustering={false}
              onMarkerClick={(point) => console.log('Marcador clickeado:', point)}
              onMapClick={(lat, lng) => console.log('Mapa clickeado:', lat, lng)}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Instrucciones de Uso</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Navegación:</strong> Usa el mouse para mover el mapa y la rueda para hacer zoom</p>
            <p>• <strong>Estilos:</strong> Selecciona entre vista de mapa, satélite o híbrida</p>
            <p>• <strong>Pantalla completa:</strong> Haz clic en el botón de pantalla completa en el mapa</p>
            <p>• <strong>Geolocalización:</strong> Usa el botón de ubicación para centrar en tu posición</p>
            <p>• <strong>Controles:</strong> Usa los controles de zoom y navegación del mapa</p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Técnica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Características del Mapa</h4>
              <ul className="space-y-1">
                <li>• <strong>Google Maps API</strong> como motor de mapas</li>
                <li>• <strong>Vista callejera</strong> con datos de Google</li>
                <li>• <strong>Vista satelital</strong> con imágenes de Google</li>
                <li>• <strong>Modo híbrido</strong> con satélite + etiquetas</li>
                <li>• 3 estilos disponibles (🗺️ Mapa, 🌍 Satélite, 📖 Híbrido)</li>
                <li>• Funcionalidad de pantalla completa con botón ⤢</li>
                <li>• Controles de zoom y navegación nativos de Google</li>
                <li>• <strong>Marcadores personalizados</strong> con popups</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Configuración</h4>
              <ul className="space-y-1">
                <li>• Centro: La Paz, Bolivia (-16.5000, -68.1500)</li>
                <li>• Zoom inicial: 13</li>
                <li>• Altura: 600px</li>
                <li>• Sin puntos de datos</li>
                <li>• Estilo por defecto: Mapa (Google Maps)</li>
                <li>• API Key configurada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Beneficios de Google Maps API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium text-green-900 mb-2">Ventajas Técnicas</h4>
              <ul className="space-y-1">
                <li>• <strong>Calidad premium</strong> - Datos más precisos y actualizados</li>
                <li>• <strong>Google Maps API</strong> - Motor de mapas líder mundial</li>
                <li>• <strong>Datos de Google</strong> - Fuente de datos más completa</li>
                <li>• <strong>Imágenes satelitales</strong> - De alta resolución</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Ventajas de Usuario</h4>
              <ul className="space-y-1">
                <li>• <strong>Experiencia familiar</strong> - Interfaz conocida por todos</li>
                <li>• <strong>Navegación fluida</strong> - Zoom y movimiento suaves</li>
                <li>• <strong>Controles nativos</strong> - Botones de Google Maps</li>
                <li>• <strong>Marcadores avanzados</strong> - Con popups personalizados</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Google Maps Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🗺️ Google Maps API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Características del Motor</h4>
              <ul className="space-y-1">
                <li>• <strong>JavaScript API</strong> - Integración nativa</li>
                <li>• <strong>Mapas vectoriales</strong> - Zoom suave y fluido</li>
                <li>• <strong>Datos de Google</strong> - Fuente más completa</li>
                <li>• <strong>Imágenes satelitales</strong> - De alta resolución</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Implementación</h4>
              <ul className="space-y-1">
                <li>• <strong>Google Maps API</strong> - Motor oficial</li>
                <li>• <strong>API Key configurada</strong> - Autenticación correcta</li>
                <li>• <strong>Controles nativos</strong> - Botones de Google</li>
                <li>• <strong>Marcadores personalizados</strong> - Con popups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

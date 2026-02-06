'use client';

import { useState } from 'react';
import MapViewerGoogleMaps from '@/components/MapViewerGoogleMaps';

export default function TestMapasPage() {
  const [polygonPath, setPolygonPath] = useState<{ lat: number; lng: number }[]>([]);

  // Mapa 1: Recorrido móvil con puntos A, B, C, D
  const routeABCD = [
    { lat: 40.4168, lng: -3.7038 }, // A - Puerta del Sol
    { lat: 40.4190, lng: -3.7050 }, // B - Gran Vía
    { lat: 40.4210, lng: -3.7070 }, // C - Plaza de España
    { lat: 40.4230, lng: -3.7090 }, // D - Calle Princesa
  ];

  // Mapa 2: Soportes fijos en Nueva York con iconos de categorías
  const nyPoints = [
    {
      id: 'ny1',
      lat: 40.7589,
      lng: -73.9851,
      title: 'Valla Times Square',
      description: 'Valla publicitaria en Times Square - 5m x 3m',
      type: 'valla'
    },
    {
      id: 'ny2',
      lat: 40.7505,
      lng: -73.9934,
      title: 'Pantalla LED Broadway',
      description: 'Pantalla LED en Broadway - 8m x 4m',
      type: 'pantalla'
    },
    {
      id: 'ny3',
      lat: 40.7614,
      lng: -73.9776,
      title: 'Mupi Central Park',
      description: 'Mupi cerca de Central Park - 1.5m x 1.2m',
      type: 'mupi'
    },
    {
      id: 'ny4',
      lat: 40.7484,
      lng: -73.9857,
      title: 'Mural Empire State',
      description: 'Mural cerca del Empire State Building - 10m x 6m',
      type: 'mural'
    },
    {
      id: 'ny5',
      lat: 40.7549,
      lng: -73.9840,
      title: 'Parada de Bus 5th Ave',
      description: 'Parada de bus en 5th Avenue',
      type: 'parada'
    },
  ];

  // Mapa 3: Ubicación aproximada con círculo
  const approximateLocation = {
    lat: 40.4168,
    lng: -3.7038,
    radius: 500 // 500 metros de radio
  };

  // Mapa 4: Área dibujada por el usuario (se inicializa vacío)
  const initialPolygon: { lat: number; lng: number }[] = [];

  // Mapa 8: Puntos con precios para mostrar en óvalos rojos
  const pricePoints = [
    { id: 'p1', lat: 40.4168, lng: -3.7038, title: 'Valla Puerta del Sol', description: 'Valla en Puerta del Sol', type: 'valla', price: 450 },
    { id: 'p2', lat: 40.4190, lng: -3.7050, title: 'Pantalla Gran Vía', description: 'Pantalla LED en Gran Vía', type: 'pantalla', price: 650 },
    { id: 'p3', lat: 40.4210, lng: -3.7070, title: 'Mupi Plaza de España', description: 'Mupi en Plaza de España', type: 'mupi', price: 280 },
    { id: 'p4', lat: 40.4230, lng: -3.7090, title: 'Valla Calle Princesa', description: 'Valla publicitaria', type: 'valla', price: 520 },
    { id: 'p5', lat: 40.4250, lng: -3.7110, title: 'Pantalla Moncloa', description: 'Pantalla LED en Moncloa', type: 'pantalla', price: 720 },
    { id: 'p6', lat: 40.4270, lng: -3.7130, title: 'Mural Ciudad Universitaria', description: 'Mural publicitario', type: 'mural', price: 380 },
    { id: 'p7', lat: 40.4290, lng: -3.7150, title: 'Valla Avenida Complutense', description: 'Valla publicitaria', type: 'valla', price: 490 },
    { id: 'p8', lat: 40.4310, lng: -3.7170, title: 'Parada de Bus', description: 'Parada de bus publicitaria', type: 'parada', price: 320 },
  ];

  // Mapa 6: Puntos para clustering (muchos puntos cercanos)
  const clusteredPoints = [
    // Zona 1: Centro de Madrid (muchos puntos cercanos)
    { id: 'c1', lat: 40.4168, lng: -3.7038, title: 'Valla 1', description: 'Valla en Puerta del Sol', type: 'valla' },
    { id: 'c2', lat: 40.4170, lng: -3.7040, title: 'Valla 2', description: 'Valla cerca de Puerta del Sol', type: 'valla' },
    { id: 'c3', lat: 40.4165, lng: -3.7035, title: 'Mupi 1', description: 'Mupi en zona centro', type: 'mupi' },
    { id: 'c4', lat: 40.4172, lng: -3.7042, title: 'Pantalla 1', description: 'Pantalla LED', type: 'pantalla' },
    { id: 'c5', lat: 40.4163, lng: -3.7033, title: 'Valla 3', description: 'Valla publicitaria', type: 'valla' },
    
    // Zona 2: Gran Vía (puntos cercanos)
    { id: 'c6', lat: 40.4190, lng: -3.7050, title: 'Valla 4', description: 'Valla en Gran Vía', type: 'valla' },
    { id: 'c7', lat: 40.4192, lng: -3.7052, title: 'Mupi 2', description: 'Mupi en Gran Vía', type: 'mupi' },
    { id: 'c8', lat: 40.4188, lng: -3.7048, title: 'Pantalla 2', description: 'Pantalla LED Gran Vía', type: 'pantalla' },
    { id: 'c9', lat: 40.4195, lng: -3.7055, title: 'Valla 5', description: 'Valla publicitaria', type: 'valla' },
    
    // Zona 3: Plaza de España (puntos cercanos)
    { id: 'c10', lat: 40.4210, lng: -3.7070, title: 'Valla 6', description: 'Valla en Plaza de España', type: 'valla' },
    { id: 'c11', lat: 40.4212, lng: -3.7072, title: 'Mupi 3', description: 'Mupi cerca de Plaza de España', type: 'mupi' },
    { id: 'c12', lat: 40.4208, lng: -3.7068, title: 'Valla 7', description: 'Valla publicitaria', type: 'valla' },
    
    // Zona 4: Moncloa (puntos más separados)
    { id: 'c13', lat: 40.4350, lng: -3.7150, title: 'Valla 8', description: 'Valla en Moncloa', type: 'valla' },
    { id: 'c14', lat: 40.4355, lng: -3.7155, title: 'Mupi 4', description: 'Mupi en Moncloa', type: 'mupi' },
    
    // Zona 5: Ciudad Universitaria (puntos separados)
    { id: 'c15', lat: 40.4400, lng: -3.7200, title: 'Valla 9', description: 'Valla en Ciudad Universitaria', type: 'valla' },
    { id: 'c16', lat: 40.4405, lng: -3.7205, title: 'Pantalla 3', description: 'Pantalla LED', type: 'pantalla' },
  ];

  // Mapa 5: Circuitos de soportes (lotes de vallas)
  const circuits = [
    {
      id: 'circuit1',
      name: 'Circuito Centro',
      points: [
        {
          id: 'c1-1',
          lat: 40.4168,
          lng: -3.7038,
          title: 'Valla 1',
          description: 'Valla en Puerta del Sol',
          type: 'valla'
        },
        {
          id: 'c1-2',
          lat: 40.4190,
          lng: -3.7050,
          title: 'Valla 2',
          description: 'Valla en Gran Vía',
          type: 'valla'
        },
        {
          id: 'c1-3',
          lat: 40.4210,
          lng: -3.7070,
          title: 'Valla 3',
          description: 'Valla en Plaza de España',
          type: 'valla'
        },
      ]
    },
    {
      id: 'circuit2',
      name: 'Circuito Norte',
      points: [
        {
          id: 'c2-1',
          lat: 40.4300,
          lng: -3.7100,
          title: 'Valla 4',
          description: 'Valla en Moncloa',
          type: 'valla'
        },
        {
          id: 'c2-2',
          lat: 40.4350,
          lng: -3.7150,
          title: 'Valla 5',
          description: 'Valla en Ciudad Universitaria',
          type: 'valla'
        },
        {
          id: 'c2-3',
          lat: 40.4400,
          lng: -3.7200,
          title: 'Valla 6',
          description: 'Valla en Avenida Complutense',
          type: 'valla'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Mapas</h1>

        <div className="space-y-12">
          {/* Mapa 1: Recorrido móvil A, B, C, D */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Recorrido Móvil (Puntos A, B, C, D)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa que muestra un recorrido de vehículo publicitario con puntos etiquetados A, B, C y D.
            </p>
            <MapViewerGoogleMaps
              route={routeABCD}
              lat={40.4200}
              lng={-3.7100}
              zoom={14}
              height={400}
              style="streets"
              showControls={true}
            />
          </div>

          {/* Mapa 2: Soportes fijos en NY con iconos de categorías */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Soportes Fijos en Nueva York (con Iconos de Categorías)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa con múltiples soportes en Nueva York usando iconos personalizados según la categoría.
            </p>
            <MapViewerGoogleMaps
              points={nyPoints}
              lat={40.7589}
              lng={-73.9851}
              zoom={13}
              height={400}
              style="streets"
              showControls={true}
              useCategoryIcons={true}
            />
          </div>

          {/* Mapa 3: Ubicación aproximada con círculo */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Ubicación Aproximada (Círculo con Radio)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa que muestra una ubicación aproximada con un círculo que indica el área de cobertura (radio de 500m).
            </p>
            <MapViewerGoogleMaps
              circle={approximateLocation}
              lat={40.4168}
              lng={-3.7038}
              zoom={14}
              height={400}
              style="streets"
              showControls={true}
            />
          </div>

          {/* Mapa 4: Área dibujada por el usuario */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. Área Dibujada por el Usuario (Polígono Editable)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa con un polígono editable que el usuario puede modificar arrastrando los vértices. 
              Haz clic en los vértices para moverlos.
            </p>
            {polygonPath.length === 0 ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Haz clic en el botón para crear un polígono de ejemplo, o haz clic directamente en el mapa para crear tu propio polígono.
                </p>
                <button
                  onClick={() => {
                    // Crear un polígono inicial de ejemplo
                    setPolygonPath([
                      { lat: 40.4168, lng: -3.7038 },
                      { lat: 40.4190, lng: -3.7050 },
                      { lat: 40.4210, lng: -3.7070 },
                      { lat: 40.4190, lng: -3.7090 },
                    ]);
                  }}
                  className="px-4 py-2 bg-[#D7514C] text-white rounded-lg hover:bg-[#D7514C]/90"
                >
                  Crear Polígono de Ejemplo
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Arrastra los vértices del polígono (puntos rojos) para editarlo. 
                  Vértices: {polygonPath.length}
                </p>
                <button
                  onClick={() => setPolygonPath([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Limpiar Polígono
                </button>
              </div>
            )}
            <MapViewerGoogleMaps
              polygon={polygonPath.length >= 3 ? polygonPath : undefined}
              editablePolygon={polygonPath.length >= 3}
              lat={40.4200}
              lng={-3.7100}
              zoom={14}
              height={400}
              style="streets"
              showControls={true}
              onPolygonChange={(path) => setPolygonPath(path)}
              onMapClick={(lat, lng) => {
                if (polygonPath.length < 3) {
                  // Añadir punto al polígono
                  setPolygonPath([...polygonPath, { lat, lng }]);
                }
              }}
            />
          </div>

          {/* Mapa 5: Circuitos de soportes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. Circuitos de Soportes (Lotes de Vallas Publicitarias)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa que muestra circuitos de soportes publicitarios contratados en lotes. 
              Cada circuito tiene un color diferente y los puntos están numerados.
            </p>
            <div className="mb-4 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#e94446] rounded-full"></div>
                <span className="text-sm text-gray-600">Circuito Centro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#3b82f6] rounded-full"></div>
                <span className="text-sm text-gray-600">Circuito Norte</span>
              </div>
            </div>
            <MapViewerGoogleMaps
              circuits={circuits}
              lat={40.4200}
              lng={-3.7100}
              zoom={12}
              height={400}
              style="streets"
              showControls={true}
            />
          </div>

          {/* Mapa 6: Clustering de marcadores */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. Clustering de Marcadores
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa con múltiples soportes. Cuando el zoom está cerca, se ven las chinchetas individuales en rojo. 
              Al alejar el zoom, se agrupan en círculos rojos con el número de items en esa zona.
            </p>
            <MapViewerGoogleMaps
              points={clusteredPoints}
              lat={40.4200}
              lng={-3.7100}
              zoom={13}
              height={400}
              style="streets"
              showControls={true}
              enableClustering={true}
            />
          </div>

          {/* Mapa 7: Clustering con Iconos de Categorías */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. Clustering con Iconos de Categorías
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa que combina clustering y iconos de categorías. Cuando el zoom está cerca, se ven los iconos personalizados 
              según la categoría (vallas, pantallas, mupis, etc.). Al alejar el zoom, se agrupan en círculos rojos con el número de items.
            </p>
            <MapViewerGoogleMaps
              points={clusteredPoints}
              lat={40.4200}
              lng={-3.7100}
              zoom={13}
              height={400}
              style="streets"
              showControls={true}
              enableClustering={true}
              useCategoryIcons={true}
            />
          </div>

          {/* Mapa 8: Precios en Óvalos Rojos (Estilo Airbnb) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              8. Precios en Óvalos Rojos (Estilo Airbnb)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Mapa que muestra los precios de los soportes en óvalos rojos, similar a cómo Airbnb muestra los precios de sus propiedades.
            </p>
            <MapViewerGoogleMaps
              points={pricePoints}
              lat={40.4200}
              lng={-3.7100}
              zoom={13}
              height={400}
              style="streets"
              showControls={true}
              showPrices={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

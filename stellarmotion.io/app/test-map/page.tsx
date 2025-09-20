"use client";

import { useState } from "react";
import GoogleMapWrapper from "@/components/GoogleMapWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LatLng = { lat: number; lng: number };

const testLocations = [
  { name: "La Paz, Bolivia", lat: -16.5, lng: -68.15 },
  { name: "Santa Cruz, Bolivia", lat: -17.8, lng: -63.2 },
  { name: "Cochabamba, Bolivia", lat: -17.4, lng: -66.2 },
  { name: "Sucre, Bolivia", lat: -19.0, lng: -65.3 },
  { name: "Madrid, España", lat: 40.4, lng: -3.7 },
  { name: "Barcelona, España", lat: 41.4, lng: 2.2 },
];

export default function Page() {
  const [center, setCenter] = useState<LatLng>({ lat: -16.5, lng: -68.15 });
  const [markers, setMarkers] = useState<LatLng[]>([{ lat: -16.5, lng: -68.15 }]);
  const [zoom, setZoom] = useState(12);
  const [customLat, setCustomLat] = useState("-16.5");
  const [customLng, setCustomLng] = useState("-68.15");

  const handleLocationChange = (location: LatLng) => {
    setCenter(location);
    setMarkers([location]);
  };

  const handleAddMarker = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const newMarker = { lat, lng };
      setMarkers(prev => [...prev, newMarker]);
      setCenter(newMarker);
    }
  };

  const handleClearMarkers = () => {
    setMarkers([]);
  };

  const handleResetMap = () => {
    setCenter({ lat: -16.5, lng: -68.15 });
    setMarkers([{ lat: -16.5, lng: -68.15 }]);
    setZoom(12);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🧪 Test de Google Maps API</h1>
        <p className="text-gray-600">
          Página de prueba para verificar el funcionamiento de Google Maps y sus funcionalidades.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de controles */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📍 Ubicaciones de Prueba</CardTitle>
              <CardDescription>
                Selecciona una ubicación para centrar el mapa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {testLocations.map((location, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleLocationChange(location)}
                >
                  {location.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Agregar Marcador</CardTitle>
              <CardDescription>
                Añade un marcador personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="lat">Latitud</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="-16.5"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitud</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="-68.15"
                />
              </div>
              <Button onClick={handleAddMarker} className="w-full">
                Agregar Marcador
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚙️ Controles del Mapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="zoom">Zoom: {zoom}</Label>
                <Input
                  id="zoom"
                  type="range"
                  min="1"
                  max="20"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearMarkers} className="flex-1">
                  Limpiar Marcadores
                </Button>
                <Button variant="outline" onClick={handleResetMap} className="flex-1">
                  Resetear Mapa
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Estado Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Centro:</strong> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
              <div>
                <strong>Zoom:</strong> {zoom}
              </div>
              <div>
                <strong>Marcadores:</strong> {markers.length}
              </div>
              <div>
                <strong>API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "✅ Configurada" : "❌ Faltante"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>🗺️ Mapa Interactivo</CardTitle>
              <CardDescription>
                Mapa de Google Maps con funcionalidades de prueba
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden border">
                <GoogleMapWrapper
                  center={center}
                  zoom={zoom}
                  markers={markers}
                  className="h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Información de la API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Funcionalidades Probadas:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ Carga de Google Maps API</li>
                <li>✅ Centrado del mapa</li>
                <li>✅ Marcadores dinámicos</li>
                <li>✅ Control de zoom</li>
                <li>✅ Ubicaciones predefinidas</li>
                <li>✅ Marcadores personalizados</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Configuración:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Librerías: places</li>
                <li>Idioma: es (Español)</li>
                <li>Región: ES</li>
                <li>Controles: Personalizados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

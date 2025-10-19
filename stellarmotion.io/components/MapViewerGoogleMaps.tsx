"use client";
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

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

export interface MapViewerGoogleMapsProps {
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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewerGoogleMaps({
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
}: MapViewerGoogleMapsProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapStyle, setMapStyle] = useState(style);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const [isMapReady, setIsMapReady] = useState(false);

  // Convertir estilo a tipo de mapa de Google
  const getGoogleMapType = (style: string) => {
    switch (style) {
      case 'streets':
        return 'roadmap';
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      default:
        return 'roadmap';
    }
  };

  // Inicializar Google Maps
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current || map.current) return;

    const initializeMap = () => {
      if (!window.google || !mapContainer.current) return;

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat, lng },
        zoom: zoom,
        mapTypeId: getGoogleMapType(mapStyle),
        zoomControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        mapTypeControl: showControls,
        scrollwheel: true, // Habilitar zoom con rueda del mouse
        gestureHandling: 'auto', // Permitir gestos táctiles y mouse
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
      });

      // Eventos
      window.google.maps.event.addListener(map.current, 'click', (event: any) => {
        if (onMapClick) {
          onMapClick(event.latLng.lat(), event.latLng.lng());
        }
      });

      window.google.maps.event.addListener(map.current, 'tilesloaded', () => {
        setIsMapReady(true);
      });
    };

    initializeMap();

    return () => {
      if (map.current) {
        window.google.maps.event.clearInstanceListeners(map.current);
        map.current = null;
      }
    };
  }, [googleMapsLoaded]);

  // Actualizar marcadores cuando cambien los puntos
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Añadir nuevos marcadores
    points.forEach((point) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map.current,
        title: point.title || 'Marcador',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Popup con información
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">${point.title || 'Marcador'}</h3>
            ${point.description ? `<p class="text-sm text-gray-600 mt-1">${point.description}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
        if (onMarkerClick) {
          onMarkerClick(point);
        }
      });

      markers.current.push(marker);
    });
  }, [points, isMapReady, onMarkerClick]);

  // Cambiar estilo del mapa
  const handleStyleChange = (newStyle: "streets" | "satellite" | "hybrid") => {
    if (!map.current) return;
    
    setMapStyle(newStyle);
    map.current.setMapTypeId(getGoogleMapType(newStyle));
  };

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden" 
        style={{ minHeight: "300px" }}
      />

      {/* Solo controles nativos de Google Maps */}

      {/* Loading indicator */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando Google Maps...</div>
        </div>
      )}
    </div>
  );
}

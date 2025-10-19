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
  searchLocation?: { lat: number; lng: number; label?: string; types?: string[] } | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewerGoogleMaps({
  lat = 40.4637,
  lng = -3.7492,
  zoom = 6,
  points = [],
  height = "500px",
  width = "100%",
  className = "",
  style = "streets",
  showControls = true,
  enableClustering = false,
  onMarkerClick,
  onMapClick,
  searchLocation = null,
}: MapViewerGoogleMapsProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [mapStyle, setMapStyle] = useState(style);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const [isMapReady, setIsMapReady] = useState(false);

  // Function to get zoom level based on Google Places type
  const getZoomFromGooglePlaceType = (placeType: string | null): number => {
    if (!placeType) return 12; // Default zoom for cities
    
    switch (placeType) {
      case 'country':
        return 6; // Countries - very wide view
      case 'administrative_area_level_1':
        return 8; // States/regions - wide view
      case 'locality':
        return 12; // Cities - Madrid, Barcelona, New York
      case 'sublocality':
        return 13; // Neighborhoods/districts
      case 'postal_town':
        return 14; // Small towns - Zamora
      case 'route':
      case 'street_address':
        return 16; // Streets - very close view
      default:
        return 12; // Default for cities
    }
  };

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
        console.log('MapViewerGoogleMaps - Map tiles loaded, map is ready');
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

  // Centrar el mapa y ajustar zoom cuando cambie la ubicación de búsqueda
  useEffect(() => {
    console.log('MapViewerGoogleMaps - searchLocation effect triggered:', { searchLocation, mapReady: !!map.current });
    if (!map.current || !searchLocation) {
      console.log('MapViewerGoogleMaps - Skipping centering:', { hasMap: !!map.current, hasSearchLocation: !!searchLocation });
      return;
    }
    
    console.log('Centering map to search location:', searchLocation);
    map.current.setCenter({ lat: searchLocation.lat, lng: searchLocation.lng });
    
    // Aplicar zoom inteligente basado en el tipo de lugar
    if (searchLocation.types && searchLocation.types.length > 0) {
      const zoomLevel = getZoomFromGooglePlaceType(searchLocation.types[0]);
      console.log('Applying intelligent zoom:', { type: searchLocation.types[0], zoom: zoomLevel });
      map.current.setZoom(zoomLevel);
    } else {
      // Si no hay tipos, usar zoom por defecto para ciudades
      console.log('No types available, using default zoom 12');
      map.current.setZoom(12);
    }
  }, [searchLocation]);

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

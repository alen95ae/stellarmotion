"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

type Props = {
  lat: number;
  lng: number;
  onChange: (c: { lat: number; lng: number }) => void;
  height?: number; // px
};

// Mismo icono que el marketplace: punto rojo de Google (red-dot.png 32x32)
const MARKETPLACE_MARKER_ICON = {
  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  scaledSize: { width: 32, height: 32 } as const,
};

export default function EditableGoogleMap({ lat, lng, onChange, height = 400 }: Props) {
  const [pos, setPos] = useState({ lat, lng });
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();

  const center = useMemo(() => ({ lat: pos.lat, lng: pos.lng }), [pos]);
  const mapContainerStyle = useMemo(() => ({ 
    width: "100%", 
    height: `${height}px`, 
    borderRadius: 12,
  }), [height]);

  // Actualizar posición cuando cambian las props (desde el enlace de Google Maps)
  useEffect(() => {
    if (lat !== pos.lat || lng !== pos.lng) {
      console.log('📍 Updating marker position from props:', { lat, lng });
      setPos({ lat, lng });
      
      // Actualizar el marcador si el mapa ya está inicializado
      if (marker.current && map.current) {
        const newPosition = new window.google.maps.LatLng(lat, lng);
        marker.current.setPosition(newPosition);
        map.current.setCenter(newPosition);
      }
    }
  }, [lat, lng]);

  // Inicializar el mapa cuando Google Maps esté cargado
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current || map.current) return;

    const initMap = () => {
      if (!window.google || !mapContainer.current) return;

      // Crear el mapa (pantalla completa = control nativo de Google, como en el marketplace)
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: center,
        zoom: 16,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        scaleControl: true,
        scrollwheel: true,
        gestureHandling: "auto",
      });

      // Mismo icono que el marketplace: punto rojo de Google (red-dot.png 32x32)
      marker.current = new window.google.maps.Marker({
        position: center,
        map: map.current,
        draggable: true,
        icon: {
          url: MARKETPLACE_MARKER_ICON.url,
          scaledSize: new window.google.maps.Size(32, 32),
        },
        title: "Arrastra para cambiar la ubicación"
      });

      // Evento de click en el mapa
      map.current.addListener('click', (e: any) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        console.log('🎯 Marker moved by click:', { lat: clickedLat, lng: clickedLng });
        setPos({ lat: clickedLat, lng: clickedLng });
        marker.current.setPosition(e.latLng);
        onChange({ lat: clickedLat, lng: clickedLng });
      });

      // Evento de drag del marcador
      marker.current.addListener('dragend', (e: any) => {
        const draggedLat = e.latLng.lat();
        const draggedLng = e.latLng.lng();
        console.log('🎯 Marker drag ended:', { lat: draggedLat, lng: draggedLng });
        setPos({ lat: draggedLat, lng: draggedLng });
        onChange({ lat: draggedLat, lng: draggedLng });
      });
    };

    initMap();

    // Cleanup
    return () => {
      if (marker.current) {
        window.google.maps.event.clearInstanceListeners(marker.current);
        marker.current = null;
      }
      if (map.current) {
        window.google.maps.event.clearInstanceListeners(map.current);
        map.current = null;
      }
    };
  }, [googleMapsLoaded, onChange]);

  return (
    <div className="relative">
      <div 
        ref={mapContainer}
        style={mapContainerStyle}
        className="rounded-lg overflow-hidden border border-gray-300"
      />
      
      {!googleMapsLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando Google Maps...</div>
        </div>
      )}
    </div>
  );
}

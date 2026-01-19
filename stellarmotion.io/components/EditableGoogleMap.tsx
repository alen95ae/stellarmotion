"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

type Props = {
  lat: number;
  lng: number;
  onChange: (c: { lat: number; lng: number }) => void;
  height?: number; // px
};

export default function EditableGoogleMap({ lat, lng, onChange, height = 400 }: Props) {
  const [pos, setPos] = useState({ lat, lng });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();

  const center = useMemo(() => ({ lat: pos.lat, lng: pos.lng }), [pos]);
  const mapContainerStyle = useMemo(() => ({ 
    width: "100%", 
    height: isFullscreen ? "100vh" : `${height}px`, 
    borderRadius: isFullscreen ? 0 : 12,
    position: isFullscreen ? "fixed" : "relative",
    top: isFullscreen ? 0 : "auto",
    left: isFullscreen ? 0 : "auto",
    zIndex: isFullscreen ? 9999 : "auto"
  }), [height, isFullscreen]);

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

      // Crear el mapa
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: center,
        zoom: 16,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true,
        scaleControl: true,
        scrollwheel: true,
        gestureHandling: 'auto',
      });

      // Crear icono del marcador (usando el icono de valla del marketplace)
      const markerIcon = {
        url: "/icons/valla.svg",
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      };

      // Crear el marcador arrastrable
      marker.current = new window.google.maps.Marker({
        position: center,
        map: map.current,
        draggable: true,
        icon: markerIcon,
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

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Prevenir scroll del body cuando esté en pantalla completa
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white' : ''}`}>
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
      
      {/* Botón de pantalla completa */}
      {googleMapsLoaded && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`absolute top-2 right-2 z-[10000] bg-white/90 hover:bg-white shadow-md border-2 ${isFullscreen ? 'top-4 right-4' : ''}`}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 mr-1" />
              Salir
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-1" />
              Pantalla completa
            </>
          )}
        </Button>
      )}
    </div>
  );
}

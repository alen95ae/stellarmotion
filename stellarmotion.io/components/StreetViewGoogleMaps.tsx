"use client";
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export interface StreetViewPov {
  heading: number;
  pitch: number;
  zoom: number;
}

export interface StreetViewGoogleMapsProps {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  zoom?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
  onPovChange?: (pov: StreetViewPov) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function StreetViewGoogleMaps({
  lat,
  lng,
  heading = 0,
  pitch = 0,
  zoom = 1,
  height = "400px",
  width = "100%",
  className = "",
  onPovChange,
}: StreetViewGoogleMapsProps) {
  const streetViewContainer = useRef<HTMLDivElement>(null);
  const panorama = useRef<any>(null);
  const onPovChangeRef = useRef(onPovChange);
  onPovChangeRef.current = onPovChange;
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const [isStreetViewReady, setIsStreetViewReady] = useState(false);
  const [hasStreetView, setHasStreetView] = useState(true);

  // Inicializar Street View
  useEffect(() => {
    if (!googleMapsLoaded || !streetViewContainer.current || panorama.current) return;

    const initializeStreetView = () => {
      if (!window.google || !streetViewContainer.current) return;

      // Verificar si hay Street View disponible en esta ubicación
      const service = new window.google.maps.StreetViewService();
      service.getPanorama(
        { location: { lat, lng }, radius: 50 },
        (data: any, status: string) => {
          if (status === window.google.maps.StreetViewStatus.OK) {
            // Hay Street View disponible
            panorama.current = new window.google.maps.StreetViewPanorama(
              streetViewContainer.current,
              {
                position: { lat, lng },
                pov: {
                  heading: heading,
                  pitch: pitch,
                },
                zoom: zoom,
                visible: true,
                enableCloseButton: false,
                showRoadLabels: true,
              }
            );

            panorama.current.addListener('status_changed', () => {
              if (panorama.current.getStatus() === window.google.maps.StreetViewStatus.OK) {
                setIsStreetViewReady(true);
                setHasStreetView(true);
              } else {
                setHasStreetView(false);
                setIsStreetViewReady(true);
              }
            });

            const throttledNotifyPov = () => {
              if (panorama.current && onPovChangeRef.current) {
                const pov = panorama.current.getPov();
                const zoomVal = panorama.current.getZoom();
                onPovChangeRef.current({
                  heading: typeof pov?.heading === "number" ? pov.heading : 0,
                  pitch: typeof pov?.pitch === "number" ? pov.pitch : 0,
                  zoom: typeof zoomVal === "number" ? zoomVal : 1,
                });
              }
            };
            let throttleTimer: ReturnType<typeof setTimeout> | null = null;
            const schedulePovNotify = () => {
              if (throttleTimer !== null) return;
              throttleTimer = setTimeout(() => {
                throttleTimer = null;
                throttledNotifyPov();
              }, 150);
            };
            panorama.current.addListener("pov_changed", schedulePovNotify);
            panorama.current.addListener("zoom_changed", schedulePovNotify);

            setIsStreetViewReady(true);
            setHasStreetView(true);
          } else {
            // No hay Street View disponible
            setHasStreetView(false);
            setIsStreetViewReady(true);
          }
        }
      );
    };

    initializeStreetView();

    return () => {
      if (panorama.current) {
        window.google.maps.event.clearInstanceListeners(panorama.current);
        panorama.current = null;
      }
    };
  }, [googleMapsLoaded, lat, lng]);

  // Actualizar posición cuando cambien las coordenadas
  useEffect(() => {
    if (!panorama.current || !isStreetViewReady || !hasStreetView) return;

    const service = new window.google.maps.StreetViewService();
    service.getPanorama(
      { location: { lat, lng }, radius: 50 },
      (data: any, status: string) => {
        if (status === window.google.maps.StreetViewStatus.OK && panorama.current) {
          panorama.current.setPosition({ lat, lng });
        }
      }
    );
  }, [lat, lng, isStreetViewReady, hasStreetView]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor de Street View */}
      <div 
        ref={streetViewContainer}
        className="w-full h-full rounded-xl overflow-hidden" 
        style={{ minHeight: "300px" }}
      />

      {/* Loading indicator */}
      {!isStreetViewReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando Street View...</div>
        </div>
      )}

      {/* Mensaje si no hay Street View disponible */}
      {isStreetViewReady && !hasStreetView && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Street View no disponible</p>
            <p className="text-sm text-gray-400">No hay imágenes de Street View para esta ubicación</p>
          </div>
        </div>
      )}
    </div>
  );
}

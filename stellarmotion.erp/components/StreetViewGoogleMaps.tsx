"use client";

import { useEffect, useRef, useState } from "react";

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

/**
 * Debe usarse dentro de GoogleMapsLoader (LoadScript). Carga explícita del script en el padre.
 */
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
  const [isStreetViewReady, setIsStreetViewReady] = useState(false);
  const [hasStreetView, setHasStreetView] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.google?.maps || !streetViewContainer.current || panorama.current) return;

    const initializeStreetView = () => {
      if (!streetViewContainer.current) return;

      const service = new window.google.maps.StreetViewService();
      service.getPanorama(
        { location: { lat, lng }, radius: 50 },
        (data: any, status: string) => {
          if (status === window.google.maps.StreetViewStatus.OK) {
            panorama.current = new window.google.maps.StreetViewPanorama(streetViewContainer.current, {
              position: { lat, lng },
              pov: { heading, pitch },
              zoom,
              visible: true,
              enableCloseButton: false,
              showRoadLabels: true,
            });
            panorama.current.addListener("status_changed", () => {
              if (panorama.current?.getStatus() === window.google.maps.StreetViewStatus.OK) {
                setIsStreetViewReady(true);
                setHasStreetView(true);
              } else {
                setHasStreetView(false);
                setIsStreetViewReady(true);
              }
            });
            const notifyPov = () => {
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
            panorama.current.addListener("pov_changed", notifyPov);
            panorama.current.addListener("zoom_changed", notifyPov);
            setIsStreetViewReady(true);
            setHasStreetView(true);
          } else {
            setHasStreetView(false);
            setIsStreetViewReady(true);
          }
        }
      );
    };

    initializeStreetView();

    return () => {
      if (window.google?.maps?.event && panorama.current) {
        window.google.maps.event.clearInstanceListeners(panorama.current);
        panorama.current = null;
      }
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!panorama.current || !isStreetViewReady || !hasStreetView) return;
    if (typeof window === "undefined" || !window.google?.maps) return;

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
      <div
        ref={streetViewContainer}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-300"
        style={{ minHeight: "300px" }}
      />
      {!isStreetViewReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando Street View...</div>
        </div>
      )}
      {isStreetViewReady && !hasStreetView && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Street View no disponible</p>
            <p className="text-sm text-gray-400">No hay imágenes para esta ubicación</p>
          </div>
        </div>
      )}
    </div>
  );
}

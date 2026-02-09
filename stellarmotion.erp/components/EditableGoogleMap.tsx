"use client";

import { useEffect, useRef, useState, useMemo } from "react";

type Props = {
  lat: number;
  lng: number;
  onChange: (c: { lat: number; lng: number }) => void;
  height?: number;
};

const MARKETPLACE_MARKER_ICON = {
  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  scaledSize: { width: 32, height: 32 } as const,
};

declare global {
  interface Window {
    google: any;
  }
}

/**
 * Debe usarse dentro de GoogleMapsLoader (LoadScript). Carga explícita del script en el padre.
 */
export default function EditableGoogleMap({ lat, lng, onChange, height = 280 }: Props) {
  const [pos, setPos] = useState({ lat, lng });
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);

  const center = useMemo(() => ({ lat: pos.lat, lng: pos.lng }), [pos]);
  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: `${height}px`,
      borderRadius: 12,
    }),
    [height]
  );

  useEffect(() => {
    if (lat !== pos.lat || lng !== pos.lng) {
      setPos({ lat, lng });
      if (marker.current && map.current && typeof window !== "undefined" && window.google?.maps) {
        const newPosition = new window.google.maps.LatLng(lat, lng);
        marker.current.setPosition(newPosition);
        map.current.setCenter(newPosition);
      }
    }
  }, [lat, lng]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.google?.maps || !mapContainer.current || map.current) return;

    const initMap = () => {
      if (!mapContainer.current) return;

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

      marker.current = new window.google.maps.Marker({
        position: center,
        map: map.current,
        draggable: true,
        icon: {
          url: MARKETPLACE_MARKER_ICON.url,
          scaledSize: new window.google.maps.Size(32, 32),
        },
        title: "Arrastra para cambiar la ubicación",
      });

      map.current.addListener("click", (e: any) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        setPos({ lat: clickedLat, lng: clickedLng });
        marker.current.setPosition(e.latLng);
        onChange({ lat: clickedLat, lng: clickedLng });
      });

      marker.current.addListener("dragend", (e: any) => {
        const draggedLat = e.latLng.lat();
        const draggedLng = e.latLng.lng();
        setPos({ lat: draggedLat, lng: draggedLng });
        onChange({ lat: draggedLat, lng: draggedLng });
      });
    };

    initMap();

    return () => {
      if (window.google?.maps?.event) {
        if (marker.current) {
          window.google.maps.event.clearInstanceListeners(marker.current);
          marker.current = null;
        }
        if (map.current) {
          window.google.maps.event.clearInstanceListeners(map.current);
          map.current = null;
        }
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={mapContainerStyle}
        className="rounded-lg overflow-hidden border border-gray-300"
      />
    </div>
  );
}

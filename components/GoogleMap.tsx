"use client";

import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";

type LatLng = { lat: number; lng: number };

export default function GoogleMapSM({
  center,
  zoom = 12,
  markers = [],
  className = "h-[420px] w-full rounded-2xl overflow-hidden border",
}: {
  center?: LatLng;
  zoom?: number;
  markers?: LatLng[];
  className?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={className}>
        <div className="p-4 text-red-600">
          Falta <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en <code>.env.local</code>
        </div>
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const defaultCenter = useMemo<LatLng>(() => ({ lat: -16.5, lng: -68.15 }), []);
  const mapCenter = center ?? defaultCenter;

  if (loadError) return <div className={className}><div className="p-4 text-red-600">Error cargando Google Maps</div></div>;
  if (!isLoaded) return <div className={className} aria-busy="true" />;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={zoom}
        options={{ clickableIcons: false, streetViewControl: false, mapTypeControl: false }}
      >
        {markers.map((m, i) => <MarkerF key={i} position={m} />)}
      </GoogleMap>
    </div>
  );
}

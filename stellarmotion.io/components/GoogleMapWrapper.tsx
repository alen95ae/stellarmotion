"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Importar el mapa de forma dinámica solo en el cliente
const GoogleMapSM = dynamic(() => import("./GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});

type LatLng = { lat: number; lng: number };

interface GoogleMapWrapperProps {
  center?: LatLng;
  zoom?: number;
  markers?: LatLng[];
  className?: string;
}

export default function GoogleMapWrapper(props: GoogleMapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={props.className || "h-[420px] w-full rounded-2xl overflow-hidden border"}>
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Cargando mapa...</div>
        </div>
      </div>
    );
  }

  return <GoogleMapSM {...props} />;
}

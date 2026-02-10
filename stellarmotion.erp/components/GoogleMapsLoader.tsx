"use client";

import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  children: React.ReactNode;
  loadingElement?: React.ReactNode;
};

/**
 * Carga el script de Google Maps y solo renderiza children cuando isLoaded es true.
 * Evita "window.google.maps.Map is not a constructor" por montaje prematuro.
 */
export default function GoogleMapsLoader({ children, loadingElement }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-erp",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    preventGoogleFontsLoading: true,
  });

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 p-6 text-gray-600">
        Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local para cargar el mapa.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 p-6 text-red-600">
        Error al cargar Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <>{loadingElement ?? <div className="flex h-[380px] items-center justify-center rounded-lg bg-gray-100 text-gray-500">Cargando mapa...</div>}</>
    );
  }

  return <>{children}</>;
}

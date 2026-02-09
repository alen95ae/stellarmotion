"use client";

import { LoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  children: React.ReactNode;
  loadingElement?: React.ReactNode;
};

/**
 * Carga explícita del script de Google Maps con LoadScript (@react-google-maps/api).
 * Si NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está definida, no se carga el mapa.
 */
export default function GoogleMapsLoader({ children, loadingElement }: Props) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 p-6 text-gray-600">
        Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local para cargar el mapa.
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      loadingElement={loadingElement ?? <div className="flex h-[380px] items-center justify-center rounded-lg bg-gray-100 text-gray-500">Cargando mapa...</div>}
    >
      {children}
    </LoadScript>
  );
}

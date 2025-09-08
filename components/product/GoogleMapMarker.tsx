"use client";

import { useEffect, useRef } from "react";

const CATEGORY_ICON: Record<string, string> = {
  valla: "/icons/valla.svg",
  mupi: "/icons/mupi.svg",
  led: "/icons/led.svg",
  digital: "/icons/led.svg",
  bipolar: "/icons/valla.svg",
  unipolar: "/icons/valla.svg",
  pantalla: "/icons/led.svg",
  displays: "/icons/led.svg",
  "parada de bus": "/icons/mupi.svg",
  letreros: "/icons/valla.svg",
  carteleras: "/icons/valla.svg",
  murales: "/icons/valla.svg",
};

export default function GoogleMapMarker({
  lat,
  lng,
  category,
  title = "Ubicación",
}: {
  lat: number;
  lng: number;
  category: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !ref.current) return;

    try {
      // Determinar la categoría para el icono
      const categoryKey = Object.keys(CATEGORY_ICON).find(
        (key) => category.toLowerCase().includes(key.toLowerCase())
      ) || "default";

      const iconUrl = CATEGORY_ICON[categoryKey] || "/icons/default.svg";

      // Crear el mapa usando la API tradicional
      const map = new google.maps.Map(ref.current!, {
        center: { lat, lng },
        zoom: 15,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Crear el marcador
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32),
        },
      });

      // Crear la ventana de información
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${title}</strong><br><span class="text-sm text-gray-600">${category}</span></div>`,
      });

      // Mostrar info al hacer clic
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

    } catch (error) {
      console.error("Error loading Google Maps:", error);
      
      // Fallback: mostrar mensaje de error
      if (ref.current) {
        ref.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600">
            <div class="text-center">
              <div class="text-lg font-medium mb-2">Error al cargar el mapa</div>
              <div class="text-sm">Verifica tu clave de API de Google Maps</div>
            </div>
          </div>
        `;
      }
    }
  }, [lat, lng, category, title]);

  return (
    <div className="w-full h-80 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}

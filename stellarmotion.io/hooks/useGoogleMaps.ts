import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya está cargado
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Verificar si ya hay un script cargándose
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      setIsLoading(true);
      existingScript.addEventListener('load', () => {
        setIsLoaded(true);
        setIsLoading(false);
      });
      return;
    }

    // Cargar script de Google Maps
    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
      console.error('Error loading Google Maps API');
    };
    document.head.appendChild(script);
  }, []);

  return { isLoaded, isLoading };
};

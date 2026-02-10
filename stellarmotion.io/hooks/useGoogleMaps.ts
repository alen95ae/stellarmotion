import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Singleton: una sola carga de la API para toda la app (evita "included multiple times")
let loadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    loadPromise = new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed')));
    });
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!document.querySelector('script[src*="markerclusterer"]')) {
        const clusterScript = document.createElement('script');
        clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer@2.4.0/dist/index.min.js';
        clusterScript.async = true;
        clusterScript.defer = true;
        document.head.appendChild(clusterScript);
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Error loading Google Maps API'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== 'undefined' && Boolean(window.google?.maps));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    loadGoogleMapsScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        console.error('Error loading Google Maps API');
      });
  }, []);

  return { isLoaded, isLoading };
};

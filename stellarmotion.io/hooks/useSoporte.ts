import { useState, useEffect } from 'react';
import { Soporte } from './useSoportes';

interface UseSoporteReturn {
  soporte: Soporte | null;
  loading: boolean;
  error: string | null;
}

export function useSoporte(id: string): UseSoporteReturn {
  const [soporte, setSoporte] = useState<Soporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSoporte = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/soportes/${id}`;
        console.log('Fetching soporte from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Soporte no encontrado');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSoporte(data);
        
        console.log('Soporte loaded:', data);
      } catch (err) {
        console.error('Error fetching soporte:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setSoporte(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSoporte();
    }
  }, [id]);

  return {
    soporte,
    loading,
    error
  };
}

import { useState, useEffect } from 'react';

export interface Soporte {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  tipo: string;
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento';
  precio: number;
  dimensiones: {
    ancho: number;
    alto: number;
    area: number;
  };
  imagenes: string[];
  categoria: string;
  codigoInterno?: string;
  codigoCliente?: string;
  pais?: string;
  ciudad?: string;
  googleMapsLink?: string;
  impactosDiarios?: number;
  impactosDiariosPorM2?: number;
  resumenAutomatico?: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    companyName?: string;
    email: string;
  };
  iluminacion?: boolean;
  destacado?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseSoportesOptions {
  search?: string;
  categoria?: string;
  estado?: string;
  tipo?: string;
  page?: number;
  limit?: number;
}

interface UseSoportesReturn {
  soportes: Soporte[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useSoportes(options: UseSoportesOptions = {}): UseSoportesReturn {
  const [soportes, setSoportes] = useState<Soporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchSoportes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir URL con parámetros
        const params = new URLSearchParams();
        if (options.search) params.set('search', options.search);
        if (options.categoria) params.set('categoria', options.categoria);
        if (options.estado) params.set('estado', options.estado);
        if (options.tipo) params.set('tipo', options.tipo);
        if (options.page) params.set('page', options.page.toString());
        if (options.limit) params.set('limit', options.limit.toString());

        const url = `/api/soportes?${params.toString()}`;
        console.log('📡 useSoportes: Fetching from:', url);

        // Timeout de 10s para el hook (más corto que el timeout del ERP)
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (isCancelled) return;
        
        console.log('📡 useSoportes: Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('❌ useSoportes: HTTP error!', response.status, errorText);
          
          // Si la respuesta es HTML (página de error), dar un mensaje más claro
          if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
            throw new Error(`Error ${response.status}: El servidor devolvió una página de error. Verifica que el endpoint /api/soportes existe.`);
          }
          
          throw new Error(`Error ${response.status}: ${errorText.slice(0, 100)}`);
        }

        // Verificar que la respuesta sea JSON antes de parsear
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text().catch(() => '');
          console.error('❌ useSoportes: Response is not JSON! Content-Type:', contentType);
          console.error('❌ useSoportes: Response body (first 200 chars):', text.slice(0, 200));
          throw new Error('El servidor devolvió una respuesta que no es JSON. Verifica que el endpoint /api/soportes esté funcionando correctamente.');
        }

        const data = await response.json();
        
        if (isCancelled) return;
        
        console.log('✅ useSoportes: Soportes cargados:', data.soportes?.length || 0);
        
        setSoportes(data.soportes || []);
        setPagination(data.pagination || null);
      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        
        // Distinguir entre timeout y otros errores
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('⏱️ useSoportes: Timeout al cargar soportes');
          setError('Tiempo de espera agotado. El servidor no respondió a tiempo.');
        } else {
          console.error('❌ useSoportes: Error al cargar soportes:', errorMessage);
          setError(errorMessage);
        }
        
        // Fallback a datos vacíos en caso de error
        setSoportes([]);
        setPagination(null);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSoportes();

    // Cleanup: cancelar request si el componente se desmonta o cambian las deps
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [options.search, options.categoria, options.estado, options.tipo, options.page, options.limit]);

  return {
    soportes,
    loading,
    error,
    pagination
  };
}

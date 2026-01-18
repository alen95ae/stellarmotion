import { useState, useEffect } from 'react';
import { API_ENDPOINTS, fetchFromERP } from '@/lib/api-config';

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
  usuarioId?: string;
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

    const fetchSoportes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir URL con parámetros usando la API del ERP
        const params = new URLSearchParams();
        if (options.search) params.set('search', options.search);
        if (options.categoria) params.set('categoria', options.categoria);
        if (options.estado) params.set('estado', options.estado);
        if (options.tipo) params.set('tipo', options.tipo);
        if (options.page) params.set('page', options.page.toString());
        if (options.limit) params.set('limit', options.limit.toString());

        const url = `${API_ENDPOINTS.supports}?${params.toString()}`;
        console.log('📡 useSoportes: Fetching from ERP:', url);

        // Usar fetchFromERP que maneja timeouts y reintentos
        const data = await fetchFromERP(url);
        
        if (isCancelled) return;
        
        console.log('✅ useSoportes: Soportes cargados:', data.soportes?.length || 0);
        
        setSoportes(data.soportes || []);
        setPagination(data.pagination || null);
      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('❌ useSoportes: Error al cargar soportes:', errorMessage);
        
        // Usar el mensaje de error diagnosticado directamente (fetchFromERP ya lo hace)
        // El mensaje ya incluye información útil sobre CORS, conexión, timeout, etc.
        setError(errorMessage);
        
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
    };
  }, [options.search, options.categoria, options.estado, options.tipo, options.page, options.limit]);

  return {
    soportes,
    loading,
    error,
    pagination
  };
}

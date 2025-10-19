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
  partnerId?: string;
  partner?: {
    id: string;
    name: string;
    companyName?: string;
    email: string;
  };
  owner?: string;
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
        console.log('Fetching soportes from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setSoportes(data.soportes || []);
        setPagination(data.pagination || null);
        
        console.log('Soportes loaded:', data.soportes?.length || 0);
      } catch (err) {
        console.error('Error fetching soportes:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Fallback a datos vacíos en caso de error
        setSoportes([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSoportes();
  }, [options.search, options.categoria, options.estado, options.tipo, options.page, options.limit]);

  return {
    soportes,
    loading,
    error,
    pagination
  };
}

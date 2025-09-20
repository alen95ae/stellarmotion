import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  slug: string;
  label: string;
  iconKey: string;
  _count?: {
    supports: number;
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch categories'}`);
        }
        
        const data = await response.json();
        
        // Verificar que la respuesta sea un array
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected array');
        }
        
        // Agregar conteo de soportes (simulado por ahora)
        const categoriesWithCount = data.map((cat: any) => ({
          ...cat,
          id: cat.slug, // Usar slug como ID temporal
          _count: {
            supports: Math.floor(Math.random() * 50) + 10 // Número aleatorio para demo
          }
        }));
        
        setCategories(categoriesWithCount);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching categories:', err);
        
        // En caso de error, usar categorías por defecto para evitar que la UI se rompa
        setCategories([
          { id: 'vallas', slug: 'vallas', label: 'Vallas', iconKey: 'vallas', _count: { supports: 0 } },
          { id: 'mupis', slug: 'mupis', label: 'Mupis', iconKey: 'mupis', _count: { supports: 0 } },
          { id: 'pantallas', slug: 'pantallas', label: 'Pantallas', iconKey: 'pantallas', _count: { supports: 0 } },
          { id: 'carteleras', slug: 'carteleras', label: 'Carteleras', iconKey: 'carteleras', _count: { supports: 0 } }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

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
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
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
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

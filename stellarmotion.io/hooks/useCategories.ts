import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/lib/categories';

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

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected array');
        }

        const normalized = CATEGORIES.map((base) => {
          const match = data.find((cat: any) => cat.slug === base.slug);
          const id = match?.id ?? match?.slug ?? base.slug;
          const supportsCount = match?._count?.supports ?? match?.supportsCount ?? 0;
          return {
            id,
            slug: base.slug,
            label: match?.label ?? base.label,
            iconKey: base.iconKey,
            _count: { supports: supportsCount }
          };
        });

        setCategories(normalized);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching categories:', err);
        
        setCategories(CATEGORIES.map((base) => ({
          id: base.slug,
          slug: base.slug,
          label: base.label,
          iconKey: base.iconKey,
          _count: { supports: 0 }
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

import { NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP } from "@/lib/api-config";

export async function GET() {
  try {
    // Obtener categorías del backend
    const categories = await fetchFromERP(API_ENDPOINTS.categories);
    
    // Verificar que la respuesta sea un array
    if (!Array.isArray(categories)) {
      console.warn('Invalid categories response format:', categories);
      // Devolver categorías por defecto si la respuesta no es válida
      const defaultCategories = [
        { slug: 'vallas', label: 'Vallas', iconKey: 'vallas' },
        { slug: 'mupis', label: 'Mupis', iconKey: 'mupis' },
        { slug: 'pantallas', label: 'Pantallas', iconKey: 'pantallas' },
        { slug: 'carteleras', label: 'Carteleras', iconKey: 'carteleras' }
      ];
      return NextResponse.json(defaultCategories);
    }
    
    // Transformar a formato esperado por el frontend
    const cats = categories.map((cat: any) => ({
      slug: cat.slug,
      label: cat.label,
      iconKey: cat.iconKey,
    }));

    return NextResponse.json(cats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    // En caso de error, devolver categorías por defecto para evitar que la UI se rompa
    const defaultCategories = [
      { slug: 'vallas', label: 'Vallas', iconKey: 'vallas' },
      { slug: 'mupis', label: 'Mupis', iconKey: 'mupis' },
      { slug: 'pantallas', label: 'Pantallas', iconKey: 'pantallas' },
      { slug: 'carteleras', label: 'Carteleras', iconKey: 'carteleras' }
    ];
    
    return NextResponse.json(defaultCategories);
  }
}

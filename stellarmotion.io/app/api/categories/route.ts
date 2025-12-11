import { NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP } from "@/lib/api-config";
import { CATEGORIES } from "@/lib/categories";

// Forzar runtime Node.js para acceso a process.env
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Obtener categorías del backend
    const categories = await fetchFromERP(API_ENDPOINTS.categories);

    const categoriesArray = Array.isArray(categories) ? categories : [];

    const normalized = CATEGORIES.map((base) => {
      const match = categoriesArray.find((cat: any) => cat.slug === base.slug || cat.iconKey === base.iconKey);
      return {
        id: match?.id ?? match?.slug ?? base.slug,
        slug: base.slug,
        label: match?.label ?? base.label,
        iconKey: base.iconKey,
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Error fetching categories:", error);

    const fallback = CATEGORIES.map((base) => ({
      id: base.slug,
      slug: base.slug,
      label: base.label,
      iconKey: base.iconKey,
    }));

    return NextResponse.json(fallback);
  }
}

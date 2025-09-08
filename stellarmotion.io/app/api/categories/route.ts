import { NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP } from "@/lib/api-config";

export async function GET() {
  try {
    // Obtener categorías del backend
    const categories = await fetchFromERP(API_ENDPOINTS.categories);
    
    // Transformar a formato esperado por el frontend
    const cats = categories.map((cat: any) => ({
      slug: cat.slug,
      label: cat.label,
      iconKey: cat.iconKey,
    }));

    return NextResponse.json(cats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

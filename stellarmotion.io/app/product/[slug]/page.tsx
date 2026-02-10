import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Validar que el slug no sea null o vacío
  if (!slug || slug === 'null') {
    return {
      title: 'Producto no encontrado | StellarMotion',
      description: 'El producto solicitado no existe'
    };
  }
  
  const fallbackMetadata = {
    title: 'Producto | StellarMotion',
    description: 'Soporte publicitario en StellarMotion',
  };

  try {
    const erpUrl = process.env.NEXT_PUBLIC_ERP_API_URL || 'http://127.0.0.1:3000';
    const response = await fetch(`${erpUrl}/api/soportes/${slug}`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) return fallbackMetadata;

    const soporte = await response.json();
    if (!soporte) return fallbackMetadata;

    return {
      title: `${soporte.nombre} | StellarMotion`,
      description: soporte.descripcion ?? soporte.nombre,
      openGraph: {
        title: `${soporte.nombre} | StellarMotion`,
        description: soporte.descripcion ?? soporte.nombre,
        images: Array.isArray(soporte.imagenes) && soporte.imagenes.length > 0 ? [soporte.imagenes[0]] : []
      },
      alternates: { canonical: `https://stellarmotion.com/product/${soporte.id}` },
    };
  } catch {
    return fallbackMetadata;
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Validar que el slug no sea null o vacío
  if (!slug || slug === 'null') {
    return notFound();
  }
  
  // El slug es el ID del soporte
  return <ProductClient productId={slug} />;
}

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
  
  try {
    // Construir la URL base correctamente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return {
      title: 'Producto no encontrado | StellarMotion',
      description: 'El producto solicitado no existe'
    };
    
    const product = await response.json();
    if (!product) return {
      title: 'Producto no encontrado | StellarMotion',
      description: 'El producto solicitado no existe'
    };
    
    return {
      title: `${product.title} | StellarMotion`,
      description: product.shortDescription ?? product.title,
      openGraph: { 
        title: `${product.title} | StellarMotion`, 
        description: product.shortDescription ?? product.title, 
        images: Array.isArray(product.images) && product.images.length > 0 ? [product.images[0]] : []
      },
      alternates: { canonical: `https://stellarmotion.com/product/${product.slug}` },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Producto no encontrado | StellarMotion',
      description: 'El producto solicitado no existe'
    };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Validar que el slug no sea null o vacío
  if (!slug || slug === 'null') {
    return notFound();
  }
  
  try {
    // Construir la URL base correctamente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return notFound();
    
    const product = await response.json();
    if (!product) return notFound();
    
    return <ProductClient product={product} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}

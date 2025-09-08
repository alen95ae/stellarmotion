import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return {};
    
    const product = await response.json();
    if (!product) return {};
    
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
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Usar la API del frontend que ya procesa las imágenes correctamente
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/products/${slug}`, {
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

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          slug: true,
          label: true,
          iconKey: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProduct(slug);
    
    return {
      title: `${product.title} - StellarMotion`,
      description: `Soporte publicitario en ${product.city}, ${product.country}. ${product.dimensions} con ${product.dailyImpressions} impactos diarios.`,
      openGraph: {
        title: product.title,
        description: `Soporte publicitario en ${product.city}, ${product.country}`,
        images: product.images.split(',').map(img => img.trim()),
        type: 'website',
      },
      alternates: {
        canonical: `/product/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Producto no encontrado - StellarMotion',
      description: 'El producto solicitado no está disponible.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product;

  try {
    product = await getProduct(slug);
  } catch (error) {
    notFound();
  }

  return <ProductClient product={product} />;
}

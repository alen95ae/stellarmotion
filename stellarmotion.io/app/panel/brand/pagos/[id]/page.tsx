import { Metadata } from 'next';
import { Suspense } from 'react';
import InvoiceDetailClient from './InvoiceDetailClient';

export const metadata: Metadata = {
  title: 'Detalle factura - Pagos | StellarMotion',
  description: 'Detalle de factura y pagos',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BrandInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-900 -mt-10">Detalle de factura</h1>
      <Suspense fallback={<div className="py-12 text-sm text-gray-500">Cargando…</div>}>
        <InvoiceDetailClient invoiceId={id} />
      </Suspense>
    </div>
  );
}

import { Metadata } from 'next';
import InvoiceDetailClient from './InvoiceDetailClient';

export const metadata: Metadata = {
  title: 'Detalle factura - Facturación | StellarMotion',
  description: 'Detalle de factura y pagos',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-900 -mt-10">Detalle de factura</h1>
      <InvoiceDetailClient invoiceId={id} />
    </div>
  );
}

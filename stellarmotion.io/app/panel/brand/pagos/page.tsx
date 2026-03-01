import { Metadata } from 'next';
import PagosClient from './PagosClient';

export const metadata: Metadata = {
  title: 'Pagos - Panel Brand | StellarMotion',
  description: 'Facturas y pagos',
};

export default function PagosPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900 -mt-10">Pagos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Facturas y pagos a owners
        </p>
      </div>
      <PagosClient />
    </div>
  );
}

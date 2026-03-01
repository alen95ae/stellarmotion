import { Metadata } from 'next';
import FacturacionClient from './FacturacionClient';

export const metadata: Metadata = {
  title: 'Facturación - Panel de Control | StellarMotion',
  description: 'Gestión de facturas y cobros',
};

export default function FacturacionPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900 -mt-10">Facturación</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona facturas, cobros y estados de pago
        </p>
      </div>
      <FacturacionClient />
    </div>
  );
}

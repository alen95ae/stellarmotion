'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, CheckCircle, AlertTriangle, XCircle, Send } from 'lucide-react';
import type { Invoice } from '@/types/invoices';

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  enviada: 'bg-blue-100 text-blue-800',
  pagada: 'bg-green-100 text-green-800',
  vencida: 'bg-red-100 text-red-800',
  parcial: 'bg-orange-100 text-orange-800',
  cancelada: 'bg-gray-100 text-gray-800',
};

const estadoIcons: Record<string, typeof Clock> = {
  pendiente: Clock,
  enviada: Send,
  pagada: CheckCircle,
  vencida: AlertTriangle,
  parcial: Clock,
  cancelada: XCircle,
};

function formatPeriod(ini: string, fin: string): string {
  try {
    const a = new Date(ini).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    const b = new Date(fin).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    return `${a} – ${b}`;
  } catch {
    return `${ini} – ${fin}`;
  }
}

interface FacturasTableProps {
  invoices: Invoice[];
}

export default function FacturasTable({ invoices }: FacturasTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
        No hay facturas que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Invoice #
            </th>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Brand
            </th>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Periodo
            </th>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Estado
            </th>
            <th className="h-12 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Fecha vencimiento
            </th>
            <th className="h-12 px-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {invoices.map((inv) => {
            const IconComponent = estadoIcons[inv.estado] ?? Clock;
            const isVencida = inv.estado === 'vencida';
            return (
              <tr
                key={inv.id}
                className={`hover:bg-gray-50 ${isVencida ? 'bg-red-50' : ''}`}
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {inv.numero}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                  {inv.brand_name ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatPeriod(inv.periodo_inicio, inv.periodo_fin)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  Bs. {Number(inv.total).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge
                    className={`inline-flex items-center ${estadoColors[inv.estado] ?? 'bg-gray-100 text-gray-800'}`}
                  >
                    <IconComponent className="mr-1 h-3 w-3" />
                    {inv.estado.charAt(0).toUpperCase() + inv.estado.slice(1)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(inv.fecha_vencimiento).toLocaleDateString('es-ES')}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" asChild>
                    <Link href={`/panel/owner/facturacion/${inv.id}`} title="Ver factura">
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

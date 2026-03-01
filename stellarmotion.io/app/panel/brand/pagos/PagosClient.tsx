'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PagosKPIs from './PagosKPIs';
import PagosTable from './PagosTable';
import type { Invoice } from '@/types/invoices';

const now = new Date();

function computeKpis(invoices: Invoice[]) {
  const pendientes = invoices.filter(
    (i) => i.estado === 'pendiente' || i.estado === 'vencida' || i.estado === 'parcial' || i.estado === 'enviada'
  );
  const totalPendiente = pendientes.reduce((s, i) => {
    const total = Number(i.total);
    const paid = Number(i.paid_amount ?? 0);
    return s + Math.max(0, total - paid);
  }, 0);
  const totalPagadoHistorico = invoices.reduce((s, i) => {
    if (i.estado === 'pagada') return s + Number(i.total);
    if (i.estado === 'parcial') return s + Number(i.paid_amount ?? 0);
    return s;
  }, 0);
  const facturasVencidas = invoices.filter((i) => i.estado === 'vencida').length;
  const futuras = pendientes
    .map((i) => i.fecha_vencimiento)
    .filter((d) => d && new Date(d) >= now)
    .sort();
  const proximoVencimiento = futuras.length > 0
    ? new Date(futuras[0]).toLocaleDateString('es-ES')
    : null;
  return { totalPendiente, totalPagadoHistorico, facturasVencidas, proximoVencimiento };
}

export default function PagosClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/brand/invoices', { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error al cargar facturas');
        }
        const data = await res.json();
        if (!cancelled) setInvoices(data.invoices ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar facturas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kpis = useMemo(() => computeKpis(invoices), [invoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        Cargando facturas…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PagosKPIs
        totalPendiente={kpis.totalPendiente}
        totalPagadoHistorico={kpis.totalPagadoHistorico}
        facturasVencidas={kpis.facturasVencidas}
        proximoVencimiento={kpis.proximoVencimiento}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <PagosTable invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  );
}

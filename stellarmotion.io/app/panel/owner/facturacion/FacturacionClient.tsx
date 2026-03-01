'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FacturacionKPIs from './FacturacionKPIs';
import FacturacionFilters, { type FilterEstado } from './FacturacionFilters';
import FacturasTable from './FacturasTable';
import type { Invoice } from '@/types/invoices';

const now = new Date();
const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 7);

function computeKpis(invoices: Invoice[]) {
  const pagadas = invoices.filter((i) => i.estado === 'pagada');
  const ingresosTotales = pagadas.reduce((s, i) => s + Number(i.total), 0);
  const ingresosEsteMes = pagadas.filter((i) => {
    try {
      const d = new Date(i.updated_at ?? i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch {
      return false;
    }
  }).reduce((s, i) => s + Number(i.total), 0);
  const facturasPendientes = invoices.filter(
    (i) => i.estado === 'pendiente' || i.estado === 'enviada' || i.estado === 'parcial'
  ).length;
  const facturasVencidas = invoices.filter((i) => i.estado === 'vencida').length;
  return { ingresosTotales, ingresosEsteMes, facturasPendientes, facturasVencidas };
}

export default function FacturacionClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterMonth, setFilterMonth] = useState(thisMonthStart);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/owner/invoices', { credentials: 'include' });
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

  const brandOptions = useMemo(() => {
    const byId = new Map<string, string>();
    invoices.forEach((i) => {
      if (i.brand_contacto_id && (i.brand_name ?? '').trim()) {
        byId.set(i.brand_contacto_id, (i.brand_name ?? '').trim());
      }
    });
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (filterEstado !== 'all') {
      list = list.filter((i) => i.estado === filterEstado);
    }
    if (filterBrand !== 'all') {
      list = list.filter((i) => i.brand_contacto_id === filterBrand);
    }
    if (filterMonth) {
      list = list.filter((i) => {
        const periodStart = i.periodo_inicio?.slice(0, 7);
        return periodStart === filterMonth;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.numero ?? '').toLowerCase().includes(q) ||
          (i.brand_name ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, filterEstado, filterBrand, filterMonth, search]);

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
      <FacturacionKPIs
        ingresosTotales={kpis.ingresosTotales}
        ingresosEsteMes={kpis.ingresosEsteMes}
        facturasPendientes={kpis.facturasPendientes}
        facturasVencidas={kpis.facturasVencidas}
      />

      <Card>
        <CardContent className="pt-6">
          <FacturacionFilters
            search={search}
            onSearchChange={setSearch}
            filterEstado={filterEstado}
            onFilterEstadoChange={setFilterEstado}
            filterBrand={filterBrand}
            onFilterBrandChange={setFilterBrand}
            filterMonth={filterMonth}
            onFilterMonthChange={setFilterMonth}
            brandOptions={brandOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lista de facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <FacturasTable invoices={filteredInvoices} />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Send, CreditCard, Loader2 } from 'lucide-react';
import type { Invoice, Payment } from '@/types/invoices';

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
  cancelada: AlertTriangle,
};

interface InvoiceDetailClientProps {
  invoiceId: string;
}

export default function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const searchParams = useSearchParams();
  const openPagar = searchParams.get('pagar') === '1';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [showPayForm, setShowPayForm] = useState(openPagar);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [invRes, payRes] = await Promise.all([
          fetch(`/api/brand/invoices/${invoiceId}`, { credentials: 'include' }),
          fetch(`/api/brand/invoices/${invoiceId}/payments`, { credentials: 'include' }),
        ]);
        if (!invRes.ok) {
          const data = await invRes.json().catch(() => ({}));
          throw new Error(data.error || 'Factura no encontrada');
        }
        const invData = await invRes.json();
        if (!cancelled) {
          setInvoice(invData.invoice ?? null);
          const inv = invData.invoice;
          if (inv) {
            const total = Number(inv.total);
            const paid = Number(inv.paid_amount ?? 0);
            const rest = Math.max(0, total - paid);
            setPayAmount(rest > 0 ? String(rest) : '');
          }
        }
        if (payRes.ok) {
          const payData = await payRes.json();
          if (!cancelled) setPayments(payData.payments ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId]);

  const handlePay = async () => {
    if (!invoiceId || paying || !invoice) return;
    const amount = parseFloat(payAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
    }
    setPaying(true);
    try {
      const res = await fetch(`/api/brand/invoices/${invoiceId}/pay`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: payMethod.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Error al registrar pago');
        return;
      }
      setShowPayForm(false);
      setPayAmount('');
      setPayMethod('');
      const [invRes, payRes] = await Promise.all([
        fetch(`/api/brand/invoices/${invoiceId}`, { credentials: 'include' }),
        fetch(`/api/brand/invoices/${invoiceId}/payments`, { credentials: 'include' }),
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoice(invData.invoice ?? null);
      }
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments ?? []);
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        Cargando factura…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/panel/brand/pagos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? 'Factura no encontrada'}
        </div>
      </div>
    );
  }

  const IconComponent = estadoIcons[invoice.estado] ?? Clock;
  const canPay = (invoice.estado === 'pendiente' || invoice.estado === 'vencida' || invoice.estado === 'parcial') && !paying;
  const total = Number(invoice.total);
  const paid = Number(invoice.paid_amount ?? 0);
  const restante = Math.max(0, total - paid);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/panel/brand/pagos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pagos
          </Link>
        </Button>
        <Badge
          className={`inline-flex items-center ${estadoColors[invoice.estado] ?? 'bg-gray-100 text-gray-800'}`}
        >
          <IconComponent className="mr-1 h-3 w-3" />
          {invoice.estado.charAt(0).toUpperCase() + invoice.estado.slice(1)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Factura {invoice.numero}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Periodo: {new Date(invoice.periodo_inicio).toLocaleDateString('es-ES')} – {new Date(invoice.periodo_fin).toLocaleDateString('es-ES')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Owner</h3>
            <p className="text-base font-medium text-gray-900">{invoice.owner_name ?? '—'}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Desglose</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium">Bs. {Number(invoice.subtotal).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Impuesto (IVA)</dt>
                <dd className="font-medium">Bs. {Number(invoice.impuesto).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <dt className="font-medium text-gray-900">Total</dt>
                <dd className="font-bold">Bs. {total.toLocaleString()}</dd>
              </div>
              {paid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <dt>Pagado</dt>
                    <dd>Bs. {paid.toLocaleString()}</dd>
                  </div>
                  {restante > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <dt>Restante</dt>
                      <dd>Bs. {restante.toLocaleString()}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Historial de pagos</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500">No se han registrado pagos</p>
            ) : (
              <ul className="divide-y divide-gray-200 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <span>
                      Bs. {Number(p.monto).toLocaleString()}
                      {p.metodo && ` · ${p.metodo}`}
                    </span>
                    <span className="text-gray-500">{new Date(p.fecha_pago).toLocaleDateString('es-ES')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canPay && (
            <div className="border-t pt-4 space-y-3">
              {!showPayForm ? (
                <Button onClick={() => setShowPayForm(true)} className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar
                </Button>
              ) : (
                <div className="rounded-lg border p-4 space-y-3 max-w-sm">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Monto (Bs.)</label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Método (opcional)</label>
                    <Input
                      type="text"
                      placeholder="Ej. Transferencia, efectivo"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePay}
                      disabled={paying}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                      Registrar pago
                    </Button>
                    <Button variant="outline" onClick={() => setShowPayForm(false)} disabled={paying}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

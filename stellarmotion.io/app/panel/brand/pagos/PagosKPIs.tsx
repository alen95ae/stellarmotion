'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, History, AlertTriangle, Calendar } from 'lucide-react';

interface PagosKPIsProps {
  totalPendiente: number;
  totalPagadoHistorico: number;
  facturasVencidas: number;
  proximoVencimiento: string | null;
}

export default function PagosKPIs(props: PagosKPIsProps) {
  const { totalPendiente, totalPagadoHistorico, facturasVencidas, proximoVencimiento } = props;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total pendiente</CardTitle>
          <DollarSign className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-amber-600">Bs. {totalPendiente.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Por pagar</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total pagado histórico</CardTitle>
          <History className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-600">Bs. {totalPagadoHistorico.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Facturas pagadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturas vencidas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-red-600">{facturasVencidas}</div>
          <p className="text-xs text-muted-foreground">Requieren atención</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximo vencimiento</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{proximoVencimiento ?? '—'}</div>
          <p className="text-xs text-muted-foreground">Siguiente factura a vencer</p>
        </CardContent>
      </Card>
    </div>
  );
}

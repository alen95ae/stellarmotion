'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, TrendingUp, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function ClienteInicioPage() {
  return (
    <div className="space-y-1.5">
      <div className="mb-1">
        <h1 className="text-lg font-bold tracking-tight">Dashboard Brand</h1>
        <p className="text-muted-foreground mt-0.5 text-xs leading-tight">
          Bienvenido a tu panel de control
        </p>
      </div>

      <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-2">
          <Link href="/panel/cliente/solicitudes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
              <CardTitle className="text-sm font-medium">
                Solicitudes
              </CardTitle>
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 py-2">
              <div className="text-base font-bold">-</div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Ver tus solicitudes de cotización
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="p-2">
          <Link href="/panel/cliente/anuncios">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
              <CardTitle className="text-sm font-medium">
                Mis Anuncios
              </CardTitle>
              <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 py-2">
              <div className="text-base font-bold">-</div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Gestiona tus anuncios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="p-2">
          <Link href="/panel/cliente/anuncios/metricas">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
              <CardTitle className="text-sm font-medium">
                Métricas
              </CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 py-2">
              <div className="text-base font-bold">-</div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Estadísticas de anuncios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="p-2">
          <Link href="/panel/cliente/facturacion">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
              <CardTitle className="text-sm font-medium">
                Facturación
              </CardTitle>
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 py-2">
              <div className="text-base font-bold">-</div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Ver facturas y pagos
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}


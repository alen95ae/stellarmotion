'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, TrendingUp, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function ClienteInicioPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Cliente</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido a tu panel de control
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Link href="/panel/cliente/alquileres">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Alquileres
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Ver todos tus alquileres
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href="/panel/cliente/anuncios">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Anuncios
              </CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Gestiona tus anuncios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href="/panel/cliente/anuncios/metricas">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Métricas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Estadísticas de anuncios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href="/panel/cliente/facturacion">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Facturación
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Ver facturas y pagos
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}


'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Pause, Trash2 } from 'lucide-react';
import type { Campaign, CampaignStatus } from '@/types/campaigns';

function formatEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  borrador: 'Borrador',
  finalizada: 'Finalizada',
};

const STATUS_CLASS: Record<CampaignStatus, string> = {
  activa: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pausada: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  borrador: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  finalizada: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

interface CampaignsTableBrandProps {
  campaigns: Campaign[];
  basePath?: string;
}

export default function CampaignsTableBrand({ campaigns, basePath = '/panel/brand/campaigns' }: CampaignsTableBrandProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Aún no tienes campañas. Crea la primera.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-gray-500 dark:text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Nombre</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Fechas</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Presupuesto</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const isActive = c.status === 'activa';
            const canToggle = c.status === 'activa' || c.status === 'pausada';
            return (
              <TableRow key={c.id} className="border-gray-100 dark:border-gray-800">
                <TableCell>
                  {canToggle && (
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => {}}
                      aria-label={isActive ? 'Pausar campaña' : 'Activar campaña'}
                      className="data-[state=checked]:bg-green-600"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_CLASS[c.status] ?? ''}>{STATUS_LABEL[c.status]}</Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(c.start_date)} – {formatDate(c.end_date)}
                </TableCell>
                <TableCell className="font-medium tabular-nums">{formatEur(Number(c.budget))}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Abrir menú">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`${basePath}/${c.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      {canToggle && (
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  Copy,
  BarChart2,
  Trash2,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { CampaignRow as CampaignType, CampaignStatus } from '@/types/campaigns';

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

function formatNumber(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString('es-ES');
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  borrador: 'Borrador',
  finalizada: 'Finalizada',
};

const STATUS_VARIANT: Record<CampaignStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  activa: 'default',
  pausada: 'secondary',
  borrador: 'outline',
  finalizada: 'secondary',
};

interface CampaignsTableProps {
  campaigns: CampaignType[];
  statusFilter: string;
  searchQuery: string;
  onToggleStatus?: (campaign: CampaignType, checked: boolean) => void;
  loading?: boolean;
  /** Ruta base (ej. /panel/owner/marketing) para enlaces editar/reporte */
  basePath?: string;
}

export default function CampaignsTable({
  campaigns,
  statusFilter,
  searchQuery,
  onToggleStatus,
  loading = false,
  basePath = '/panel/owner/marketing',
}: CampaignsTableProps) {
  const [optimistic, setOptimistic] = useState<Record<string, CampaignStatus>>({});

  const filtered = campaigns.filter((c) => {
    const matchStatus =
      statusFilter === 'todas' || c.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const displayStatus = (c: CampaignType) => optimistic[c.id] ?? c.status;

  const handleSwitch = (c: CampaignType, checked: boolean) => {
    const next: CampaignStatus = checked ? 'activa' : 'pausada';
    setOptimistic((prev) => ({ ...prev, [c.id]: next }));
    onToggleStatus?.(c, checked);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="p-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94446] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="p-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {campaigns.length === 0
              ? 'Aún no tienes campañas. Crea la primera.'
              : 'No hay campañas que coincidan con los filtros.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-transparent">
            <TableHead className="w-12 text-gray-500 dark:text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Campaña</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Fechas</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">Presupuesto</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 text-right">Impresiones</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => {
            const status = displayStatus(c);
            const isActive = status === 'activa';
            const progress = c.budget > 0 ? Math.min(100, (c.spent ?? 0) / c.budget * 100) : 0;
            return (
              <TableRow
                key={c.id}
                className="border-gray-100 dark:border-gray-800"
              >
                <TableCell>
                  {(status === 'activa' || status === 'pausada') && (
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => handleSwitch(c, checked)}
                      aria-label={isActive ? 'Pausar campaña' : 'Activar campaña'}
                      className="data-[state=checked]:bg-[#e94446]"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{c.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[status]} className="capitalize">
                    {STATUS_LABEL[status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(c.start_date)} – {formatDate(c.end_date)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1 min-w-[120px]">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Consumido</span>
                      <span className="font-medium tabular-nums">
                        {formatEur(c.spent ?? 0)} / {formatEur(c.budget)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-100 dark:bg-gray-800 [&>div]:bg-[#e94446]" />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-gray-700 dark:text-gray-300">
                  {formatNumber(c.impressions ?? 0)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Abrir menú"
                      >
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
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`${basePath}/${c.id}/reporte`}>
                          <BarChart2 className="mr-2 h-4 w-4" />
                          Ver reporte
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
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

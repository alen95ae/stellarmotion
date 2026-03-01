'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Invoice } from '@/types/invoices';

export type FilterEstado = 'all' | Invoice['estado'];

interface FacturacionFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterEstado: FilterEstado;
  onFilterEstadoChange: (v: FilterEstado) => void;
  filterBrand: string;
  onFilterBrandChange: (v: string) => void;
  filterMonth: string;
  onFilterMonthChange: (v: string) => void;
  brandOptions: { id: string; name: string }[];
}

export default function FacturacionFilters({
  search,
  onSearchChange,
  filterEstado,
  onFilterEstadoChange,
  filterBrand,
  onFilterBrandChange,
  filterMonth,
  onFilterMonthChange,
  brandOptions,
}: FacturacionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por número o brand..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterEstado} onValueChange={(v) => onFilterEstadoChange(v as FilterEstado)}>
        <SelectTrigger className="w-[180px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="enviada">Enviada</SelectItem>
          <SelectItem value="pagada">Pagada</SelectItem>
          <SelectItem value="vencida">Vencida</SelectItem>
          <SelectItem value="parcial">Parcial</SelectItem>
          <SelectItem value="cancelada">Cancelada</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterBrand} onValueChange={onFilterBrandChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los brands</SelectItem>
          {brandOptions.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="month"
        value={filterMonth}
        onChange={(e) => onFilterMonthChange(e.target.value)}
        className="w-[160px]"
      />
    </div>
  );
}

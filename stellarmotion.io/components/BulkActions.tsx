"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Filter, Monitor } from "lucide-react"

// Constantes para colores de estado
const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-emerald-600 text-white' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-amber-500 text-black' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-600 text-white' },
  MANTENIMIENTO: { label: 'Mantenimiento', className: 'bg-orange-600 text-white' },
  INACTIVO:     { label: 'Inactivo',      className: 'bg-gray-600 text-white' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-neutral-900 text-white' },
} as const

interface BulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  onBulkStatusChange: (status: string) => void
  onExportPDF?: () => void
}

export default function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onExportPDF,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
        {selectedCount} soporte{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {onExportPDF && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            className="h-8 border-blue-300 bg-white hover:bg-blue-50 dark:bg-blue-900/50 dark:border-blue-700 dark:hover:bg-blue-900/70 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            Catálogo PDF
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-blue-300 bg-white hover:bg-blue-50 dark:bg-blue-900/50 dark:border-blue-700 dark:hover:bg-blue-900/70 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Cambiar Estado
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onBulkStatusChange(key)}
                className="cursor-pointer"
              >
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${meta.className}`}>
                  {meta.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="destructive" size="sm" onClick={onBulkDelete} className="h-8 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Eliminar
        </Button>
      </div>
    </div>
  )
}

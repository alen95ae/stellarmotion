"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Filter } from "lucide-react"

// Constantes para colores de estado
const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-emerald-600 text-white' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-amber-500 text-black' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-600 text-white' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-neutral-900 text-white' },
} as const

interface BulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  onBulkStatusChange: (status: string) => void
}

export default function BulkActions({ 
  selectedCount, 
  onBulkDelete, 
  onBulkStatusChange 
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 border-t">
      <span className="text-sm text-gray-600">
        {selectedCount} elemento{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
      </span>
      
      <div className="flex gap-2">
        {/* Cambiar estado */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
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
                <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${meta.className}`}>
                  {meta.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Eliminar */}
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </Button>
      </div>
    </div>
  )
}

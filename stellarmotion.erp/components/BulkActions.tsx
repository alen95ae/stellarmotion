"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Filter } from "lucide-react"

// Constantes para colores de estado
const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-emerald-600 text-white dark:bg-emerald-700' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-amber-500 text-black dark:bg-amber-600' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-600 text-white dark:bg-red-700' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-neutral-900 text-white dark:bg-neutral-700' },
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
    <div className="pt-4 mx-4">
      <div className="p-4 rounded-xl bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-red-800 dark:text-red-400 font-medium">
            <span className="font-semibold">{selectedCount}</span>
            {" "}elemento{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2 flex-wrap items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Cambiar Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onBulkStatusChange(key)}
                    className="cursor-pointer dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:text-foreground"
                  >
                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="border-border text-red-600 hover:bg-red-600/10 hover:text-red-600 dark:border-red-600 dark:text-red-600 dark:hover:bg-red-600/10 dark:hover:border-red-600 dark:hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

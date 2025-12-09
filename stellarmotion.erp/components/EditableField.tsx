"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Constantes para colores de estado
const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-green-100 text-green-800 border-green-200' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-100 text-red-800 border-red-200' },
  MANTENIMIENTO:{ label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  // Estados en minúsculas (compatibilidad)
  disponible:   { label: 'Disponible',    className: 'bg-green-100 text-green-800 border-green-200' },
  reservado:    { label: 'Reservado',     className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ocupado:      { label: 'Ocupado',       className: 'bg-red-100 text-red-800 border-red-200' },
  mantenimiento:{ label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 border-gray-200' },
} as const

interface EditableFieldProps {
  support: any
  field: string
  value: any
  type?: 'text' | 'select' | 'number'
  options?: string[] | null
  isNumeric?: boolean
  className?: string
  title?: string
  onSave: (id: string, field: string, value: any) => Promise<void>
}

export default function EditableField({
  support,
  field,
  value,
  type = 'text',
  options = null,
  isNumeric = false,
  className = '',
  title = '',
  onSave
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState('')

  // Detectar si es un título largo que necesita tooltip
  const isLongTitle = field === 'title' && value && String(value).length > 30
  // Detectar si es un propietario largo que necesita tooltip
  const isLongOwner = field === 'owner' && value && String(value).length > 20
  const displayTitle = isLongTitle ? String(value) : (isLongOwner ? String(value) : title)

  // Campos que no se pueden editar
  const nonEditableFields: string[] = []
  const isNonEditable = nonEditableFields.includes(field)

  const startEditing = () => {
    setIsEditing(true)
    // Para campos numéricos, mostrar el valor actual
    if (['priceMonth', 'widthM', 'heightM'].includes(field) && value) {
      const numericValue = typeof value === 'number' ? value : parseFloat(value)
      setEditingValue(numericValue.toString())
    } else {
      setEditingValue(value?.toString() || '')
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingValue('')
  }

  const saveEdit = async () => {
    let finalValue = editingValue
    
    // Convertir valores numéricos si es necesario
    if (['priceMonth', 'widthM', 'heightM'].includes(field)) {
      finalValue = parseFloat(editingValue) || null
    }

    await onSave(support.id, field, finalValue)
    setIsEditing(false)
    setEditingValue('')
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        {type === 'select' && options ? (
          <Select value={editingValue} onValueChange={setEditingValue}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  <div className="flex items-center gap-2">
                    {field === 'status' ? (
                      <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${STATUS_META[option as keyof typeof STATUS_META]?.className || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_META[option as keyof typeof STATUS_META]?.label || option}
                      </span>
                    ) : (
                      option
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={isNumeric ? "number" : "text"}
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value)
            }}
            className="h-10 text-sm min-w-[120px]"
            placeholder={isNumeric ? "0" : ""}
            step={isNumeric ? "0.01" : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEditing()
            }}
          />
        )}
        <Button size="sm" variant="ghost" onClick={saveEdit} className="h-6 w-6 p-0">
          ✓
        </Button>
        <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
          ✕
        </Button>
      </div>
    )
  }

  const content = (
    <div 
      className={`p-1 rounded min-h-[32px] flex items-center ${className} ${
        isNonEditable || field === 'location'
          ? 'cursor-not-allowed opacity-60' 
          : 'cursor-pointer hover:bg-gray-100'
      }`}
      onClick={isNonEditable || field === 'location' ? undefined : startEditing}
      title={displayTitle}
    >
      {field === 'status' ? (
        (() => {
          // Normalizar el valor del estado
          const normalizedStatus = String(value || '').toLowerCase();
          
          // Mapear estados a colores y etiquetas
          const getStatusConfig = (status: string) => {
            switch (status) {
              case 'disponible':
                return {
                  label: 'Disponible',
                  className: 'bg-green-100 text-green-800 border-green-200'
                };
              case 'reservado':
                return {
                  label: 'Reservado', 
                  className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
              case 'ocupado':
                return {
                  label: 'Ocupado',
                  className: 'bg-red-100 text-red-800 border-red-200'
                };
              case 'mantenimiento':
                return {
                  label: 'Mantenimiento',
                  className: 'bg-gray-100 text-gray-800 border-gray-200'
                };
              default:
                return {
                  label: String(value || 'Desconocido'),
                  className: 'bg-gray-100 text-gray-800 border-gray-200'
                };
            }
          };
          
          const statusConfig = getStatusConfig(normalizedStatus);
          
          return (
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          );
        })()
      ) : field === 'owner' ? (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {value || '—'}
        </Badge>
      ) : field === 'code' ? (
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-gray-800 border border-neutral-200">
          {value || '—'}
        </span>
      ) : type === 'select' && options ? (
        <Badge variant="secondary">{value || '—'}</Badge>
      ) : isNumeric ? (
        <span>{
          typeof value === 'number'
            ? value.toFixed(2)
            : (value ? value.toString() : '—')
        }</span>
      ) : (
        <span className={field === 'title' ? 'truncate block' : ''}>{value || '—'}</span>
      )}
    </div>
  )

  // Si el campo no es editable, envolver con tooltip
  if (isNonEditable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>Este campo no se puede editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Si es un título largo o propietario largo, envolver con tooltip para mostrar el contenido completo
  if (isLongTitle || isLongOwner) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{String(value)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

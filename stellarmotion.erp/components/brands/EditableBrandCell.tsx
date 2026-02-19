"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditableBrandCellProps {
  id: string;
  field: string;
  value: string | undefined | null;
  type?: "text" | "select";
  options?: string[];
  optionLabels?: Record<string, string>;
  className?: string;
  onSave: (id: string, field: string, value: string) => Promise<void>;
  /** Si false, la celda solo muestra el valor; la edición se activa al marcar la casilla de la fila */
  editingEnabled?: boolean;
}

export default function EditableBrandCell({
  id,
  field,
  value,
  type = "text",
  options,
  optionLabels = {},
  className = "",
  onSave,
  editingEnabled = false,
}: EditableBrandCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState("");

  const displayValue = value ?? "—";
  const displayLabel = (v: string) => optionLabels[v] ?? v;

  const startEditing = () => {
    setIsEditing(true);
    setEditingValue(value?.toString() ?? "");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingValue("");
  };

  const saveEdit = async () => {
    const trimmed = editingValue.trim();
    await onSave(id, field, trimmed);
    setIsEditing(false);
    setEditingValue("");
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {type === "select" && (options?.length ?? 0) > 0 ? (
          <Select value={editingValue} onValueChange={setEditingValue}>
            <SelectTrigger className="h-8 text-xs min-w-[100px]">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {options!.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {displayLabel(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="h-8 text-sm min-w-[120px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEditing();
            }}
          />
        )}
        <Button size="sm" variant="ghost" onClick={saveEdit} className="h-6 w-6 p-0 shrink-0">
          ✓
        </Button>
        <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0 shrink-0">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`p-1 rounded min-h-[28px] flex items-center truncate ${editingEnabled ? "cursor-pointer hover:bg-muted/60 dark:hover:bg-[#1e1e1e]/60" : ""} ${className}`}
      onClick={editingEnabled ? startEditing : undefined}
      title={type === "select" ? displayLabel(displayValue as string) : (displayValue as string)}
    >
      {type === "select" && (displayValue as string) in optionLabels ? (
        <span className="truncate">{displayLabel(displayValue as string)}</span>
      ) : (
        <span className="truncate">{displayValue}</span>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Trash2, MapPin, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types/messaging';

function formatLastSeen(iso: string | null | undefined): string {
  if (!iso) return 'Desconectado';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'En línea';
  if (diffMins < 60) return `Visto hace ${diffMins} min`;
  if (diffHours < 24) return `Visto hace ${diffHours} h`;
  if (diffDays === 1) return 'Visto ayer';
  if (diffDays < 7) return `Visto hace ${diffDays} días`;
  return `Visto ${d.toLocaleDateString('es-ES')}`;
}

export interface ChatHeaderProps {
  conversation: Conversation;
  onDelete: () => void;
  /** Brand: mostrar datos del soporte (ciudad, precio) bajo el nombre del owner */
  showSoporteInfo?: boolean;
}

export function ChatHeader({ conversation, onDelete, showSoporteInfo }: ChatHeaderProps) {
  const status =
    conversation.participant.status === 'online'
      ? 'En línea'
      : formatLastSeen(conversation.participant.lastSeenAt);
  const soporte = showSoporteInfo ? conversation.soporte : null;

  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={conversation.participant.avatar ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-sm font-medium">
            {conversation.participant.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {conversation.participant.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{status}</p>
          {soporte && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
              {soporte.title && (
                <span className="truncate" title={soporte.title}>
                  {soporte.title}
                </span>
              )}
              {soporte.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {soporte.city}
                </span>
              )}
              {soporte.pricePerMonth != null && soporte.pricePerMonth > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 shrink-0" />
                  {soporte.pricePerMonth.toLocaleString('es-ES')} / mes
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
        title="Eliminar conversación"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </header>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Conversation } from '@/types/messaging';

const MAX_PREVIEW_LENGTH = 45;

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `${diffDays} días`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
  return `${Math.floor(diffDays / 365)} años`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + '…';
}

export interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  /** Si true, muestra soporte como título principal y participant como subtítulo (brand) */
  showSoporteFirst?: boolean;
}

export function ConversationItem({ conversation, isActive, onClick, showSoporteFirst }: ConversationItemProps) {
  const preview = conversation.lastMessage
    ? truncate(conversation.lastMessage.content, MAX_PREVIEW_LENGTH)
    : 'Sin mensajes';
  const time = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.createdAt)
    : '';
  const title = showSoporteFirst && conversation.soporte?.title
    ? conversation.soporte.title
    : conversation.participant.name;
  const subtitle = showSoporteFirst && conversation.soporte?.title
    ? conversation.participant.name
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-lg transition-colors border-l-2',
        'hover:bg-gray-100 dark:hover:bg-gray-800/80',
        isActive
          ? 'bg-gray-100 dark:bg-gray-800 border-l-[#e94446]'
          : 'border-l-transparent bg-transparent'
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={conversation.participant.avatar ?? undefined} alt="" />
        <AvatarFallback className="bg-muted text-sm font-medium">
          {conversation.participant.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </span>
          {time && (
            <span className="text-xs text-muted-foreground shrink-0">
              {time}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {preview}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e94446] text-[10px] font-medium text-white">
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

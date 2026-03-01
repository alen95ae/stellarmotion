'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types/messaging';

export interface ConversationsListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  emptyMessage?: string;
  loading?: boolean;
  /** Brand: mostrar nombre soporte + owner en cada ítem */
  showSoporteFirst?: boolean;
}

export function ConversationsList({
  conversations,
  activeId,
  onSelectConversation,
  emptyMessage = 'Aún no tienes mensajes',
  loading = false,
  showSoporteFirst = false,
}: ConversationsListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        (c.lastMessage?.content ?? '').toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="shrink-0 p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          Todas las conversaciones
        </p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-0.5">
          {loading ? (
            <div className="py-8 px-4 text-center text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 px-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onClick={() => onSelectConversation(conv.id)}
                showSoporteFirst={showSoporteFirst}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

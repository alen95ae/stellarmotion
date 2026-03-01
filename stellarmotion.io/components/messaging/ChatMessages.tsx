'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types/messaging';
import type { Conversation } from '@/types/messaging';

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export interface ChatMessagesProps {
  conversation: Conversation;
  /** contacto_id del usuario actual (para saber si el mensaje es propio) */
  currentContactoId: string;
  className?: string;
}

export function ChatMessages({ conversation, currentContactoId, className }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;
    const wasAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
    const newLength = conversation.messages.length;
    if (newLength > prevLengthRef.current && wasAtBottom) {
      viewport.scrollTop = viewport.scrollHeight;
    }
    prevLengthRef.current = newLength;
  }, [conversation.messages.length]);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [conversation.id]);

  const messagesWithDayGroups = React.useMemo(() => {
    const groups: { dayLabel: string; messages: Message[] }[] = [];
    let currentDay = '';
    for (const msg of conversation.messages) {
      const dayLabel = formatDayLabel(msg.createdAt);
      if (dayLabel !== currentDay) {
        currentDay = dayLabel;
        groups.push({ dayLabel, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [conversation.messages]);

  return (
    <div ref={scrollRef} className={cn('flex-1 min-h-0 flex flex-col', className)}>
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-4">
        {messagesWithDayGroups.map((group) => (
          <div key={group.dayLabel}>
            <div className="flex justify-center my-3">
              <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {group.dayLabel}
              </span>
            </div>
            <div className="space-y-3">
              {group.messages.map((msg) => {
                const isOwn = msg.senderId === currentContactoId;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={conversation.participant.avatar ?? undefined} alt="" />
                        <AvatarFallback className="text-xs">
                          {conversation.participant.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                        isOwn
                          ? 'bg-[#e94446] text-white ml-auto'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1',
                          isOwn ? 'text-white/80' : 'text-muted-foreground'
                        )}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
    </div>
  );
}

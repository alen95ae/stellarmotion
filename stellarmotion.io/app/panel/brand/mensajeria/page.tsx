'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Compass } from 'lucide-react';
import { ConversationsList } from '@/components/messaging/ConversationsList';
import { ChatHeader } from '@/components/messaging/ChatHeader';
import { ChatMessages } from '@/components/messaging/ChatMessages';
import { ChatInput } from '@/components/messaging/ChatInput';
import { DeleteConversationModal } from '@/components/messaging/DeleteConversationModal';
import { Button } from '@/components/ui/button';
import type { Conversation, Message } from '@/types/messaging';

const CONVERSATIONS_API = '/api/conversations';
const CONVERSATION_WITH_SOPORTE = (id: string) => `/api/conversations/${id}?include_soporte=1`;

export default function BrandMensajeriaPage() {
  const { user, loading: authLoading } = useAuth();
  const currentContactoId = user?.contacto_id ?? '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConv, setLoadingConv] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setListError(null);
    const res = await fetch(`${CONVERSATIONS_API}?include_soporte=1`, { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.details || data?.error || `Error ${res.status} al cargar conversaciones`;
      setListError(msg);
      setConversations([]);
      return;
    }
    setConversations(Array.isArray(data.conversations) ? data.conversations : []);
  }, []);

  useEffect(() => {
    if (!currentContactoId) {
      setLoadingList(false);
      setConversations([]);
      setListError(null);
      return;
    }
    setLoadingList(true);
    setListError(null);
    fetchConversations().finally(() => setLoadingList(false));
  }, [currentContactoId, fetchConversations]);

  const activeConversation = activeId
    ? conversations.find((c) => c.id === activeId) ?? null
    : null;

  const selectConversation = useCallback(async (id: string) => {
    if (activeId === id) return;
    setActiveId(id);
    setLoadingConv(true);
    try {
      const res = await fetch(CONVERSATION_WITH_SOPORTE(id), { credentials: 'include' });
      if (!res.ok) {
        setActiveId(null);
        return;
      }
      const data = await res.json();
      const conv = data.conversation as Conversation;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx === -1) return [...prev, conv];
        const next = [...prev];
        next[idx] = { ...next[idx], messages: conv.messages, unreadCount: 0, soporte: conv.soporte ?? next[idx].soporte };
        return next;
      });
    } finally {
      setLoadingConv(false);
    }
  }, [activeId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeId || !currentContactoId) return;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversation_id: activeId, content }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const newMsg = data.message as Message;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            lastMessage: {
              content: newMsg.content,
              createdAt: newMsg.createdAt,
              fromCurrentUser: true,
            },
            messages: [...c.messages, newMsg],
          };
        })
      );
    },
    [activeId, currentContactoId]
  );

  const deleteConversation = useCallback(async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setActiveId((current) => (current === id ? null : current));
        setDeleteModalOpen(false);
      }
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const handleDeleteClick = useCallback(() => setDeleteModalOpen(true), []);
  const handleDeleteConfirm = useCallback(() => {
    if (activeId) deleteConversation(activeId);
  }, [activeId, deleteConversation]);

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!currentContactoId) {
    return (
      <div className="space-y-4 -mt-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mensajería</h1>
          <p className="mt-0.5 text-xs text-gray-600 leading-tight">
            Conversaciones con propietarios de soportes
          </p>
        </div>
        <div className="flex h-[calc(100vh-12rem)] min-h-[280px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <p className="text-sm text-muted-foreground">
            Tu cuenta no tiene un contacto asociado. Contacta al administrador para usar la mensajería.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 -mt-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mensajería</h1>
        <p className="mt-0.5 text-xs text-gray-600 leading-tight">
          Conversaciones con propietarios de soportes
        </p>
      </div>

      <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden h-[calc(100vh-12rem)] min-h-[420px]">
        <aside className="w-[320px] shrink-0 flex flex-col min-h-0">
          {listError && (
            <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-b border-gray-200 dark:border-gray-800">
              {listError}
            </div>
          )}
          <ConversationsList
            conversations={conversations}
            activeId={activeId}
            onSelectConversation={selectConversation}
            emptyMessage="Aún no has iniciado conversaciones"
            loading={loadingList}
            showSoporteFirst
          />
        </aside>

        <section className="flex-1 flex flex-col min-w-0 min-h-0">
          {activeConversation ? (
            <>
              <ChatHeader
                conversation={activeConversation}
                onDelete={handleDeleteClick}
                showSoporteInfo
              />
              {loadingConv ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Cargando...
                </div>
              ) : (
                <ChatMessages
                  conversation={activeConversation}
                  currentContactoId={currentContactoId}
                />
              )}
              <ChatInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Selecciona una conversación para comenzar
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  O inicia una nueva desde un soporte en el marketplace
                </p>
                <Link href="/marketplace" prefetch={false}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Compass className="h-4 w-4" />
                    Explorar soportes
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <DeleteConversationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        conversationName={activeConversation?.participant.name ?? ''}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}

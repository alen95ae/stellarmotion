/**
 * Helpers cliente para mensajería. Mismas APIs para owner y brand.
 * contacto_id siempre desde sesión (backend); nunca enviar desde frontend.
 */

import type { Conversation, Message } from '@/types/messaging';

const base = '';

export interface FetchConversationsOptions {
  includeSoporte?: boolean;
}

export async function fetchConversations(
  options?: FetchConversationsOptions
): Promise<{ conversations: Conversation[]; error?: string }> {
  const url = options?.includeSoporte ? `${base}/api/conversations?include_soporte=1` : `${base}/api/conversations`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { conversations: [], error: data?.details || data?.error || `Error ${res.status}` };
  }
  return { conversations: Array.isArray(data.conversations) ? data.conversations : [] };
}

export async function fetchConversation(
  id: string,
  options?: FetchConversationsOptions
): Promise<{ conversation: Conversation | null; error?: string }> {
  const url = options?.includeSoporte ? `${base}/api/conversations/${id}?include_soporte=1` : `${base}/api/conversations/${id}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { conversation: null, error: data?.details || data?.error };
  }
  return { conversation: data.conversation ?? null };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ message: Message | null; error?: string }> {
  const res = await fetch(`${base}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ conversation_id: conversationId, content }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { message: null, error: data?.error };
  }
  return { message: data.message ?? null };
}

export async function deleteConversation(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${base}/api/conversations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data?.error };
  }
  return { success: true };
}

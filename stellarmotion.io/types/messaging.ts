export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
}

export interface SoporteSummary {
  id: string;
  title: string;
  city?: string;
  pricePerMonth?: number;
}

export interface Conversation {
  id: string;
  soporte_id?: string | null;
  solicitud_id?: string | null;
  updated_at?: string;
  participant: {
    id: string;
    name: string;
    avatar?: string | null;
    status?: 'online' | 'offline';
    lastSeenAt?: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    fromCurrentUser: boolean;
  } | null;
  unreadCount: number;
  messages: Message[];
  /** Present when fetched with ?include_soporte=1 (brand context) */
  soporte?: SoporteSummary | null;
}

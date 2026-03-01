import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';
import { ERP_ENDPOINTS } from '@/lib/api-config';

export const runtime = 'nodejs';

/**
 * GET /api/conversations/[id]
 * Obtiene una conversación con mensajes. Solo si el usuario es participante.
 * Actualiza last_read_at. Query: include_soporte=1 → añade datos del soporte (brand).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContactoFromSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!hasContactoId(session)) {
    return NextResponse.json(
      { error: 'Tu cuenta no tiene un contacto asociado (usuarios.contacto_id)' },
      { status: 403 }
    );
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  const { data: part, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('contacto_id', session.contactoId)
    .maybeSingle();

  if (partError || !part) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, soporte_id, solicitud_id, created_at, updated_at')
    .eq('id', conversationId)
    .single();

  if (convError || !conv) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  const now = new Date().toISOString();
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: now })
    .eq('conversation_id', conversationId)
    .eq('contacto_id', session.contactoId);

  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('contacto_id')
    .eq('conversation_id', conversationId);

  const otherContactoId = (participants || []).find((p) => p.contacto_id !== session.contactoId)?.contacto_id ?? '';

  const { data: contacto } = await supabase
    .from('contactos')
    .select('id, nombre, razon_social')
    .eq('id', otherContactoId)
    .maybeSingle();

  const participantName = (contacto?.nombre || contacto?.razon_social || 'Contacto').trim();

  const { data: msgs, error: msgsError } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_contacto_id, content, type, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgsError) {
    console.error('[conversations/:id] messages error:', msgsError);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }

  const conversation = {
    id: conv.id,
    soporte_id: conv.soporte_id,
    solicitud_id: conv.solicitud_id,
    updated_at: conv.updated_at,
    participant: {
      id: otherContactoId,
      name: participantName,
      avatar: null,
      status: 'offline',
      lastSeenAt: null,
    },
    lastMessage: null as { content: string; createdAt: string; fromCurrentUser: boolean } | null,
    unreadCount: 0,
    messages: (msgs || []).map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_contacto_id,
      content: m.content,
      createdAt: m.created_at,
      type: m.type ?? 'text',
    })),
  };

  const lastMsg = (msgs || []).length ? (msgs as any[])[(msgs as any[]).length - 1] : null;
  if (lastMsg) {
    conversation.lastMessage = {
      content: lastMsg.content,
      createdAt: lastMsg.created_at,
      fromCurrentUser: lastMsg.sender_contacto_id === session.contactoId,
    };
  }

  const includeSoporte = request.nextUrl.searchParams.get('include_soporte') === '1';
  if (includeSoporte && conv.soporte_id) {
    try {
      const res = await fetch(ERP_ENDPOINTS.support(conv.soporte_id));
      if (res.ok) {
        const data = await res.json();
        (conversation as { soporte?: { id: string; title: string; city?: string; pricePerMonth?: number } }).soporte = {
          id: conv.soporte_id,
          title: data.title || data.titulo || data.nombre || 'Soporte',
          city: data.city || data.ciudad,
          pricePerMonth: data.pricePerMonth ?? data.precio_mes ?? data.precio_mensual,
        };
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ conversation });
}

/**
 * DELETE /api/conversations/[id]
 * Elimina la conversación. Solo si el usuario es participante.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContactoFromSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!hasContactoId(session)) {
    return NextResponse.json(
      { error: 'Tu cuenta no tiene un contacto asociado (usuarios.contacto_id)' },
      { status: 403 }
    );
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  const { data: part } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('contacto_id', session.contactoId)
    .maybeSingle();

  if (!part) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  const { error: delError } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (delError) {
    console.error('[conversations/:id] delete error:', delError);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

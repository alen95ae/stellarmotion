import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';

export const runtime = 'nodejs';

/**
 * POST /api/messages
 * Body: { conversation_id: string, content: string, type?: string }
 * Inserta mensaje con sender_contacto_id = contacto del usuario. Actualiza conversations.updated_at.
 */
export async function POST(request: NextRequest) {
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

  let body: { conversation_id?: string; content?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const conversationId = body?.conversation_id?.trim();
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  if (!conversationId || !content) {
    return NextResponse.json({ error: 'conversation_id y content son requeridos' }, { status: 400 });
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

  const type = (body.type && body.type.trim()) || 'text';
  const { data: newMsg, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_contacto_id: session.contactoId,
      content,
      type,
    })
    .select('id, conversation_id, sender_contacto_id, content, type, created_at')
    .single();

  if (msgError || !newMsg) {
    console.error('[messages] insert error:', msgError);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }

  const now = new Date().toISOString();
  await supabase
    .from('conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);

  return NextResponse.json({
    success: true,
    message: {
      id: newMsg.id,
      conversationId: newMsg.conversation_id,
      senderId: newMsg.sender_contacto_id,
      content: newMsg.content,
      type: newMsg.type ?? 'text',
      createdAt: newMsg.created_at,
    },
  });
}

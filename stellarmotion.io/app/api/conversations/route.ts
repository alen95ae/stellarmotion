import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';
import { ERP_ENDPOINTS } from '@/lib/api-config';

export const runtime = 'nodejs';

/**
 * GET /api/conversations
 * Lista conversaciones donde el contacto del usuario es participante. Orden: updated_at desc.
 * Query: include_soporte=1 → enriquece con datos de soporte desde ERP (para brand).
 */
export async function GET(request: NextRequest) {
  try {
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

    const supabase = getAdminSupabase();

    const { data: myParticipants, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('contacto_id', session.contactoId);

    if (partError) {
      console.error('[conversations] participants error:', partError);
      return NextResponse.json(
        { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? partError.message : undefined },
        { status: 500 }
      );
    }

    if (!myParticipants?.length) {
      return NextResponse.json({ conversations: [] });
    }

    const convIds = myParticipants.map((p) => p.conversation_id);
    const lastReadMap = new Map(myParticipants.map((p) => [p.conversation_id, p.last_read_at]));

    const { data: convs, error: convError } = await supabase
      .from('conversations')
      .select('id, soporte_id, solicitud_id, created_at, updated_at')
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (convError) {
      console.error('[conversations] conversations error:', convError);
      return NextResponse.json(
        { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? convError.message : undefined },
        { status: 500 }
      );
    }

    if (!convs?.length) {
      return NextResponse.json({ conversations: [] });
    }

    const { data: allParts, error: allPartsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, contacto_id')
      .in('conversation_id', convIds);

    if (allPartsError) {
      console.error('[conversations] allParts error:', allPartsError);
      return NextResponse.json(
        { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? allPartsError.message : undefined },
        { status: 500 }
      );
    }

    const otherContactoIdByConv = new Map<string, string>();
    for (const p of allParts || []) {
      if (p.contacto_id !== session.contactoId) {
        otherContactoIdByConv.set(p.conversation_id, p.contacto_id);
      }
    }

    const otherIds = [...new Set(otherContactoIdByConv.values())];
    let nameByContactoId = new Map<string, string>();
    if (otherIds.length > 0) {
      const { data: contactos, error: contactosError } = await supabase
        .from('contactos')
        .select('id, nombre, razon_social')
        .in('id', otherIds);

      if (contactosError) {
        console.error('[conversations] contactos error:', contactosError);
        return NextResponse.json(
          { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? contactosError.message : undefined },
          { status: 500 }
        );
      }
      nameByContactoId = new Map(
        (contactos || []).map((c) => [c.id, (c.nombre || c.razon_social || 'Contacto').trim()])
      );
    }

    let allMsgs: { conversation_id: string; content: string; created_at: string; sender_contacto_id: string }[] = [];
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id, conversation_id, content, created_at, sender_contacto_id')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('[conversations] messages error:', messagesError);
      return NextResponse.json(
        { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? messagesError.message : undefined },
        { status: 500 }
      );
    }
    allMsgs = (messagesData || []) as typeof allMsgs;

    const lastMessageByConv = new Map<string, { content: string; createdAt: string; senderContactoId: string }>();
    for (const m of allMsgs) {
      if (!lastMessageByConv.has(m.conversation_id)) {
        lastMessageByConv.set(m.conversation_id, {
          content: m.content,
          createdAt: m.created_at,
          senderContactoId: m.sender_contacto_id,
        });
      }
    }

    const conversations = convs.map((c) => {
      const lastReadAt = lastReadMap.get(c.id) ?? null;
      const lastMsg = lastMessageByConv.get(c.id);
      const messagesInConv = allMsgs.filter((m) => m.conversation_id === c.id);
      const unreadCount = lastReadAt
        ? messagesInConv.filter((m) => new Date(m.created_at) > new Date(lastReadAt)).length
        : messagesInConv.length;

      const otherId = otherContactoIdByConv.get(c.id) ?? '';
      const name = nameByContactoId.get(otherId) ?? 'Contacto';

      return {
        id: c.id,
        soporte_id: c.soporte_id,
        solicitud_id: c.solicitud_id,
        updated_at: c.updated_at,
        participant: {
          id: otherId,
          name,
          avatar: null,
          status: 'offline',
          lastSeenAt: null,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              fromCurrentUser: lastMsg.senderContactoId === session.contactoId,
            }
          : null,
        unreadCount,
        messages: [],
        soporte: undefined,
      };
    });

    const includeSoporte = request.nextUrl.searchParams.get('include_soporte') === '1';
    if (includeSoporte) {
      const soporteIds = [...new Set(convs.map((c) => c.soporte_id).filter(Boolean))] as string[];
      const soporteMap = new Map<string, { id: string; title: string; city?: string; pricePerMonth?: number }>();
      await Promise.all(
        soporteIds.map(async (id) => {
          try {
            const res = await fetch(ERP_ENDPOINTS.support(id));
            if (!res.ok) return;
            const data = await res.json();
            soporteMap.set(id, {
              id,
              title: data.title || data.titulo || data.nombre || 'Soporte',
              city: data.city || data.ciudad,
              pricePerMonth: data.pricePerMonth ?? data.precio_mes ?? data.precio_mensual,
            });
          } catch {
            // ignore
          }
        })
      );
      for (let i = 0; i < conversations.length; i++) {
        const c = convs[i];
        if (c.soporte_id && soporteMap.has(c.soporte_id)) {
          conversations[i] = { ...conversations[i], soporte: soporteMap.get(c.soporte_id)! };
        }
      }
    }

    return NextResponse.json({ conversations });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[conversations] GET exception:', err);
    return NextResponse.json(
      { error: 'Error al cargar conversaciones', details: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Body: { other_contacto_id: string, soporte_id?: string, solicitud_id?: string }
 * Encuentra conversación existente entre los dos contactos (y mismo soporte/solicitud si se pasan) o crea una nueva.
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

  let body: { other_contacto_id: string; soporte_id?: string; solicitud_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const otherContactoId = body?.other_contacto_id?.trim();
  if (!otherContactoId) {
    return NextResponse.json({ error: 'other_contacto_id es requerido' }, { status: 400 });
  }

  if (otherContactoId === session.contactoId) {
    return NextResponse.json({ error: 'No puedes crear conversación contigo mismo' }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const soporteId = body.soporte_id ?? null;
  const solicitudId = body.solicitud_id ?? null;

  const myParticipations = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('contacto_id', session.contactoId);

  const myConvIds = (myParticipations.data || []).map((p) => p.conversation_id);
  if (myConvIds.length === 0) {
    return createNewConversation(supabase, session.contactoId, otherContactoId, soporteId, solicitudId);
  }

  const convsWithSoporteSolicitud = await supabase
    .from('conversations')
    .select('id, soporte_id, solicitud_id')
    .in('id', myConvIds);

  for (const c of convsWithSoporteSolicitud.data || []) {
    if ((c.soporte_id ?? null) !== soporteId || (c.solicitud_id ?? null) !== solicitudId) continue;
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('contacto_id')
      .eq('conversation_id', c.id);
    const hasOther = (parts || []).some((p) => p.contacto_id === otherContactoId);
    if (hasOther) {
      return NextResponse.json({ conversation_id: c.id, created: false });
    }
  }

  return createNewConversation(supabase, session.contactoId, otherContactoId, soporteId, solicitudId);
}

async function createNewConversation(
  supabase: ReturnType<typeof getAdminSupabase>,
  contactoIdA: string,
  contactoIdB: string,
  soporteId: string | null,
  solicitudId: string | null
) {
  const now = new Date().toISOString();
  const { data: newConv, error: insErr } = await supabase
    .from('conversations')
    .insert({
      soporte_id: soporteId,
      solicitud_id: solicitudId,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (insErr || !newConv) {
    console.error('[conversations] insert error:', insErr);
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 });
  }

  const { error: partErr } = await supabase.from('conversation_participants').insert([
    { conversation_id: newConv.id, contacto_id: contactoIdA, joined_at: now },
    { conversation_id: newConv.id, contacto_id: contactoIdB, joined_at: now },
  ]);

  if (partErr) {
    console.error('[conversations] participants insert error:', partErr);
    await supabase.from('conversations').delete().eq('id', newConv.id);
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 });
  }

  return NextResponse.json({ conversation_id: newConv.id, created: true });
}

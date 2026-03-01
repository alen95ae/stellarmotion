-- Ejemplo de políticas RLS para mensajería (Supabase).
-- Ejecutar en el SQL Editor de Supabase si usas RLS.
-- La app actual usa SERVICE_ROLE_KEY (bypass RLS); estas políticas aplican si usas cliente anon/authenticated.
-- NOTA: auth.uid() en Supabase es el id de auth.users. Si tu JWT usa otro esquema, adapta (ej. custom claim con contacto_id).
-- Índices recomendados (si no existen): idx_messages_conversation (conversation_id, created_at), idx_messages_sender (sender_contacto_id);
-- conversation_participants: CREATE INDEX idx_cp_contacto ON conversation_participants(contacto_id); CREATE UNIQUE INDEX idx_cp_conv_contacto ON conversation_participants(conversation_id, contacto_id);

-- 1) conversations: solo participantes pueden leer/actualizar; insert/delete según tu lógica.
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_participants"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "conversations_update_participants"
  ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
    )
  );

-- 2) conversation_participants: solo ver/filtrar por propio contacto.
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversation_participants_select_own"
  ON public.conversation_participants FOR SELECT
  USING (
    contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
  );

-- 3) messages: solo participantes de la conversación pueden leer; solo el sender puede insertar con su contacto_id.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "messages_insert_own_contacto"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.contacto_id = (SELECT contacto_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1)
    )
  );

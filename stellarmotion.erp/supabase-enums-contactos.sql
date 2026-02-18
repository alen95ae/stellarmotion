-- Ejecutar en Supabase antes de crear la tabla contactos si no existen los tipos.
-- La tabla contactos la creas con el SQL que tienes (create table public.contactos ...).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_lifecycle_enum') THEN
    CREATE TYPE public.crm_lifecycle_enum AS ENUM ('lead', 'contact', 'customer', 'opportunity');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_source_enum') THEN
    CREATE TYPE public.crm_source_enum AS ENUM ('scraping', 'manual', 'web', 'import', 'other');
  END IF;
END
$$;

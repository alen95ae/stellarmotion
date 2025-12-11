// Helper functions for role management
// These functions interact directly with Supabase (NO ERP dependency)

import { getAdminSupabase } from '@/lib/supabase/admin';

export interface Role {
  id: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Get role by ID from Supabase
 * WEB → Supabase directo (sin ERP)
 */
export async function getRoleById(rol_id: string): Promise<Role | null> {
  try {
    const supabase = getAdminSupabase();
    
    const { data, error } = await supabase
      .from('roles')
      .select('id, nombre, descripcion')
      .eq('id', rol_id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [getRoleById] Error:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('❌ [getRoleById] Error fatal:', error);
    return null;
  }
}

/**
 * Get role by name from Supabase
 * WEB → Supabase directo (sin ERP)
 */
export async function getRoleByName(nombre: string): Promise<Role | null> {
  try {
    const supabase = getAdminSupabase();
    
    const { data, error } = await supabase
      .from('roles')
      .select('id, nombre, descripcion')
      .eq('nombre', nombre)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [getRoleByName] Error:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('❌ [getRoleByName] Error fatal:', error);
    return null;
  }
}


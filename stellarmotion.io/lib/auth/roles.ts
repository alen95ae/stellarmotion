// Helper functions for role management
// These functions interact with the ERP to get role information

const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000';

export interface Role {
  id: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Get role by ID from ERP
 * This is a proxy function that calls the ERP backend
 */
export async function getRoleById(rol_id: string): Promise<Role | null> {
  try {
    const response = await fetch(`${ERP_BASE_URL}/api/roles/${rol_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting role by ID:', error);
    return null;
  }
}

/**
 * Get role by name from ERP
 * This is a proxy function that calls the ERP backend
 */
export async function getRoleByName(nombre: string): Promise<Role | null> {
  try {
    const response = await fetch(`${ERP_BASE_URL}/api/roles?nombre=${encodeURIComponent(nombre)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // If it's an array, return the first match
    if (Array.isArray(data)) {
      return data[0] || null;
    }
    return data;
  } catch (error) {
    console.error('Error getting role by name:', error);
    return null;
  }
}


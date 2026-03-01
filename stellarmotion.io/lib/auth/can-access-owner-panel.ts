const OWNER_ALLOWED_ROLES = new Set(['owner', 'admin', 'seller']);

export function canAccessOwnerPanel(role?: string | null): boolean {
  if (!role) return false;
  return OWNER_ALLOWED_ROLES.has(role.toLowerCase().trim());
}

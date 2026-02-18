"use server";

import { revalidatePath } from "next/cache";
import { promoteLeadToOwner as promoteLeadToOwnerLib } from "@/lib/contactos-unified";

export async function promoteLeadToOwner(contactId: string): Promise<{ success: boolean; error?: string }> {
  if (!contactId?.trim()) {
    return { success: false, error: "ID de owner requerido" };
  }
  const ok = await promoteLeadToOwnerLib(contactId.trim());
  if (!ok) {
    return { success: false, error: "No se pudo promocionar el lead" };
  }
  revalidatePath("/panel/owners");
  revalidatePath("/panel/owners/leads");
  return { success: true };
}

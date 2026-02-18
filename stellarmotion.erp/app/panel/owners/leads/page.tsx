"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** La sección Leads se unificó en Owners. Redirigir a la lista unificada. */
export default function OwnersLeadsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/panel/owners");
  }, [router]);
  return (
    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
      Redirigiendo a Owners...
    </div>
  );
}

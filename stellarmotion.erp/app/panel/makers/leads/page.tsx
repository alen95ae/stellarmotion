"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirigir a la lista de Makers. */
export default function MakersLeadsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/panel/makers");
  }, [router]);
  return (
    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
      Redirigiendo a Makers...
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from "next/navigation";

export function useQuerySync(pathname = "/buscar-un-espacio") {
  const router = useRouter();
  const params = useSearchParams();
  
  return (patch: Record<string, string | number | null | undefined>) => {
    const q = new URLSearchParams(params.toString());
    
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "") {
        q.delete(k);
      } else {
        q.set(k, String(v));
      }
    });
    
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };
}

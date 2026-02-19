"use client";

import React, { createContext, useContext } from "react";

type PermisosContextValue = {
  loading: boolean;
  puedeEditar: (modulo: string) => boolean;
  puedeEliminar: (modulo: string) => boolean;
  esAdmin: (modulo: string) => boolean;
  tieneFuncionTecnica: (funcion: string) => boolean;
  permisos: Record<string, unknown>;
};

const stub: PermisosContextValue = {
  loading: false,
  puedeEditar: () => true,
  puedeEliminar: () => true,
  esAdmin: () => true,
  tieneFuncionTecnica: () => true,
  permisos: {},
};

const PermisosContext = createContext<PermisosContextValue>(stub);

export function PermisosProvider({ children }: { children: React.ReactNode }) {
  return (
    <PermisosContext.Provider value={stub}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisosContext() {
  const ctx = useContext(PermisosContext);
  return ctx ?? stub;
}

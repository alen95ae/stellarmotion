export const CATEGORY_ICON_MAP: Record<string, string> = {
  valla: '/icons/vallas.svg',
  vallas: '/icons/vallas.svg',
  pantalla: '/icons/pantallas.svg',
  pantallas: '/icons/pantallas.svg',
  led: '/icons/pantallas.svg',
  mural: '/icons/murales.svg',
  murales: '/icons/murales.svg',
  mupi: '/icons/mupis.svg',
  mupis: '/icons/mupis.svg',
  parada: '/icons/parada-bus.svg',
  paradas: '/icons/parada-bus.svg',
  'parada-bus': '/icons/parada-bus.svg',
  parada_bus: '/icons/parada-bus.svg',
  bus: '/icons/parada-bus.svg',
  display: '/icons/displays.svg',
  displays: '/icons/displays.svg',
  letrero: '/icons/letreros.svg',
  letreros: '/icons/letreros.svg',
  cartelera: '/icons/carteleras.svg',
  carteleras: '/icons/carteleras.svg',
};

export const getCategoryIconPath = (iconKey: string): string => {
  const key = iconKey?.toLowerCase?.() ?? '';
  return CATEGORY_ICON_MAP[key] || '/icons/vallas.svg';
};

export const CATEGORIES = [
  { slug: "vallas",     label: "Vallas",         iconKey: "valla" },
  { slug: "pantallas",  label: "Pantallas",      iconKey: "led" },
  { slug: "murales",    label: "Murales",        iconKey: "mural" },
  { slug: "mupis",      label: "Mupis",          iconKey: "mupi" },
  { slug: "paradas",    label: "Paradas de bus", iconKey: "parada" },
  { slug: "displays",   label: "Displays",       iconKey: "display" },
  { slug: "letreros",   label: "Letreros",       iconKey: "letrero" },
  { slug: "carteleras", label: "Carteleras",     iconKey: "cartelera" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  valla: "/icons/valla.svg",
  mupi: "/icons/mupi.svg",
  led: "/icons/led.svg",
  cartelera: "/icons/valla.svg",
  mural: "/icons/default.svg",
  default: "/icons/default.svg",
};

export const FEATURE_ICONS = {
  dimension: "/icons/dimension.svg",
  impressions: "/icons/eye.svg",
  city: "/icons/city.svg",
  country: "/icons/globe.svg",
  type: "/icons/type.svg",          // reemplaza icono rojo
  lighting: "/icons/lightbulb.svg", // bombilla
};

// Mapeo de categorías del carrusel a slugs de la base de datos
export const CATEGORY_MAPPING = {
  valla: "valla",
  led: "led",
  mupi: "mupi",
  display: "display",
  parada: "parada",
  letrero: "letrero",
  cartelera: "cartelera",
  mural: "mural",
} as const;

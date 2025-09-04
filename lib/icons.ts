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
  type: "/icons/type.svg",
  lighting: "/icons/lightbulb.svg",
};

// Mapeo de categorías del carrusel a slugs de la base de datos
export const CATEGORY_MAPPING: Record<string, string> = {
  valla: "valla",
  pantalla: "led",
  mupis: "mupi",
  displays: "led",
  "parada-bus": "mupi",
  letreros: "valla",
  carteleras: "cartelera",
  murales: "mural",
};

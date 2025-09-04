export type Product = {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;        // "10×4 m"
  dailyImpressions: number;  // 65000
  type: string;              // "Bipolar" | "Digital" | ...
  lighting: boolean;
  tags: string[];
  images: string[];          // URLs públicas
  coords: { lat: number; lng: number };
  pricePerMonth: number;     // p.ej. USD
  printingCost: number;      // costo fijo por reserva (impresión lona)
  rating?: number;
  reviewsCount?: number;
  shortDescription: string;
  description: string;
};

export type ReservationRequest = {
  productId: string;
  start: string;
  end: string;
  includePrinting: boolean;
};

export type ReservationResponse = {
  ok: boolean;
  reservationId: string;
};

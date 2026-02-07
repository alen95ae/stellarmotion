import type { Metadata } from "next";
import PreciosClient from "./PreciosClient";

export const metadata: Metadata = {
  title: "Precios | Stellarmotion",
  description:
    "Planes para propietarios, marcas y agencias en el marketplace publicitario Stellarmotion. Empieza gratis y escala con herramientas profesionales.",
  keywords:
    "precios Stellarmotion, planes propietarios, planes agencias, marketplace publicitario, OOH, DOOH",
  openGraph: {
    title: "Precios | Stellarmotion",
    description:
      "Planes para propietarios, marcas y agencias en el marketplace publicitario Stellarmotion. Empieza gratis y escala con herramientas profesionales.",
    url: "/precios",
    type: "website",
  },
  alternates: {
    canonical: "/precios",
  },
};

export default function PreciosPage() {
  return <PreciosClient />;
}

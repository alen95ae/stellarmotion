import type { Metadata } from "next";
import InstalacionSoportesClient from "./InstalacionSoportesClient";

export const metadata: Metadata = {
  title:
    "Instalación de soportes publicitarios | Monetiza tu muro o terreno – Stellarmotion",
  description:
    "Instala un soporte publicitario y genera ingresos recurrentes. Gestionamos permisos, ingeniería e instalación y lo monetizamos en el Marketplace. Simula rentabilidad y solicita propuesta.",
  keywords:
    "instalación de vallas publicitarias, soporte publicitario, monetizar muro, publicidad exterior, OOH, DOOH, inversión en vallas",
  openGraph: {
    title:
      "Instalación de soportes publicitarios | Monetiza tu muro o terreno – Stellarmotion",
    description:
      "Instala un soporte publicitario y genera ingresos recurrentes. Gestionamos permisos, ingeniería e instalación y lo monetizamos en el Marketplace.",
    url: "/instalacion-de-soportes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Instalación de soportes publicitarios | Monetiza tu muro o terreno – Stellarmotion",
    description:
      "Instala un soporte publicitario y genera ingresos recurrentes. Gestionamos permisos, ingeniería e instalación.",
  },
  alternates: {
    canonical: "/instalacion-de-soportes",
  },
};

export default function InstalacionDeSoportesPage() {
  return <InstalacionSoportesClient />;
}

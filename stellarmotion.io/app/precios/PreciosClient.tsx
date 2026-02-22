"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  CheckCircle2,
  Sparkles,
  Building2,
  ChartColumnBig,
  Rocket,
  User,
} from "lucide-react";

const OWNER_FREE_FEATURES = [
  "Alta limitada de soportes",
  "Recepción de solicitudes",
  "Perfil público básico",
  "Uso limitado del sistema",
];

const OWNER_FREE_LIMITS = [
  "Comisión más alta por operación",
  "Sin PDFs profesionales",
  "Sin control fino de precios",
  "Visibilidad estándar en el marketplace",
];

const OWNER_PRO_FEATURES = [
  "Inventario completo de soportes",
  "Gestión estructurada de solicitudes y campañas",
  "Generación de PDFs profesionales",
  "Control avanzado de precios (ocultos, rangos, visibles bajo solicitud)",
  "Historial de campañas y brands",
  "Soporte prioritario básico",
  "Menor comisión por operación",
  "Mejor visibilidad en el marketplace",
];

const OWNER_ADVANCED_FEATURES = [
  "Todo lo de Owner Pro",
  "Multiusuario",
  "PDFs sin marca Stellarmotion (marca blanca)",
  "Estadísticas avanzadas",
  "Acceso prioritario a leads",
  "Integraciones futuras / API",
  "Soporte premium",
  "Comisión mínima por operación",
];

const BRAND_FREE_FEATURES = [
  "Explorar inventario",
  "Solicitar información",
  "Crear campañas básicas",
  "Comunicación inicial con owners",
];

const BRAND_FREE_LIMITS = [
  "Sin PDFs propios",
  "Sin informes",
  "Sin prioridad",
];

const BRAND_PRO_FEATURES = [
  "Acceso completo al inventario",
  "Comparación de soportes",
  "PDFs de propuestas con su marca",
  "Gestión de campañas",
  "Historial de brands",
  "Acceso a más datos",
  "Prioridad en solicitudes",
  "Mayor comisión por ventas si actúan como brokers",
];

const BRAND_ADVANCED_FEATURES = [
  "Multiusuario",
  "PDFs avanzados",
  "Informes detallados",
  "Acceso anticipado a inventario",
  "Leads prioritarios",
  "Mayor comisión por operación",
  "Herramientas avanzadas de gestión",
];

const FAQ_ITEMS = [
  {
    q: "¿Puedo empezar gratis?",
    a: "Sí. Tanto owners como marcas/agencias pueden empezar con el plan Free. Está pensado para entrar sin fricción y conocer el marketplace. Cuando tu operación crezca, el upgrade a Pro se justifica solo.",
  },
  {
    q: "¿Cuándo tiene sentido pasar a Pro?",
    a: "Cuando necesites inventario completo, PDFs profesionales, control de precios avanzado o prioridad en solicitudes y soporte. El Pro es el sistema de trabajo para operar de forma seria en el marketplace.",
  },
  {
    q: "¿Cómo funcionan las comisiones?",
    a: "En Free la comisión por operación es más alta. En Pro se reduce, y en Enterprise es mínima. Así la comisión actúa como palanca natural: si operas mucho, te compensa estar en Pro o superior.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí. Puedes subir o bajar de plan según tu necesidad. Escalas cuando tu operación lo requiere.",
  },
  {
    q: "¿Hay permanencia?",
    a: "No. Los planes son mensuales. Puedes cancelar o cambiar cuando quieras.",
  },
];

export default function PreciosClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      {/* Hero */}
      <section className="relative border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Planes diseñados para escalar el marketplace publicitario
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              Empieza gratis. Crece cuando tu operación lo necesita.
            </p>
          </div>
        </div>
      </section>

      {/* Bloque 1 — Para los que venden (Owners) */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Para propietarios (Owners)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Planes pensados para propietarios de soportes publicitarios, desde inventarios pequeños hasta operaciones profesionales.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Owner Free */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-[#e94446]" />
                  Owner Free
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Tu punto de partida en el marketplace publicitario.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  Gratis
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Comisión del 3% por operación
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {OWNER_FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/publicar-espacio" className="w-full">
                  <Button variant="outline" className="w-full rounded-full border-gray-300 dark:border-gray-700">
                    Empezar gratis
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Owner Pro — Recomendado */}
            <Card className="border-2 border-[#e94446] dark:border-[#e94446] bg-white dark:bg-gray-950 flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#e94446] text-white border-0 px-3 py-1 text-xs font-semibold">
                  Recomendado
                </Badge>
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#e94446]" />
                  Owner Pro
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  El sistema de trabajo para propietarios profesionales.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  99 €/mes
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Comisión del 2% por operación
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {OWNER_PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/auth/register" className="w-full">
                  <Button variant="brand" className="w-full rounded-full">
                    Pasar a Owner Pro
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Enterprise */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#e94446]" />
                  Enterprise
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Para operaciones más grandes o equipos ambiciosos.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  Contactar con ventas
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Comisión del 1% por operación
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {OWNER_ADVANCED_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/contact" className="w-full">
                  <Button variant="outline" className="w-full rounded-full border-gray-300 dark:border-gray-700">
                    Contactar con ventas
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Bloque 2 — Para los que compran (Brands) */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Para marcas y agencias (Brands)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Externamente todos son marcas. Internamente, Stellarmotion diferencia entre compra directa y uso profesional del sistema.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Customer */}
            <Card className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#e94446]" />
                  Customer
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Regístrate y explora publicidad exterior para tu marca.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  Gratis
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {BRAND_FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/marketplace" className="w-full">
                  <Button variant="outline" className="w-full rounded-full border-gray-300 dark:border-gray-700">
                    Explorar marketplace
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Broker — Recomendado */}
            <Card className="border-2 border-[#e94446] dark:border-[#e94446] bg-gray-50/50 dark:bg-gray-950 flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#e94446] text-white border-0 px-3 py-1 text-xs font-semibold">
                  Recomendado
                </Badge>
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChartColumnBig className="w-5 h-5 text-[#e94446]" />
                  Broker
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  La herramienta comercial para brands activas y agencias pequeñas.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  Gratis
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {BRAND_PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/auth/register" className="w-full">
                  <Button variant="brand" className="w-full rounded-full">
                    Empezar con Pro
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Agency */}
            <Card className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#e94446]" />
                  Agency
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Para equipos y operaciones de mayor volumen.
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  149 €/mes
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-1.5">
                  {BRAND_ADVANCED_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#e94446] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link prefetch={false} href="/contact" className="w-full">
                  <Button variant="outline" className="w-full rounded-full border-gray-300 dark:border-gray-700">
                    Contactar con ventas
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            Preguntas frecuentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900 dark:text-white">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}

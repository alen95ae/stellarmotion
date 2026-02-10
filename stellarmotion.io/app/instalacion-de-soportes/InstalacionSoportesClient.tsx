"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SoportesROIWidget } from "@/components/SoportesROIWidget";
import {
  FileCheck,
  Wrench,
  TrendingUp,
  Shield,
  Truck,
  Store,
  BarChart3,
  MapPin,
  Building2,
  TreePine,
  Layout,
  CheckCircle2,
  Quote,
} from "lucide-react";

const BENEFICIOS = [
  {
    icon: TrendingUp,
    title: "Ingresos recurrentes",
  },
  {
    icon: FileCheck,
    title: "Nos encargamos de permisos",
  },
  {
    icon: Shield,
    title: "Proyecto técnico y seguridad",
  },
  {
    icon: Truck,
    title: "Instalación profesional",
  },
  {
    icon: Store,
    title: "Comercialización en Marketplace",
  },
  {
    icon: BarChart3,
    title: "Mantenimiento y optimización",
  },
];

const PASOS = [
  "Evaluación de ubicación (visibilidad, tráfico, normativa)",
  "Propuesta personalizada + estimación de ingresos",
  "Permisos y legal (ayuntamiento / carreteras / propietarios)",
  "Ingeniería y diseño del soporte",
  "Fabricación e instalación",
  "Venta/gestión de campañas (Stellarmotion Marketplace)",
];

const FAQ_ITEMS = [
  {
    q: "¿Necesito permisos?",
    a: "Sí. Nosotros nos encargamos de la revisión normativa y la tramitación de licencias ante ayuntamiento, carreteras o propietarios según corresponda.",
  },
  {
    q: "¿Qué tipo de ubicaciones funcionan mejor?",
    a: "Muros visibles desde carretera, terrenos en zona de paso, azoteas o fachadas en ciudad y fincas o solares con acceso. Cualquier ubicación con buena visibilidad puede ser rentable.",
  },
  {
    q: "¿Cuánto se puede ganar?",
    a: "Depende de la ciudad, los m² del soporte y la ocupación. El simulador te da una estimación orientativa; tras evaluar tu ubicación te enviamos una propuesta con cifras concretas.",
  },
  {
    q: "¿Quién paga la instalación?",
    a: "La inversión inicial (diseño, fabricación e instalación) puede ser asumida por el propietario o financiada según el acuerdo. Te lo detallamos en la propuesta personalizada.",
  },
  {
    q: "¿Cuánto tarda el proceso?",
    a: "Desde la evaluación hasta la instalación pueden ser varias semanas o meses según permisos y complejidad. Te damos un cronograma claro en la propuesta.",
  },
  {
    q: "¿Qué pasa si no se alquila todos los meses?",
    a: "Los ingresos varían según la ocupación. Las estimaciones del simulador aplican un factor conservador; en la propuesta te explicamos escenarios realistas.",
  },
  {
    q: "¿Stellarmotion vende la publicidad?",
    a: "Sí. Comercializamos tu soporte en el Stellarmotion Marketplace y nos encargamos de la venta de espacios y la gestión de campañas.",
  },
  {
    q: "¿Puedo retirar el soporte en el futuro?",
    a: "Sí. Los acuerdos contemplan la posibilidad de retirada según los plazos y condiciones que pactemos contigo.",
  },
  {
    q: "¿Hay mantenimiento?",
    a: "Sí. Incluimos mantenimiento y optimización para que el soporte esté siempre en condiciones y genere el máximo rendimiento.",
  },
  {
    q: "¿Cómo recibo los pagos?",
    a: "Te detallamos el calendario y la forma de pago (transferencia, facturación, etc.) en el contrato y en tu panel de propietario.",
  },
];

const TIPO_UBICACION = [
  { value: "muro", label: "Muro" },
  { value: "terreno", label: "Terreno" },
  { value: "azotea", label: "Azotea" },
  { value: "otro", label: "Otro" },
];

export default function InstalacionSoportesClient() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    ciudad: string;
    tipoUbicacion: string;
    metros: string;
    direccion: string;
    privacidad: boolean;
    submitted: boolean;
    sending: boolean;
  }>({
    nombre: "",
    email: "",
    telefono: "",
    ciudad: "",
    tipoUbicacion: "",
    metros: "",
    direccion: "",
    privacidad: false,
    submitted: false,
    sending: false,
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.privacidad) return;
    setFormState((s) => ({ ...s, sending: true }));
    try {
      const res = await fetch("/api/leads/instalacion-soportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formState.nombre,
          email: formState.email,
          telefono: formState.telefono,
          ciudad: formState.ciudad,
          tipo_ubicacion: formState.tipoUbicacion,
          metros_cuadrados: formState.metros ? Number(formState.metros) : null,
          direccion: formState.direccion,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormState((s) => ({
          ...s,
          submitted: true,
          sending: false,
          nombre: "",
          email: "",
          telefono: "",
          ciudad: "",
          tipoUbicacion: "",
          metros: "",
          direccion: "",
          privacidad: false,
        }));
      } else {
        setFormState((s) => ({ ...s, sending: false }));
      }
    } catch {
      setFormState((s) => ({ ...s, sending: false }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      {/* 1) HERO */}
      <section className="relative border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Convierte tu muro o terreno en un activo que genera ingresos
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl">
                Instalamos tu soporte publicitario y lo monetizamos por ti. Te
                guiamos en permisos, ingeniería, fabricación e instalación.
                Propuesta personalizada en 48h.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  variant="brand"
                  size="lg"
                  className="rounded-full"
                  onClick={scrollToForm}
                >
                  Quiero mi propuesta
                </Button>
                <Link prefetch={false} href="#simulador">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-gray-300 dark:border-gray-700"
                  >
                    Simular rentabilidad
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e94446]" />
                  Estudio gratuito
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e94446]" />
                  Gestión legal y técnica
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e94446]" />
                  Sin complicaciones
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <SoportesROIWidget
                onRequestProposal={scrollToForm}
                initialM2={18}
                initialCity="Madrid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2) PARA QUIÉN ES */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            ¿Para quién es?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Si tu ubicación tiene visibilidad, puede convertirse en un soporte
            rentable.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                title: "Tienes un muro visible desde carretera",
              },
              {
                icon: MapPin,
                title: "Tienes un terreno en zona de paso",
              },
              {
                icon: Layout,
                title: "Tienes azotea o fachada en ciudad",
              },
              {
                icon: TreePine,
                title: "Tienes una finca o acceso a un solar",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
              >
                <CardContent className="pt-6">
                  <item.icon className="w-10 h-10 text-[#e94446] mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3) BENEFICIOS */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Beneficios
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFICIOS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <b.icon className="w-8 h-8 shrink-0 text-[#e94446]" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {b.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4) CÓMO FUNCIONA */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Cómo funciona
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {PASOS.map((paso, i) => (
              <div
                key={i}
                className="flex gap-4 items-start"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e94446] text-white text-sm font-semibold">
                  {i + 1}
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-0.5">
                  {paso}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="brand" onClick={scrollToForm}>
              Solicitar evaluación gratuita
            </Button>
          </div>
        </div>
      </section>

      {/* 5) SIMULADOR */}
      <section id="simulador" className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Simula tu rentabilidad
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Ajusta ciudad y metros cuadrados para ver una estimación orientativa.
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <SoportesROIWidget
                onRequestProposal={scrollToForm}
                initialM2={18}
                initialCity="Madrid"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-6 max-w-2xl mx-auto">
            Estimaciones orientativas. La rentabilidad real depende de
            visibilidad, normativa, tráfico, ocupación y características
            técnicas. Te enviamos una propuesta exacta tras evaluar tu
            ubicación.
          </p>
          <div className="text-center mt-6">
            <Button variant="brand" onClick={scrollToForm}>
              Pedir propuesta exacta
            </Button>
          </div>
        </div>
      </section>

      {/* 6) PRUEBA SOCIAL */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Lo que dicen propietarios
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              "Tenía un muro sin uso y ahora genera ingresos mensuales. Stellarmotion se encargó de todo.",
              "El proceso de permisos me daba miedo. Lo gestionaron ellos y en pocas semanas estaba instalado.",
              "Mi terreno está en una carretera secundaria y aun así la propuesta fue interesante. Muy contento.",
            ].map((text, i) => (
              <div key={i} className="flex flex-col">
                <Quote className="w-8 h-8 text-[#e94446]/60 mb-2" />
                <p className="text-gray-700 dark:text-gray-300 italic flex-1">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-[#e94446]">Proyectos llave en mano</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestión integral
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e94446]">Gestión integral</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Legal, técnico e instalación
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e94446]">Marketplace</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Para monetizar tu soporte
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7) NOSOTROS NOS ENCARGAMOS */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nosotros nos encargamos
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#e94446]" />
                  Legal y permisos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Revisión normativa</p>
                <p>• Tramitación / licencias</p>
                <p>• Contratos y derechos de explotación</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#e94446]" />
                  Técnico e instalación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Ingeniería estructural</p>
                <p>• Seguridad y materiales</p>
                <p>• Instalación y mantenimiento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8) FAQ */}
      <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Preguntas frecuentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 9) FORMULARIO */}
      <section
        ref={formRef}
        className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Solicitar evaluación gratuita
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Rellena el formulario y te contactamos en 24–48h.
          </p>
          {formState.submitted ? (
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500 mx-auto mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">
                Recibido. Te contactamos en 24–48h.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  required
                  value={formState.nombre}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, nombre: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  required
                  value={formState.telefono}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, telefono: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formState.ciudad}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, ciudad: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tipo de ubicación</Label>
                <Select
                  value={formState.tipoUbicacion}
                  onValueChange={(v) =>
                    setFormState((s) => ({ ...s, tipoUbicacion: v }))
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_UBICACION.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="metros">Medidas aproximadas (m²)</Label>
                <Input
                  id="metros"
                  type="number"
                  min={1}
                  max={200}
                  placeholder="Ej. 18"
                  value={formState.metros}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, metros: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección o referencia</Label>
                <Textarea
                  id="direccion"
                  placeholder="Calle, número, zona..."
                  value={formState.direccion}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, direccion: e.target.value }))
                  }
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacidad"
                  checked={formState.privacidad}
                  onCheckedChange={(v) =>
                    setFormState((s) => ({ ...s, privacidad: !!v }))
                  }
                />
                <Label
                  htmlFor="privacidad"
                  className="text-sm font-normal cursor-pointer"
                >
                  Acepto la política de privacidad y el tratamiento de mis datos
                  para que me contacten. *
                </Label>
              </div>
              <Button
                type="submit"
                variant="brand"
                className="w-full"
                disabled={!formState.privacidad || formState.sending}
              >
                {formState.sending
                  ? "Enviando..."
                  : "Solicitar evaluación gratuita"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* 10) CTA FINAL */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Tu ubicación puede generar ingresos. Nosotros hacemos el resto.
          </p>
          <Button variant="brand" size="lg" onClick={scrollToForm}>
            Quiero mi propuesta
          </Button>
        </div>
      </section>
    </div>
  );
}

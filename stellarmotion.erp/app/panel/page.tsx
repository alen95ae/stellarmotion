"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Monitor,
  Target,
  Activity,
  ArrowRight,
  Plus,
  FileText,
  HeartHandshake,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const revenueData = [
  { month: "Ene", ingresos: 45000, gastos: 28000 },
  { month: "Feb", ingresos: 97000, gastos: 60000 },
  { month: "Mar", ingresos: 145000, gastos: 89000 },
  { month: "Abr", ingresos: 206000, gastos: 124000 },
  { month: "May", ingresos: 261000, gastos: 155000 },
  { month: "Jun", ingresos: 328000, gastos: 193000 },
]

const tableIngresosGastos = [
  { concepto: "Alquiler Mupi Centro", tipo: "ingreso" as const, importe: 12500, fecha: "Jun 2025" },
  { concepto: "Mantenimiento soportes", tipo: "gasto" as const, importe: 3200, fecha: "Jun 2025" },
  { concepto: "Campaign Valla A1", tipo: "ingreso" as const, importe: 8900, fecha: "May 2025" },
  { concepto: "Suministros", tipo: "gasto" as const, importe: 1800, fecha: "May 2025" },
  { concepto: "Reserva Pantalla Times Sq", tipo: "ingreso" as const, importe: 15200, fecha: "May 2025" },
]

const activityData = [
  { time: "Hoy 10:30", activity: "Cotización enviada a cliente", type: "cotización" },
  { time: "Hoy 09:15", activity: "Soporte reservado - Mupi Gran Vía", type: "soporte" },
  { time: "Ayer 16:45", activity: "Nuevo owner registrado", type: "owner" },
  { time: "Ayer 14:20", activity: "Oportunidad ganada en CRM", type: "crm" },
  { time: "Ayer 11:00", activity: "Nueva cotización creada", type: "venta" },
]

const quickActions = [
  { label: "Nueva cotización", href: "/panel/ventas/cotizaciones", icon: FileText, primary: true },
  { label: "Nuevo soporte", href: "/panel/soportes/nuevo", icon: Monitor, primary: false },
  { label: "Nuevo owner", href: "/panel/owners/nuevo", icon: HeartHandshake, primary: false },
  { label: "Ir al CRM", href: "/panel/crm", icon: Filter, primary: false },
]

const metrics = [
  {
    title: "Ingresos del mes",
    value: "€124.500",
    change: "+12%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Gastos del mes",
    value: "€38.200",
    change: "-3%",
    trend: "down" as const,
    icon: Receipt,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Soportes activos",
    value: "142",
    change: "+5",
    trend: "up" as const,
    icon: Monitor,
    color: "text-[#e94446]",
    bgColor: "bg-[#e94446]/10",
  },
  {
    title: "Oportunidades abiertas",
    value: "28",
    change: "+4",
    trend: "up" as const,
    icon: Target,
    color: "text-[#e94446]",
    bgColor: "bg-[#e94446]/10",
  },
]

export default function PanelPrincipalPage() {
  return (
    <div className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Panel principal
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Vista general de tu negocio de publicidad exterior
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border bg-card hover:bg-accent/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {m.title}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                      {m.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {m.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span
                        className={
                          m.trend === "up"
                            ? "text-green-600 dark:text-green-400 text-sm"
                            : "text-red-600 dark:text-red-400 text-sm"
                        }
                      >
                        {m.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-lg ${m.bgColor} ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráfico Ingresos vs Gastos (verde/rojo) + Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">
                Ingresos vs Gastos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Evolución mensual (ingresos en verde, gastos en rojo)
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number, name: string) => [
                      `€${value.toLocaleString("es-ES")}`,
                      name,
                    ]}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    name="Gastos"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border bg-card h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-lg">
                Resumen ingresos / gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-1">
                {tableIngresosGastos.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/40 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {row.concepto}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.fecha}</p>
                    </div>
                    <span
                      className={
                        row.tipo === "ingreso"
                          ? "text-green-600 dark:text-green-400 font-semibold shrink-0 ml-2"
                          : "text-red-600 dark:text-red-400 font-semibold shrink-0 ml-2"
                      }
                    >
                      {row.tipo === "ingreso" ? "+" : "-"}€
                      {row.importe.toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actividad reciente + Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                <Activity className="w-5 h-5" />
                Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {activityData.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#e94446] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {item.type}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant={action.primary ? "default" : "outline"}
                  className={
                    action.primary
                      ? "w-full justify-start bg-[#e94446] hover:bg-[#D7514C] text-white border-0"
                      : "w-full justify-start border-border hover:bg-muted text-foreground"
                  }
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="w-4 h-4 mr-2 shrink-0" />
                    {action.label}
                    <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

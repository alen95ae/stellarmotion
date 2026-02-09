"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data: impactos publicitarios por franja horaria (solo presentación, tendencia al alza)
const IMPACTOS_DATA = [
  { time: "9:00", impactos: 84200, label: "Vie 10 May 9h - 10h" },
  { time: "10:00", impactos: 124500, label: "Vie 10 May 10h - 11h" },
  { time: "11:00", impactos: 198200, label: "Vie 10 May 11h - 12h" },
  { time: "12:00", impactos: 285400, label: "Vie 10 May 12h - 13h" },
  { time: "13:00", impactos: 312800, label: "Vie 10 May 13h - 14h" },
  { time: "14:00", impactos: 378100, label: "Vie 10 May 14h - 15h" },
  { time: "15:00", impactos: 445600, label: "Vie 10 May 15h - 16h" },
  { time: "16:00", impactos: 518300, label: "Vie 10 May 16h - 17h" },
  { time: "17:00", impactos: 562400, label: "Vie 10 May 17h - 18h" },
  { time: "18:00", impactos: 618318, label: "Vie 10 May 18h - 19h" },
  { time: "19:00", impactos: 672100, label: "Vie 10 May 19h - 20h" },
  { time: "20:00", impactos: 728500, label: "Vie 10 May 20h - 21h" },
];

const formatImpactos = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toLocaleString();
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { impactos: number; label: string } }> }) {
  if (!active || !payload?.length) return null;
  const { impactos, label: timeLabel } = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-[200px]">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Impactos</p>
      <p className="text-2xl font-bold text-gray-900">{impactos.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{timeLabel}</p>
    </div>
  );
}

export default function PlatformAnalyticsSection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: título, descripción y CTAs */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Entiende el impacto de tus soportes en tiempo real
            </h2>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Con datos de impresiones y alcance por soporte y franja horaria, Stellarmotion te da el control sobre el rendimiento de tu inventario OOH y DOOH.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e94446] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#d63a3a] transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                Explorar marketplace
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Solicitar demo
              </Link>
            </div>
          </div>

          {/* Right: gráfica única de impactos */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={IMPACTOS_DATA}
                    margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="impactosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e94446" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#e94446" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} horizontal={true} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatImpactos}
                      width={44}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="impactos"
                      stroke="#e94446"
                      strokeWidth={2}
                      fill="url(#impactosGradient)"
                      dot={{ fill: "#e94446", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: "#e94446", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

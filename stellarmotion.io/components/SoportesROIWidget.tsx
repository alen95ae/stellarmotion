"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const BASE_MONTHLY_PER_M2 = 55;
const INVESTMENT_BASE = 2800;
const INVESTMENT_PER_M2 = 220;
const OCCUPANCY_FACTOR = 0.78;
const VARIANCE = 0.15;

const cityMultipliers: Record<string, number> = {
  Madrid: 1.35,
  Barcelona: 1.3,
  Valencia: 1.15,
  Sevilla: 1.1,
  Bilbao: 1.1,
  Zaragoza: 1.05,
  Málaga: 1.1,
  Valladolid: 0.95,
  Zamora: 0.85,
};

const CITIES = Object.keys(cityMultipliers);
const M2_MARKS = [4, 8, 12, 18, 24, 36, 48, 60];
const MAX_M2 = 60;
const MIN_M2 = 4;

export type SoportesROIResult = {
  monthlyRevenue: number;
  monthlyRevenueLow: number;
  monthlyRevenueHigh: number;
  yearlyRevenue: number;
  investment: number;
  paybackMonths: number;
  paybackProgress: number;
};

function computeROI(
  city: string,
  m2: number
): SoportesROIResult {
  const multiplier = cityMultipliers[city] ?? 1;
  const monthlyRevenue =
    m2 * BASE_MONTHLY_PER_M2 * multiplier;
  const monthlyRevenueLow = monthlyRevenue * (1 - VARIANCE);
  const monthlyRevenueHigh = monthlyRevenue * (1 + VARIANCE);
  const yearlyRevenue = monthlyRevenue * 12;
  const investment = INVESTMENT_BASE + m2 * INVESTMENT_PER_M2;
  const netMonthly = monthlyRevenue * OCCUPANCY_FACTOR;
  const paybackMonths = netMonthly > 0 ? investment / netMonthly : 999;
  const maxReasonablePayback = 60;
  const paybackProgress = Math.min(
    100,
    (maxReasonablePayback / paybackMonths) * 100
  );
  return {
    monthlyRevenue,
    monthlyRevenueLow,
    monthlyRevenueHigh,
    yearlyRevenue,
    investment,
    paybackMonths,
    paybackProgress,
  };
}

interface SoportesROIWidgetProps {
  onRequestProposal?: () => void;
  initialM2?: number;
  initialCity?: string;
  className?: string;
}

export function SoportesROIWidget({
  onRequestProposal,
  initialM2 = 18,
  initialCity = "Madrid",
  className,
}: SoportesROIWidgetProps) {
  const [city, setCity] = useState(initialCity);
  const [m2, setM2] = useState(initialM2);

  const result = useMemo(() => computeROI(city, m2), [city, m2]);

  const formatEur = (n: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Card className={cn("border-gray-200 dark:border-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Simula tu rentabilidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="city-select">Ciudad</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="city-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Superficie (m²): {m2}</Label>
          <Slider
            value={[m2]}
            onValueChange={([v]) => setM2(Math.round(v))}
            min={MIN_M2}
            max={MAX_M2}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{MIN_M2} m²</span>
            <span>{MAX_M2} m²</span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ingresos estimados / mes
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              Entre {formatEur(result.monthlyRevenueLow)} y{" "}
              {formatEur(result.monthlyRevenueHigh)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ingresos estimados / año
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatEur(result.yearlyRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inversión estimada
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatEur(result.investment)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Amortización
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Recuperas la inversión aprox. en{" "}
              {result.paybackMonths >= 999
                ? "—"
                : `${Math.round(result.paybackMonths)} meses`}
            </p>
            {result.paybackMonths < 999 && (
              <Progress
                value={result.paybackProgress}
                className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-[#e94446]"
              />
            )}
          </div>
        </div>

        {onRequestProposal && (
          <Button
            variant="brand"
            className="w-full"
            onClick={onRequestProposal}
          >
            Pedir propuesta exacta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { computeROI, cityMultipliers, CITIES, M2_MARKS };

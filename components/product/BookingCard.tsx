"use client";

import { useState, useEffect } from 'react';
import { Product, ReservationRequest } from '@/types/product';
import { Calendar, Printer, CheckCircle } from 'lucide-react';

interface BookingCardProps {
  product: Product;
}

export default function BookingCard({ product }: BookingCardProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includePrinting, setIncludePrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Calcular días entre fechas (fin exclusivo)
  const daysBetween = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calcular precio prorrateado
  const calculateProratedPrice = (): number => {
    const days = daysBetween(startDate, endDate);
    return (product.pricePerMonth / 30) * days;
  };

  // Calcular total
  const calculateTotal = (): number => {
    const proratedPrice = calculateProratedPrice();
    const printingCost = includePrinting ? product.printingCost : 0;
    return proratedPrice + printingCost;
  };

  // Validar fechas
  const isValidDateRange = (): boolean => {
    if (!startDate || !endDate) return false;
    const days = daysBetween(startDate, endDate);
    return days > 0;
  };

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Crear reserva
  const handleBooking = async () => {
    if (!isValidDateRange()) return;

    setIsLoading(true);
    setError('');

    try {
      const reservationData: ReservationRequest = {
        productId: product.id,
        start: startDate,
        end: endDate,
        includePrinting
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form after success
        setTimeout(() => {
          setIsSuccess(false);
          setStartDate('');
          setEndDate('');
          setIncludePrinting(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear la reserva');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Reservar este soporte
      </h2>

      {/* Precio por mes */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-2xl font-bold text-rose-600">
          {formatCurrency(product.pricePerMonth)}
        </div>
        <div className="text-sm text-gray-600">por mes</div>
      </div>

      {/* Fechas */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Fecha de inicio
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7514C] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Fecha de fin (exclusiva)
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7514C] focus:border-transparent"
            required
          />
        </div>

        {startDate && endDate && !isValidDateRange() && (
          <p className="text-sm text-red-600">
            La fecha de fin debe ser posterior a la de inicio
          </p>
        )}
      </div>

      {/* Checkbox de impresión */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includePrinting}
            onChange={(e) => setIncludePrinting(e.target.checked)}
            className="w-4 h-4 text-[#D7514C] border-gray-300 rounded focus:ring-[#D7514C]"
          />
          <div className="flex items-center">
            <Printer className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Impresión de lona ({formatCurrency(product.printingCost)} por reserva)
            </span>
          </div>
        </label>
      </div>

      {/* Resumen de costes */}
      {isValidDateRange() && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span>Precio prorrateado ({daysBetween(startDate, endDate)} días):</span>
            <span className="font-medium">{formatCurrency(calculateProratedPrice())}</span>
          </div>
          {includePrinting && (
            <div className="flex justify-between text-sm">
              <span>Impresión de lona:</span>
              <span className="font-medium">{formatCurrency(product.printingCost)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-lg text-rose-600">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      )}

      {/* Botón de reserva */}
      <button
        onClick={handleBooking}
        disabled={!isValidDateRange() || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isValidDateRange() && !isLoading
            ? 'bg-[#D7514C] hover:bg-[#c23d3b] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Creando reserva...' : 'Reservar ahora'}
      </button>

      {/* Mensaje de éxito */}
      {isSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-sm text-green-800">
            ¡Reserva creada exitosamente!
          </span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Al reservar aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}

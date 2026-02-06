'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Megaphone, TrendingUp, Users, Eye } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Marketing</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestiona tus campañas y estrategias de marketing
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-[#e94446] hover:bg-[#d63a3a]">
          <Megaphone className="h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Campañas Activas</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alcance Total</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Impresiones</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ROI Promedio</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Campañas de Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay campañas</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comienza creando tu primera campaña de marketing.
            </p>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              Crear Primera Campaña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

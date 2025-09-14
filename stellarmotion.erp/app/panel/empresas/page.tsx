"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Construction } from "lucide-react"

export default function EmpresasPage() {
  return (
    <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Empresas</h1>
          <p className="text-gray-600">Administra las empresas asociadas</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-2xl">En Construcción</CardTitle>
            <CardDescription>
              El módulo de empresas estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Este módulo permitirá gestionar empresas, contactos, 
              contratos y soportes asociados.
            </p>
            <Link href="/dashboard">
              <button className="bg-[#D54644] hover:bg-[#B03A38] text-white px-6 py-2 rounded-lg">
                Volver al Dashboard
              </button>
            </Link>
          </CardContent>
        </Card>
    </div>
  )
}

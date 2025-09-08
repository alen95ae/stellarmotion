import Link from 'next/link';
import { Search, Home } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Icono */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-[#D7514C]" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-8">
            Lo sentimos, el producto que buscas no está disponible o ha sido removido de nuestra plataforma.
          </p>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              href="/buscar-un-espacio"
              className="w-full bg-[#D7514C] hover:bg-[#c23d3b] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar otros espacios
            </Link>

            <Link
              href="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
          </div>

          {/* Información adicional */}
          <p className="text-sm text-gray-500 mt-6">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}

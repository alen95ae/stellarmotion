import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Propietario no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, no pudimos encontrar el perfil del propietario que estás buscando.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/buscar-un-espacio">
              Buscar espacios
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

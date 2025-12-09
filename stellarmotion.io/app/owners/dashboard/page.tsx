'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Monitor, Plus, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OwnersDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setRegistered(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadOwnerData = async () => {
      if (!user) {
        if (!authLoading) {
          // Si no hay usuario y ya terminó de cargar, redirigir a login
          router.push('/auth/login?redirect=/owners/dashboard');
        }
        return;
      }

      try {
        setLoading(true);
        // Obtener datos del owner desde la tabla owners usando user_id
        const { data, error: ownerError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (ownerError) {
          console.error('Error loading owner data:', ownerError);
          setError('No se pudieron cargar los datos del owner');
        } else {
          setOwnerData(data);
        }
      } catch (err) {
        console.error('Error loading owner:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadOwnerData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    );
  }

  if (!user) {
    return null; // Ya se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {registered && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">¡Registro completado!</h3>
                  <p className="text-green-700">
                    Tu cuenta de owner ha sido creada exitosamente. Estamos revisando tu información.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Owner
            {ownerData && ownerData.nombre_contacto && ` - ${ownerData.nombre_contacto}`}
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus soportes publicitarios y maximiza tus ingresos
          </p>
        </div>

        {ownerData && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{ownerData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{ownerData.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">País</p>
                  <p className="font-medium">{ownerData.pais}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium capitalize">{ownerData.estado || 'pendiente'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-[#e94446]" />
                <span>Mis Soportes</span>
              </CardTitle>
              <CardDescription>
                Gestiona todos tus espacios publicitarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/panel/soportes">
                <Button className="w-full bg-[#e94446] hover:bg-[#d63a3a]">
                  Ver Soportes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-[#e94446]" />
                <span>Nuevo Soporte</span>
              </CardTitle>
              <CardDescription>
                Publica un nuevo espacio publicitario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/publicar-espacio">
                <Button className="w-full bg-[#e94446] hover:bg-[#d63a3a]">
                  Crear Soporte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido a StellarMotion</CardTitle>
            <CardDescription>
              Comienza a gestionar tus soportes publicitarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Próximos pasos:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Completa tu perfil de owner</li>
                <li>Publica tu primer soporte publicitario</li>
                <li>Configura tus métodos de pago</li>
                <li>Revisa las reservas y gestiona tus ingresos</li>
              </ul>
            </div>
            <div className="pt-4">
              <Link href="/panel">
                <Button variant="outline" className="w-full">
                  Ir al Panel Principal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

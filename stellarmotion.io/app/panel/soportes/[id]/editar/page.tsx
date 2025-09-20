import { notFound } from "next/navigation";
import EditarSoporteClient from "./EditarSoporteClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return {
    title: `Editar Soporte | StellarMotion`,
    description: 'Edita la información de tu soporte publicitario'
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return notFound();
  }
  
  return <EditarSoporteClient supportId={id} />;
}

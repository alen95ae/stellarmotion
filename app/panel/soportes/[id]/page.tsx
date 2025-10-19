import SidebarLayout from "@/components/layouts/SidebarLayout"

type PageProps = {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = params

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Detalles del soporte #{id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revisa la información del soporte y gestiona acciones relacionadas.
          </p>
        </header>
        <main className="px-6 py-8">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
            Próximamente: información detallada del soporte.
          </div>
        </main>
      </div>
    </SidebarLayout>
  )
}

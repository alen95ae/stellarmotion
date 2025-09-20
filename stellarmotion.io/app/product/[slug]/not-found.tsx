export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
        <p className="text-gray-600 mb-6">
          El espacio que buscas no existe o fue eliminado. Revisa el enlace o vuelve a la búsqueda.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/search" className="inline-flex items-center rounded-md bg-[#D7514C] px-4 py-2 text-white hover:bg-[#D7514C]/90">
            Volver a buscar
          </a>
          <a href="/" className="inline-flex items-center rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  )
}


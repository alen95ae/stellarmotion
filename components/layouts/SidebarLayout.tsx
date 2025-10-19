import Link from "next/link"
import { ReactNode } from "react"

type SidebarLayoutProps = {
  children: ReactNode
}

const navigation = [
  { label: "Panel", href: "/panel" },
  { label: "Ventas", href: "/panel/ventas" },
  { label: "Soportes", href: "/panel/soportes" },
  { label: "Logística", href: "/panel/logistica" },
  { label: "Partners", href: "/panel/partners" },
  { label: "Clientes", href: "/panel/clientes" },
  { label: "Proyectos", href: "/panel/proyectos" },
  { label: "CRM", href: "/panel/crm" },
  { label: "Legal", href: "/panel/legal" },
  { label: "I+D", href: "/panel/id" },
  { label: "Facturación", href: "/panel/facturacion" },
  { label: "Atención", href: "/panel/atencion" },
  { label: "Sitio web", href: "/panel/sitio-web" },
  { label: "Ajustes", href: "/panel/ajustes" },
]

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-white px-6 py-8 lg:flex lg:flex-col">
        <div className="text-lg font-semibold text-gray-900">Stellarmotion</div>
        <nav className="mt-8 space-y-1 text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}

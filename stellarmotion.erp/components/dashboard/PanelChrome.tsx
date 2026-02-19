"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/dashboard/Sidebar"
import HeaderUser from "@/components/dashboard/HeaderUser"

const AJUSTES_SECTIONS = [
  { label: "Usuarios", href: "/panel/ajustes/usuarios" },
  { label: "Invitaciones", href: "/panel/ajustes/invitaciones" },
]

const CRM_SECTIONS = [{ label: "Pipeline", href: "/panel/crm" }]

const BRANDS_SECTIONS = [{ label: "Brands", href: "/panel/brands" }]
const OWNERS_SECTIONS = [{ label: "Owners", href: "/panel/owners" }]
const MAKERS_SECTIONS = [{ label: "Makers", href: "/panel/makers" }]

const headerLinkClass = (isActive: boolean, isAjustes?: boolean, isBrands?: boolean) =>
  cn(
    "font-medium transition-colors py-2",
    isBrands ? "text-base" : "text-sm",
    isActive
      ? "text-[#e94446]"
      : isAjustes
        ? "text-[#50565D] dark:text-white hover:text-[#e94446] dark:hover:text-[#e94446]"
        : "text-black dark:text-white hover:text-[#e94446] dark:hover:text-[#e94446]"
  )

export default function PanelChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAjustes = pathname?.startsWith("/panel/ajustes")
  const isCrm = pathname?.startsWith("/panel/crm")
  const isBrands = pathname?.startsWith("/panel/brands")
  const isOwners = pathname?.startsWith("/panel/owners")
  const isMakers = pathname?.startsWith("/panel/makers")

  return (
    <Sidebar>
      <div className="flex-1 min-w-0 bg-background flex flex-col min-h-screen">
        <header className="shrink-0 border-b border-border bg-background px-4 py-2 flex items-center justify-between">
          {isAjustes ? (
            <nav className="flex items-center gap-6">
              {AJUSTES_SECTIONS.map((section) => {
                const isActive =
                  pathname === section.href || pathname?.startsWith(section.href + "/")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={headerLinkClass(isActive, true, false)}
                  >
                    {section.label}
                  </Link>
                )
              })}
            </nav>
          ) : isCrm ? (
            <nav className="flex items-center gap-6">
              {CRM_SECTIONS.map((section) => {
                const isActive =
                  pathname === section.href || pathname?.startsWith(section.href + "/")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={headerLinkClass(isActive, false, false)}
                  >
                    {section.label}
                  </Link>
                )
              })}
            </nav>
          ) : isBrands ? (
            <nav className="flex items-center gap-6">
              {BRANDS_SECTIONS.map((section) => {
                const isActive =
                  pathname === section.href || pathname?.startsWith(section.href + "/")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={headerLinkClass(isActive, false, true)}
                  >
                    {section.label}
                  </Link>
                )
              })}
            </nav>
          ) : isOwners ? (
            <nav className="flex items-center gap-6">
              {OWNERS_SECTIONS.map((section) => {
                const isActive =
                  pathname === section.href || pathname?.startsWith(section.href + "/")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={headerLinkClass(isActive, false, true)}
                  >
                    {section.label}
                  </Link>
                )
              })}
            </nav>
          ) : isMakers ? (
            <nav className="flex items-center gap-6">
              {MAKERS_SECTIONS.map((section) => {
                const isActive =
                  pathname === section.href || pathname?.startsWith(section.href + "/")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={headerLinkClass(isActive, false, true)}
                  >
                    {section.label}
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div />
          )}
          <HeaderUser />
        </header>
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </Sidebar>
  )
}

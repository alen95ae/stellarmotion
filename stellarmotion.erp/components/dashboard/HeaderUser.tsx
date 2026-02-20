"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UserData {
  id: string
  email: string
  name?: string
  nombre?: string
  role?: string
  imagen_usuario?: string | { url?: string }
}

export default function HeaderUser() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.nombre) {
      return user.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || "U"
  }

  const getUserName = () => {
    return user?.name || user?.nombre || user?.email || "Usuario"
  }

  const getUserImage = (): string | null => {
    if (!user?.imagen_usuario) return null
    const img = user.imagen_usuario
    if (typeof img === "string") {
      try {
        const parsed = JSON.parse(img)
        return parsed?.url || null
      } catch {
        return img
      }
    }
    return (img as { url?: string })?.url || null
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.replace("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      router.replace("/login")
    }
  }

  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-muted dark:bg-[#1E1E1E] animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto p-2 hover:bg-muted dark:hover:bg-[#1E1E1E]"
                onClick={(e) => e.preventDefault()}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserImage() || ""} alt={getUserName()} />
                  <AvatarFallback className="bg-[#e94446] text-white text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground dark:text-[#FFFFFF]">
                    {getUserName()}
                  </span>
                  {user.role && (
                    <Badge className="bg-muted text-[#e94446] dark:bg-[#1E1E1E] text-[10px] px-1.5 py-0 mt-0.5 h-4 rounded-full border border-[#e94446]/30">
                      {user.role.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover text-popover-foreground border border-border dark:!bg-[#141414] dark:!text-[#FFFFFF] dark:border-[#1E1E1E]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="[&_*]:text-foreground dark:[&_*]:!text-[#FFFFFF]">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-[#FFFFFF]">
                    {user.email}
                  </p>
                  {user.role && (
                    <Badge className="bg-muted dark:bg-[#1E1E1E] text-[#e94446] text-[10px] px-2 py-0.5 w-fit mt-1 rounded-full border border-[#e94446]/30">
                      {user.role.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border dark:bg-[#1E1E1E]" />
              <DropdownMenuItem
                onClick={() => router.push("/panel/perfil", { scroll: false })}
                className="focus:bg-accent focus:text-accent-foreground dark:!text-[#FFFFFF] dark:hover:!text-[#FFFFFF] dark:hover:!bg-[#1E1E1E] dark:focus:!bg-[#1E1E1E] dark:focus:!text-[#FFFFFF] dark:data-[highlighted]:!bg-[#1E1E1E] dark:data-[highlighted]:!text-[#FFFFFF] dark:[&_svg]:!text-[#FFFFFF]"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border dark:bg-[#1E1E1E]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="focus:bg-accent focus:text-accent-foreground dark:!text-[#FFFFFF] dark:hover:!text-[#FFFFFF] dark:hover:!bg-[#1E1E1E] dark:focus:!bg-[#1E1E1E] dark:focus:!text-[#FFFFFF] dark:data-[highlighted]:!bg-[#1E1E1E] dark:data-[highlighted]:!text-[#FFFFFF]"
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" asChild>
            <a href="/login">
              <User className="h-5 w-5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "¡Hola! Soy Estella, la IA de Stellarmotion. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre vallas publicitarias, disponibilidad o nuestros servicios.",
  timestamp: new Date(),
}

export function EstellaChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [showLabel, setShowLabel] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Animación de invitación: mostrar/ocultar el label cada cierto tiempo
  useEffect(() => {
    if (open) {
      setShowLabel(false)
      return
    }
    const t = setInterval(() => {
      setShowLabel((prev) => !prev)
    }, 2500)
    return () => clearInterval(t)
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    // Respuesta simulada por ahora (placeholder para conectar IA después)
    setTimeout(() => {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Gracias por tu mensaje. Estamos preparando las respuestas automáticas de Estella. Mientras tanto, puedes contactarnos en la web o por email.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 600)
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Label de invitación */}
        <div
          className={cn(
            "rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 text-sm font-medium shadow-lg transition-all duration-500 whitespace-nowrap",
            showLabel && !open
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          )}
        >
          ¡Hola! Soy Estella, ¿hablamos?
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "relative w-16 h-16 rounded-full overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100",
            "animate-estella-pulse hover:scale-105 active:scale-95 transition-transform"
          )}
          aria-label="Abrir chat con Estella"
        >
          <Image
            src="/Estella%20AI.png"
            alt="Estella - IA de Stellarmotion"
            fill
            className="object-cover"
            sizes="64px"
          />
        </button>
      </div>

      {/* Panel de chat */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col w-full sm:max-w-md p-0"
        >
          <SheetHeader className="border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/Estella%20AI.png"
                  alt="Estella"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <SheetTitle className="text-lg">Estella - AI</SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0 px-4 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-stellarmotion-red text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-3 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
              />
              <Button type="submit" size="sm" variant="brand">
                Enviar
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

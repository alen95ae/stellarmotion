"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "erp-dark-mode"

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(STORAGE_KEY)
    setDarkMode(stored === "true")
  }, [mounted])

  const setDarkModePersisted = (value: boolean) => {
    setDarkMode(value)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value))
    }
  }

  return [darkMode, setDarkModePersisted] as const
}

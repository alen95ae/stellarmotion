'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface BubbleData {
  id: string
  name: string
  icon: LucideIcon
  value: number
  route: string
  metrics: {
    total: number
    growth: number
    description: string
  }
}

interface BubbleMenuProps {
  data: BubbleData[]
}

export function BubbleMenu({ data }: BubbleMenuProps) {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Función para obtener el tamaño de las burbujas con soportes como la más grande
  const getBubbleSize = (item: BubbleData) => {
    // Soportes será la más grande (200px)
    if (item.id === 'soportes') return 200
    // Facturación será más pequeña (120px)
    if (item.id === 'facturacion') return 120
    // Las demás mantienen tamaños intermedios
    if (item.id === 'ventas' || item.id === 'compras' || item.id === 'inventario') return 160
    // Las más pequeñas
    return 100
  }

  // Posiciones fijas ordenadas como en la imagen, separadas para evitar solapes
  const getBubblePosition = (item: BubbleData) => {
    const positions: Record<string, { x: number; y: number }> = {
      // Fila superior
      'ventas': { x: 25, y: 32 },
      'compras': { x: 43, y: 26 },
      'inventario': { x: 58, y: 36 },
      'soportes': { x: 80, y: 30 },
      // Fila inferior
      'reservas': { x: 18, y: 72 },
      'logistica': { x: 30, y: 64 },
      'empresas': { x: 42, y: 58 },
      'contactos': { x: 52, y: 66 },
      'facturacion': { x: 82, y: 65 },
      'empleados': { x: 90, y: 78 }
    }
    return positions[item.id] || { x: 50, y: 50 }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const bubbleVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  }


  // Evitar problemas de hidratación
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <h1 className="text-4xl font-bold text-slate-800">Panel de Propietario</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <svg 
            id="Capa_1" 
            data-name="Capa 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 942.95 219.34"
            className="h-16 w-auto"
          >
            <defs>
              <style>{`.cls-1{font-size:109.26px;}.cls-1,.cls-2,.cls-3{fill:#e94446;}.cls-1,.cls-3{font-family:Poppins-SemiBold, Poppins;font-weight:600;}.cls-3{font-size:72px;}`}</style>
            </defs>
            <text className="cls-1" transform="translate(126.63 154.55) scale(1.02 1)">StellarMotion</text>
            <path className="cls-2" d="M68.36,96.26H75c.22,3.24.42,6.24.58,8.51L89.68,89.33H23.21V83.67c7.87-2.82,16-4.59,22.95-8.47,13.09-7.32,19.65-19.58,22-34.18.79-5,.77-5,6.74-4V75.92c-2.63-1.35-5.41-1.86-6.24-3.41-1-1.93-.45-4.72-.5-5.7L54,81.76h66.45v6.13c-6.74,2-13.59,3.21-19.62,6.1C86,101.1,78.31,113.79,75.63,129.74c-.41,2.45,0,5.19-3.94,5-4.16-.15-3.29-3.07-3.3-5.43C68.32,118.47,68.36,107.6,68.36,96.26Z" transform="translate(-23.21 32.4)"/>
            <path className="cls-2" d="M93,53.34a1.92,1.92,0,0,1-2.29,0,3.39,3.39,0,0,1-.27-4.81c2.88-2.69,5.77-5.35,8.65-8,4.51-4.17,9-8.36,13.53-12.52.3-.28.52-.87,1.09-.6s.47.9.48,1.4c0,1.1.13,2.07,1.59,2.32.56.09.74.6.26,1l-.36.34-22,20.38C93.5,53,93.33,53.28,93,53.34Z" transform="translate(-23.21 32.4)"/>
            <path className="cls-2" d="M100.72,62a2.66,2.66,0,0,1,1-1.25L125,39.08c1.46-1.36,2.93-1.38,4.15-.09a2.64,2.64,0,0,1,.32,3.63,5.7,5.7,0,0,1-.69.7Q117.2,54.11,105.56,64.88a2.56,2.56,0,0,1-1.31.87c-.35-.89.36-1.23.8-1.64,2.58-2.46,5.19-4.87,7.82-7.27,1.21-1.11,2.45-2.11,2.2-4.16-.09-.75.27-1.54.21-2.35A17.4,17.4,0,0,1,115,53c-.07.34-.1.78-.59.8s-.68-.27-.88-.66c-.65-1.24-.88-1.31-1.83-.44-3.08,2.81-6.11,5.68-9.2,8.48C102,61.65,101.64,62.4,100.72,62Z" transform="translate(-23.21 32.4)"/>
            <path className="cls-2" d="M100.72,62c3.73-3.44,7.45-6.9,11.19-10.33.4-.36.74-1.09,1.4-.8s.71,1.14.76,1.84c0,.24.09.48.21,1.11a4.57,4.57,0,0,0,.16-3.27c-.43-1.25.4-1.64,1-2.13.49-.37.51.18.55.51a8.9,8.9,0,0,1-.33,3.53c-.09.32-.4.66-.17,1,1,1.31,0,1.85-.67,2.51l-10.61,9.86a2.42,2.42,0,0,1-3-.75A2.38,2.38,0,0,1,100.72,62Z" transform="translate(-23.21 32.4)"/>
            <path className="cls-2" d="M93,53.34,116.24,31.8c-1.21-.51-1.66.25-2.45.67l-.28-4.79c-.47-.09-.65.24-.88.45q-10.86,10.05-21.7,20.13c-1,.92-1.09,3.87-.2,5.05-2-1.16-2.34-3-.82-4.46,2.58-2.46,5.21-4.86,7.82-7.28L119.81,21.1a9.29,9.29,0,0,1,1.11-1,2.85,2.85,0,0,1,3.8,4,7.83,7.83,0,0,1-1,1L94.49,52.25A3.88,3.88,0,0,1,93,53.34Z" transform="translate(-23.21 32.4)"/>
            <text x="-23.21" y="32.4"/>
            <text className="cls-3" transform="translate(880.94 119.85) scale(1.02 1)">™</text>
          </svg>
        </motion.div>
      </div>

      {/* Desktop Layout - Bubble Cloud */}
      <div className="hidden lg:block">
        <motion.div
          className="bubble-container relative w-full h-[600px] overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.map((item) => {
            const size = getBubbleSize(item)
            const Icon = item.icon
            const position = getBubblePosition(item)
            
            return (
              <motion.div
                key={item.id}
                className="absolute"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                variants={bubbleVariants}
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                onHoverStart={() => setHoveredBubble(item.id)}
                onHoverEnd={() => setHoveredBubble(null)}
              >
                <Link href={item.route}>
                  <motion.div
                    className="relative rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center text-white font-semibold select-none"
                    style={{ 
                      width: size, 
                      height: size,
                      backgroundColor: '#E94446'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={size * 0.3} className="mb-2" />
                    <span className="text-sm text-center px-2">{item.name}</span>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
          
          {/* Tooltip separado para evitar problemas de DOM */}
          <AnimatePresence>
            {hoveredBubble && (
              <motion.div
                className="fixed bg-slate-800 text-white p-3 rounded-lg shadow-xl z-50 min-w-[200px] pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  left: '50%',
                  top: '20%',
                  transform: 'translateX(-50%)'
                }}
              >
                {(() => {
                  const item = data.find(d => d.id === hoveredBubble)
                  if (!item) return null
                  
                  return (
                    <div className="text-center">
                      <h3 className="font-bold text-sm mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-300 mb-2">{item.metrics.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Total:</span>
                          <span className="font-semibold">{item.metrics.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Crecimiento:</span>
                          <span className={`font-semibold ${item.metrics.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.metrics.growth >= 0 ? '+' : ''}{item.metrics.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile Layout - Vertical List */}
      <div className="lg:hidden">
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.map((item) => {
            const Icon = item.icon
            
            return (
              <motion.div
                key={item.id}
                variants={bubbleVariants}
                whileHover={{ scale: 1.02 }}
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Link href={item.route}>
                  <motion.div
                    className="relative rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-white"
                    style={{ backgroundColor: '#E94446' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Icon size={40} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p className="text-sm opacity-90">{item.metrics.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.metrics.total.toLocaleString()}</div>
                        <div className={`text-sm ${item.metrics.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                          {item.metrics.growth >= 0 ? '+' : ''}{item.metrics.growth}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

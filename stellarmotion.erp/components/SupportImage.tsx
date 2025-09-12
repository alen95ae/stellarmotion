"use client"

import { useState } from "react"
import Image from "next/image"

interface SupportImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackSrc?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
}

export default function SupportImage({
  src,
  alt,
  className = "w-full h-32 object-cover rounded-lg border",
  fallbackSrc = "/placeholder.jpg",
  width,
  height,
  fill = false,
  priority = false
}: SupportImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  // Si no hay src válido, usar fallback directamente
  const finalSrc = src && src.trim() !== '' && !src.includes('placeholder') ? src : fallbackSrc

  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    )
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width || 200}
      height={height || 128}
      className={className}
      onError={handleError}
      priority={priority}
    />
  )
}

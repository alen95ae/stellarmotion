"use client"

import { useMemo, useState } from "react"
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
  const initial = useMemo(() => {
    if (src && typeof src === 'string' && src.trim() !== '' && !src.includes('placeholder')) return src
    return fallbackSrc
  }, [src, fallbackSrc])

  const [imgSrc, setImgSrc] = useState<string>(initial)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  if (fill) {
    return (
      <Image src={imgSrc} alt={alt} fill className={className} onError={handleError} priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 200}
      height={height || 128}
      className={className}
      onError={handleError}
      priority={priority}
    />
  )
}

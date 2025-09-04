"use client"
import type * as React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = "", ...props }: Props) {
  const base =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D54644]"
  return <input className={`${base} ${className}`} {...props} />
}
export default Input

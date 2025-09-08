"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const RedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-red-500" />
      </SliderPrimitive.Track>
      {props.value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-4 w-4 rounded-full border-2 border-red-500 bg-red-500 shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
RedSlider.displayName = SliderPrimitive.Root.displayName

export { RedSlider }

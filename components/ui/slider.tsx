"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface VanillaSliderProps {
  value: number
  onChange?: (val: number) => void
  onValueChange?: (val: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function VanillaSlider({
  value,
  onChange = () => {},
  onValueChange = () => {},
  min = 0,
  max = 100,
  step = 1,
  className = ""
}: VanillaSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rangeRef.current || !trackRef.current) return

    const safeMin = Number(min)
    const safeMax = Number(max)
    const safeVal = Number(value)

    if (isNaN(safeVal) || isNaN(safeMin) || isNaN(safeMax) || safeMax === safeMin) return

    const percentage = ((safeVal - safeMin) / (safeMax - safeMin)) * 100

    rangeRef.current.style.width = `${percentage}%`
  }, [value, min, max])

  return (
    <div className={cn("relative w-full h-6", className)}>
      {/* Track base */}
      <div
        ref={trackRef}
        className="relative h-2 w-full rounded-full bg-secondary/40 overflow-hidden"
      >
        {/* Progress bar */}
        <div
          ref={rangeRef}
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-200"
        />
      </div>

      {/* Invisible input slider */}
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const raw = Number(e.target.value)
          const newValue = isNaN(raw) ? min : Math.min(Math.max(raw, min), max)
          onChange(newValue)
          onValueChange(newValue)
        }}
        className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
      />
    </div>
  )
}

VanillaSlider.displayName = "VanillaSlider"
export default VanillaSlider
export { VanillaSlider as Slider }

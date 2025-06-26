'use client'

import { useRef, useState } from 'react'

type ChildrenSliderProps = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  sensitivity?: number
  children: React.ReactNode
}

export default function ChildrenSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  sensitivity = 5,
  children,
}: ChildrenSliderProps) {
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  const startX = useRef(0)
  const startValue = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startX.current = e.clientX
    startValue.current = value
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX.current
    const factor = e.shiftKey ? 0.2 : 1
    const stepsMoved = Math.round((dx / sensitivity) * factor)
    let newValue = startValue.current + stepsMoved * step

    newValue = Math.max(min, Math.min(max, newValue))
    onChange(newValue)
  }

  const handleMouseUp = () => {
    setDragging(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const getCursor = () => {
    if (dragging) return 'ew-resize'
    if (hovering) return 'ew-resize'
    return 'default'
  }

  return (
    <span
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        cursor: getCursor(),
        userSelect: 'none',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}

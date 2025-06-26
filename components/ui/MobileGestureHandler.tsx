"use client"

import type React from "react"

import { useCallback, useRef } from "react"

interface TouchPoint {
  x: number
  y: number
  id: number
}

interface MobileGestureHandlerProps {
  onSingleTouch?: (point: { x: number; y: number }) => void
  onTouchMove?: (point: { x: number; y: number }) => void
  onTouchEnd?: () => void
  onPinchZoom?: (scale: number, center: { x: number; y: number }) => void
  onTwoFingerPan?: (delta: { x: number; y: number }) => void
  children: React.ReactNode
  className?: string
}

export function MobileGestureHandler({
  onSingleTouch,
  onTouchMove,
  onTouchEnd,
  onPinchZoom,
  onTwoFingerPan,
  children,
  className = "",
}: MobileGestureHandlerProps) {
  const lastTouches = useRef<TouchPoint[]>([])
  const lastDistance = useRef<number>(0)
  const lastCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const getTouchPoints = useCallback((touches: React.TouchList): TouchPoint[] => {
    return Array.from(touches).map((touch) => ({
      x: touch.clientX,
      y: touch.clientY,
      id: touch.identifier,
    }))
  }, [])

  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  const getCenter = useCallback((p1: TouchPoint, p2: TouchPoint): { x: number; y: number } => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touches = getTouchPoints(e.touches )
      lastTouches.current = touches

      if (touches.length === 1) {
        onSingleTouch?.(touches[0])
      } else if (touches.length === 2) {
        lastDistance.current = getDistance(touches[0], touches[1])
        lastCenter.current = getCenter(touches[0], touches[1])
      }
    },
    [getTouchPoints, onSingleTouch, getDistance, getCenter],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touches = getTouchPoints(e.touches)

      if (touches.length === 1) {
        onTouchMove?.(touches[0])
      } else if (touches.length === 2 && lastTouches.current.length === 2) {
        const currentDistance = getDistance(touches[0], touches[1])
        const currentCenter = getCenter(touches[0], touches[1])

        // Pinch zoom
        if (onPinchZoom && lastDistance.current > 0) {
          const scale = currentDistance / lastDistance.current
          onPinchZoom(scale, currentCenter)
        }

        // Two finger pan
        if (onTwoFingerPan) {
          const deltaX = currentCenter.x - lastCenter.current.x
          const deltaY = currentCenter.y - lastCenter.current.y
          onTwoFingerPan({ x: deltaX, y: deltaY })
        }

        lastDistance.current = currentDistance
        lastCenter.current = currentCenter
      }

      lastTouches.current = touches
    },
    [getTouchPoints, onTouchMove, onPinchZoom, onTwoFingerPan, getDistance, getCenter],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touches = getTouchPoints(e.touches)

      if (touches.length === 0) {
        onTouchEnd?.()
        lastTouches.current = []
        lastDistance.current = 0
      } else {
        lastTouches.current = touches
      }
    },
    [getTouchPoints, onTouchEnd],
  )

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  )
}

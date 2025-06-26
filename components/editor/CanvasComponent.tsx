"use client"

import type React from "react"

import { PixelCanvas, type CanvasState } from "@/lib/pixel-engine"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

interface CanvasComponentProps {
  state: CanvasState
  previewPixels?: { [key: string]: string }
  onionSkin?: { layer: any; opacity: number }
  selectedPixels?: { [key: string]: string }
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseMove?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchMove?: (e: React.TouchEvent) => void
  onTouchEnd?: (e: React.TouchEvent) => void
}

export interface CanvasRef {
  getPixelPosition: (clientX: number, clientY: number) => { x: number; y: number } | null
  getPixelCanvas: () => PixelCanvas | null
}

export const CanvasComponent = forwardRef<CanvasRef, CanvasComponentProps>(
  ({ state, previewPixels = {}, onionSkin, selectedPixels, ...eventHandlers }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pixelCanvasRef = useRef<PixelCanvas | null>(null)

    useEffect(() => {
      if (canvasRef.current && !pixelCanvasRef.current) {
        pixelCanvasRef.current = new PixelCanvas(canvasRef.current, state)
      }
    }, [])

    useEffect(() => {
      if (pixelCanvasRef.current) {
        pixelCanvasRef.current.updateState(state)
        pixelCanvasRef.current.render(previewPixels, onionSkin, selectedPixels)
      }
    }, [state, previewPixels, onionSkin, selectedPixels])

    useImperativeHandle(ref, () => ({
      getPixelPosition: (clientX: number, clientY: number) => {
        return pixelCanvasRef.current?.getPixelPosition(clientX, clientY) || null
      },
      getPixelCanvas: () => pixelCanvasRef.current,
    }))

    return (
      <canvas
        ref={canvasRef}
        className="cursor-crosshair touch-none pixel-canvas"
        style={{
          imageRendering: "pixelated",
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 200px)",
        }}
        {...eventHandlers}
      />
    )
  },
)

CanvasComponent.displayName = "CanvasComponent"

"use client"

import { RotationTool, ScaleTool } from "@/lib/drawing-tools"
import { useMemo, useState } from "react"

export function useSelection() {
  const [selectedPixels, setSelectedPixels] = useState<{ [key: string]: string }>({})
  const [selectionBounds, setSelectionBounds] = useState<{
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null>(null)
  const [clipboard, setClipboard] = useState<{ [key: string]: string }>({})
  const [showSelectionPreview, setShowSelectionPreview] = useState(true)
  const [magicWandTolerance, setMagicWandTolerance] = useState(32)

  const handleCopy = () => {
    if (Object.keys(selectedPixels).length > 0) {
      setClipboard({ ...selectedPixels })
    }
  }

  const handleCut = (applyPixels: (pixels: Array<{ x: number; y: number; color: string | null }>) => void) => {
    if (Object.keys(selectedPixels).length > 0) {
      setClipboard({ ...selectedPixels })
      const pixels: { x: number; y: number; color: string | null }[] = []
      Object.keys(selectedPixels).forEach((key) => {
        const [x, y] = key.split(",").map(Number)
        pixels.push({ x, y, color: null })
      })
      applyPixels(pixels)
      setSelectedPixels({})
      setSelectionBounds(null)
    }
  }

  const handlePaste = async (
    canvasWidth: number,
    canvasHeight: number,
    applyPixels: (pixels: Array<{ x: number; y: number; color: string | null }>) => void
  ) => {
    if (Object.keys(clipboard).length > 0) {
      const clipboardKeys = Object.keys(clipboard)
      const xs = clipboardKeys.map(k => Number.parseInt(k.split(",")[0]))
      const ys = clipboardKeys.map(k => Number.parseInt(k.split(",")[1]))
      const minX = Math.min(...xs)
      const minY = Math.min(...ys)
      
      const offsetX = -minX
      const offsetY = -minY
      
      const pixels: { x: number; y: number; color: string }[] = []
      const newSelectedPixels: { [key: string]: string } = {}
      
      Object.entries(clipboard).forEach(([key, color]) => {
        const [x, y] = key.split(",").map(Number)
        const newX = x + offsetX
        const newY = y + offsetY
        const newKey = `${newX},${newY}`
        
        if (newX >= 0 && newX < canvasWidth && newY >= 0 && newY < canvasHeight) {
          pixels.push({ x: newX, y: newY, color })
          newSelectedPixels[newKey] = color
        }
      })
      
      applyPixels(pixels)
      setSelectedPixels(newSelectedPixels)
      
      const newXs = Object.keys(newSelectedPixels).map(k => Number.parseInt(k.split(",")[0]))
      const newYs = Object.keys(newSelectedPixels).map(k => Number.parseInt(k.split(",")[1]))
      setSelectionBounds({
        minX: Math.min(...newXs),
        maxX: Math.max(...newXs),
        minY: Math.min(...newYs),
        maxY: Math.max(...newYs)
      })
    } else {
      // Handle system clipboard image paste
      try {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type)
              const img = new Image()
              img.src = URL.createObjectURL(blob)
              img.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")!
                ctx.drawImage(img, 0, 0)

                const pixels: { x: number; y: number; color: string }[] = []
                const newSelectedPixels: { [key: string]: string } = {}

                for (let x = 0; x < canvas.width; x++) {
                  for (let y = 0; y < canvas.height; y++) {
                    const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data
                    if (a > 0) {
                      const color = `rgba(${r},${g},${b},${a / 255})`
                      const key = `${x},${y}`
                      pixels.push({ x, y, color })
                      newSelectedPixels[key] = color
                    }
                  }
                }

                applyPixels(pixels)
                setSelectedPixels(newSelectedPixels)

                const newXs = Object.keys(newSelectedPixels).map(k => Number.parseInt(k.split(",")[0]))
                const newYs = Object.keys(newSelectedPixels).map(k => Number.parseInt(k.split(",")[1]))
                setSelectionBounds({
                  minX: Math.min(...newXs),
                  maxX: Math.max(...newXs),
                  minY: Math.min(...newYs),
                  maxY: Math.max(...newYs)
                })
              }
              return
            }
          }
        }
      } catch (error) {
        console.error("Error reading clipboard:", error)
      }
    }
  }

  const selectAll = (canvasWidth: number, canvasHeight: number, layerPixels: { [key: string]: string }) => {
    setSelectionBounds({
      minX: 0,
      maxX: canvasWidth - 1,
      minY: 0,
      maxY: canvasHeight - 1
    })
    const allPixels: { [key: string]: string } = {}
    Object.entries(layerPixels).forEach(([key, color]) => {
      allPixels[key] = color
    })
    setSelectedPixels(allPixels)
  }

  const deleteSelectedPixels = (applyPixels: (pixels: Array<{ x: number; y: number; color: string | null }>) => void) => {
    if (Object.keys(selectedPixels).length > 0) {
      const pixels: { x: number; y: number; color: string | null }[] = []
      Object.keys(selectedPixels).forEach((key) => {
        const [x, y] = key.split(",").map(Number)
        pixels.push({ x, y, color: null })
      })
      applyPixels(pixels)
      setSelectedPixels({})
      setSelectionBounds(null)
    }
  }

  const clearSelection = useMemo(() => () => {
    setSelectedPixels({})
    setSelectionBounds(null)
  }, [])
  const getTransformInfo = (activeTool: any, isDrawing: boolean) => {
    if (activeTool instanceof RotationTool && isDrawing) {
      return `Rotando: ${activeTool.getCurrentAngle().toFixed(1)}°`
    }
    if (activeTool instanceof ScaleTool && isDrawing) {
      return `Escalando: ${(activeTool.getCurrentScale() * 100).toFixed(1)}%`
    }
    return null
  }

  return {
    selectedPixels,
    setSelectedPixels,
    selectionBounds,
    setSelectionBounds,
    clipboard,
    setClipboard,
    showSelectionPreview,
    setShowSelectionPreview,
    magicWandTolerance,
    setMagicWandTolerance,
    handleCopy,
    handleCut,
    handlePaste,
    selectAll,
    deleteSelectedPixels,
    clearSelection,
    getTransformInfo,
  }
}

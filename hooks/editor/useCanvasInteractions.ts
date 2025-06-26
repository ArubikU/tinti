"use client"

import { BorderSelectionTool, MagicWandTool, MoveTool, RotationTool, ScaleTool, SelectionTool } from "@/lib/drawing-tools"
import { LayerManager } from "@/lib/pixel-engine"
import { PixelsUpdate } from "@/lib/websocket-ably"
import React from "react"

export function useCanvasInteractions(
  layerManager: LayerManager,
  user: any,
  canvasWidth: number,
  canvasHeight: number,
  sendMessage: (message: any) => void,
  activeTool: any,
  isDrawing: boolean,
  setIsDrawing: (drawing: boolean) => void,
  setPreviewPixels: (pixels: { [key: string]: string }) => void,
  selectedPixels: { [key: string]: string },
  setSelectedPixels: (pixels: { [key: string]: string }) => void,
  setSelectionBounds: (bounds: { minX: number; maxX: number; minY: number; maxY: number } | null) => void,
  updateMoment: () => void // Add updateMoment parameter
) {
  // Track the last cell position to implement throttling
  let lastCellPosition: { x: number; y: number } | null = null
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      if (e.touches.length === 0) return null
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
    }
    return { clientX: e.clientX, clientY: e.clientY }
  }

  let pendingPixels: Array<{ x: number; y: number; color: string | null }> = []
  let sendTimeout: NodeJS.Timeout | null = null

  const applyPixels = (pixels: Array<{ x: number; y: number; color: string | null }>) => {
    pixels.forEach(({ x, y, color }) => {
      if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
        layerManager.updatePixel(x, y, color)
      }
    })
    
    sendMessage({
      type: "pixels_update",
      data: {
        pixels: pixels.map(({ x, y, color }) => ({
          x,
          y,
          color,
          layer: layerManager.getActiveLayerIndex(),
          userId: user?.id || "anonymous",
          username: user?.username || "Anonymous",
        })),
        layer: layerManager.getActiveLayerIndex(),
      } as PixelsUpdate,
    })
  }

  const calculateSelectionBounds = (pixels: { [key: string]: string }) => {
    if (Object.keys(pixels).length === 0) return null
    
    const coords = Object.keys(pixels).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })
    
    const xs = coords.map(coord => coord.x)
    const ys = coords.map(coord => coord.y)
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  }
  const handleCanvasStart = (e: React.MouseEvent | React.TouchEvent, canvasRef: any) => {
    if (!activeTool || !canvasRef.current) return

    const eventPos = getEventPosition(e)
    if (!eventPos) return

    const pos = canvasRef.current.getPixelPosition(eventPos.clientX, eventPos.clientY)
    if (!pos) return

    // Reset throttling position when starting a new action
    lastCellPosition = { x: pos.x, y: pos.y }

    // Special handling for Magic Wand Tool
    if (activeTool instanceof MagicWandTool) {
      const similarPixels = activeTool.selectSimilar(pos, canvasWidth, canvasHeight)
      setSelectedPixels(similarPixels)
      
      if (Object.keys(similarPixels).length > 0) {
        const coords = Object.keys(similarPixels).map(key => {
          const [x, y] = key.split(',').map(Number)
          return { x, y }
        })
        const xs = coords.map(coord => coord.x)
        const ys = coords.map(coord => coord.y)
        
        setSelectionBounds({
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys)
        })
      }
      return
    }

    // Always set drawing state for all tools that need it
    setIsDrawing(true)
    const pixels = activeTool.onStart(pos)
    if (pixels.length > 0) {
      applyPixels(pixels)
    }
  }

  const handleCanvasMove = (e: React.MouseEvent | React.TouchEvent, canvasRef: any) => {
    if (!activeTool || !canvasRef.current) return

    const eventPos = getEventPosition(e)
    if (!eventPos) return

    const pos = canvasRef.current.getPixelPosition(eventPos.clientX, eventPos.clientY)
    if (!pos) return

    // Throttle based on cell position - only proceed if we're in a different cell
    const currentCellKey = `${pos.x},${pos.y}`
    const lastCellKey = lastCellPosition ? `${lastCellPosition.x},${lastCellPosition.y}` : null
    
    if (currentCellKey === lastCellKey) {
      return // Same cell, skip processing
    }
    
    // Update last cell position
    lastCellPosition = { x: pos.x, y: pos.y }

    if (isDrawing) {
      const pixels = activeTool.onMove(pos)
      if (pixels.length > 0) {
        applyPixels(pixels)
      }
    }    // Update preview for shape tools - check if getPreview accepts parameters
    try {
      const preview = activeTool.getPreview.length > 0 ? activeTool.getPreview(pos) : activeTool.getPreview()
      setPreviewPixels(preview)
    } catch (error) {
      setPreviewPixels({})
    }  }

  const handleCanvasMouseMove = (e: React.MouseEvent, canvasRef: any) => {
    if (!activeTool || !canvasRef.current) return

    const eventPos = getEventPosition(e)
    if (!eventPos) return

    const pos = canvasRef.current.getPixelPosition(eventPos.clientX, eventPos.clientY)
    if (!pos) return

    // Throttle based on cell position for cursor and preview updates
    const currentCellKey = `${pos.x},${pos.y}`
    const lastCellKey = lastCellPosition ? `${lastCellPosition.x},${lastCellPosition.y}` : null
    
    // Always update cursor, but throttle preview updates
    if ('getCursor' in activeTool) {
      const cursor = (activeTool as any).getCursor(pos)
      if (canvasRef.current.style.cursor !== cursor) {
        canvasRef.current.style.cursor = cursor
      }
    }

    // Only update preview if we're in a different cell and not drawing
    if (currentCellKey !== lastCellKey && !isDrawing) {
      lastCellPosition = { x: pos.x, y: pos.y }
      
      try {
        const preview = activeTool.getPreview.length > 0 ? activeTool.getPreview(pos) : activeTool.getPreview()
        setPreviewPixels(preview)
      } catch (error) {
        setPreviewPixels({})
      }
    }
  }

  const handleCanvasEnd = () => {
    if (!activeTool) return

    const pixels = activeTool.onEnd()
    if (pixels.length > 0) {
      applyPixels(pixels)
    }
    setIsDrawing(false)
    setPreviewPixels({})
    
    // Reset throttling position when ending an action
    lastCellPosition = null
      // Handle selection completion
    if (activeTool instanceof SelectionTool) {
      const bounds = activeTool.getSelectionBounds()
      if (bounds && activeTool.isValidSelection()) {
        setSelectionBounds(bounds)
        // Capture selected pixels
        const layer = layerManager.getActiveLayer()
        const selectedPixelsData: { [key: string]: string } = {}
        
        for (let x = bounds.minX; x <= bounds.maxX; x++) {
          for (let y = bounds.minY; y <= bounds.maxY; y++) {
            const pixelKey = `${x},${y}`
            const pixelColor = layer.pixels[pixelKey]
            if (pixelColor) {
              selectedPixelsData[pixelKey] = pixelColor
            }
          }
        }
        setSelectedPixels(selectedPixelsData)
      }
    } else if (activeTool instanceof BorderSelectionTool) {
      if (activeTool.hasSelectedPixels()) {
        const newSelectedPixels = activeTool.getSelectedPixels()
        setSelectedPixels(newSelectedPixels)
        setSelectionBounds(calculateSelectionBounds(newSelectedPixels))
      }
    }// Handle transformation tools completion - update selected pixels after transformation
    if (activeTool instanceof MoveTool) {
      if (activeTool.hasSelectedPixels()) {
        const newSelectedPixels = activeTool.getSelectedPixels()
        setSelectedPixels(newSelectedPixels)
        setSelectionBounds(calculateSelectionBounds(newSelectedPixels))
      }
    } else if (activeTool instanceof RotationTool) {
      if (activeTool.hasSelectedPixels()) {
        const newSelectedPixels = activeTool.getSelectedPixels()
        setSelectedPixels(newSelectedPixels)
        setSelectionBounds(calculateSelectionBounds(newSelectedPixels))
      }
    } else if (activeTool instanceof ScaleTool) {
      if (activeTool.hasSelectedPixels()) {
        const newSelectedPixels = activeTool.getSelectedPixels()
        setSelectedPixels(newSelectedPixels)
        setSelectionBounds(calculateSelectionBounds(newSelectedPixels))
      }
    }
    
    layerManager.saveToHistory()
    updateMoment() // Force re-render after drawing operation
  }
  const handleUndo = () => {
    const changedPixels = layerManager.undo()
    if (changedPixels) {
      sendMessage({
        type: "pixels_update",
        data: {
          pixels: changedPixels.map(({ x, y, color, layer }) => ({
            x,
            y,
            color,
            layer,
            userId: user?.id || "anonymous",
            username: user?.username || "Anonymous",
          })),
          layer: layerManager.getActiveLayerIndex(),
        } as PixelsUpdate,
      })
      setPreviewPixels({})
      updateMoment() // Force re-render after undo
    }
  }
  const handleRedo = () => {
    const changedPixels = layerManager.redo()
    if (changedPixels) {
      sendMessage({
        type: "pixels_update",
        data: {
          pixels: changedPixels.map(({ x, y, color, layer }) => ({
            x,
            y,
            color,
            layer,
            userId: user?.id || "anonymous",
            username: user?.username || "Anonymous",
          })),
          layer: layerManager.getActiveLayerIndex(),
        } as PixelsUpdate,
      })
      setPreviewPixels({})
      updateMoment() // Force re-render after redo
    }
  }
  const handlePinchZoom = (scale: number, center: { x: number; y: number }, zoom: number, setZoom: (zoom: number) => void) => {
    const newZoom = Math.max(4, Math.min(32, zoom * scale))
    setZoom(newZoom)
  }

  return {
    applyPixels,
    handleCanvasStart,
    handleCanvasMove,
    handleCanvasEnd,
    handleCanvasMouseMove,
    handleUndo,
    handleRedo,
    handlePinchZoom,
  }
}

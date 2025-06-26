"use client"

import { ToolType } from "@/components/editor/ToolPanel"
import { type BrushShape } from "@/lib/drawing-tools"
import { Layer, LayerManager } from "@/lib/pixel-engine"
import { useCallback, useMemo, useState } from "react"

interface ToolSettings {
  filled: boolean
  strokeWidth: number
  startColor: string
  endColor: string
  gradientType: string
  text: string
  fontSize: number
  density: number
  radius: number
  axis: string
  size: number
  opacity: number
  brushShape: BrushShape
  // Color replace settings
  mode: 'specific' | 'hue-shift' | 'palette-replace'
  targetColor: string
  newColor: string
  tolerance: number
  hueShift: number
  saturationAdjust: number
  lightnessAdjust: number
  apply: boolean
}

export function useEditorState(project: any) {
  // Core state
  const [layerManager] = useState(() => new LayerManager(
    project.data?.layers || [],
    project.data?.frames || []
  ))
  
  const [currentTool, setCurrentTool] = useState<ToolType>("pencil")
  const [currentColor, setCurrentColor] = useState("#A678FF")
  const [brushSize, setBrushSize] = useState(1)
  const [zoom, setZoom] = useState(16)
  const [showGrid, setShowGrid] = useState(true)
  const [showOnionSkin, setShowOnionSkin] = useState(false)
  const [onionSkinOpacity, setOnionSkinOpacity] = useState(0.3)
    // Canvas state
  const [canvasWidth, setCanvasWidth] = useState(project?.canvas_width || 32)
  const [canvasHeight, setCanvasHeight] = useState(project?.canvas_height || 32)
  const [previewPixels, setPreviewPixels] = useState<{ [key: string]: string }>({})
  // Tool settings
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    filled: false,
    strokeWidth: 1,
    startColor: "#A678FF",
    endColor: "#FFB6A6",
    gradientType: "linear",
    text: "Texto",
    fontSize: 8,
    density: 0.3,
    radius: 5,
    axis: "horizontal",
    size: 1,
    opacity: 1,
    brushShape: 'circle',
    // Color replace settings
    mode: 'specific',
    targetColor: "#000000",
    newColor: "#FFFFFF",
    tolerance: 0,
    hueShift: 0,
    saturationAdjust: 0,
    lightnessAdjust: 0,
    apply: false,
  })

  // Color palette
  const [colorPalette, setColorPalette] = useState<string[]>([
    "#000000", "#404040", "#808080", "#C0C0C0", "#FFFFFF",
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
    "#800000", "#008000", "#000080", "#808000", "#800080",
    "#A678FF", "#FFB6A6", "#A9FBD7", "#FF6B6B", "#4ECDC4", "#45B7D1",
    "#96CEB4", "#FFEAA7", "#DDA0DD", "#98FB98", "#F0E68C", "#FFB347",  ])  
    // Mobile state - start with false for SSR compatibility
  const [isMobile, setIsMobile] = useState(false)
    // State for layers and active layer - manage them directly to avoid LayerManager moment issues
  const [layersData, setLayersData] = useState<Layer[]>(() => layerManager.getLayers())
  const [activeLayerIndex, setActiveLayerIndex] = useState(() => layerManager.getActiveLayerIndex())
  
  // Moment counter to force re-renders when LayerManager state changes
  const [moment, setMoment] = useState(0)
  
  const updateMoment = useCallback(() => {
    // Update the local state with current LayerManager data
    setLayersData([...layerManager.getLayers()])
    setActiveLayerIndex(layerManager.getActiveLayerIndex())    // Increment moment to force re-renders
    setMoment(prev => prev + 1)
  }, [layerManager])
  
  return useMemo(() => ({
    // State
    layerManager,
    currentTool,
    setCurrentTool,
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    zoom,
    setZoom,
    showGrid,
    setShowGrid,
    showOnionSkin,
    setShowOnionSkin,
    onionSkinOpacity,
    setOnionSkinOpacity,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    previewPixels,
    setPreviewPixels,
    toolSettings,
    setToolSettings,
    colorPalette,
    setColorPalette,
    isMobile,
    setIsMobile,
    updateMoment,
    
    // Computed values
    layersData,
    activeLayerIndex,
    moment, // Include moment for re-renders
  }), [
    // Only include primitive values and the moment counter
    currentTool,
    currentColor,
    brushSize,
    zoom,
    showGrid,
    showOnionSkin,
    onionSkinOpacity,
    canvasWidth,
    canvasHeight,
    previewPixels,
    toolSettings,
    colorPalette,
    isMobile,
    layersData,
    activeLayerIndex,
    moment, // This will trigger re-renders when LayerManager changes
  ])
}

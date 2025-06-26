"use client"

import { ToolType } from "@/components/editor/ToolPanel"
import {
    BorderSelectionTool,
    BucketTool,
    CircleTool,
    ColorReplaceTool,
    EllipseTool,
    EraserTool,
    EyedropperTool,
    GradientTool,
    LineTool,
    MagicWandTool,
    MirrorTool,
    MoveTool,
    NoiseTool,
    PencilTool,
    RectangleTool,
    RotationTool,
    ScaleTool,
    SelectionTool,
    SprayTool,
    TextTool,
    type BrushShape,
    type ColorReplaceSettings,
    type DrawingTool,
} from "@/lib/drawing-tools"
import { LayerManager } from "@/lib/pixel-engine"
import { useCallback, useEffect, useState } from "react"

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

export function useDrawingTools(
  currentTool: ToolType,
  currentColor: string,
  toolSettings: ToolSettings,
  canvasWidth: number,
  canvasHeight: number,
  layerManager: LayerManager,
  selectedPixels: { [key: string]: string },
  magicWandTolerance: number,
  setCurrentColor: (color: string) => void
) {
  const [activeTool, setActiveTool] = useState<DrawingTool | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  
  // Memoize getPixelColor to avoid recreating on every render
  const getPixelColor = useCallback((x: number, y: number) => {
    const layer = layerManager.getActiveLayer()
    const key = `${x},${y}`
    return layer.pixels[key] || null
  }, [layerManager])

  // Initialize tool when currentTool changes (only depend on currentTool and layerManager)
  useEffect(() => {
    switch (currentTool) {
      case "pencil":
        const pencilTool = new PencilTool(currentColor, toolSettings.size, toolSettings.opacity)
        pencilTool.setPixelColorGetter(getPixelColor)
        pencilTool.setBrushShape(toolSettings.brushShape)
        setActiveTool(pencilTool)
        break
      case "eraser":
        setActiveTool(new EraserTool(currentColor, toolSettings.size))
        break
      case "line":
        const lineTool = new LineTool(currentColor, toolSettings.size)
        lineTool.setOpacity(toolSettings.opacity)
        lineTool.setPixelColorGetter(getPixelColor)
        setActiveTool(lineTool)
        break
      case "rectangle":
        const rectTool = new RectangleTool(currentColor, toolSettings.size, toolSettings.filled)
        rectTool.setOpacity(toolSettings.opacity)
        rectTool.setPixelColorGetter(getPixelColor)
        setActiveTool(rectTool)
        break
      case "circle":
        const circleTool = new CircleTool(currentColor, toolSettings.size, toolSettings.filled)
        circleTool.setOpacity(toolSettings.opacity)
        circleTool.setPixelColorGetter(getPixelColor)
        setActiveTool(circleTool)
        break
      case "ellipse":
        const ellipseTool = new EllipseTool(currentColor, toolSettings.size, toolSettings.filled)
        ellipseTool.setOpacity(toolSettings.opacity)
        ellipseTool.setPixelColorGetter(getPixelColor)
        setActiveTool(ellipseTool)
        break
      case "bucket":
        const bucketTool = new BucketTool(currentColor, canvasWidth, canvasHeight, getPixelColor, 1, toolSettings.opacity)
        setActiveTool(bucketTool)
        break
      case "spray":
        const sprayTool = new SprayTool(currentColor, toolSettings.radius)
        sprayTool.setDensity(toolSettings.density)
        sprayTool.setOpacity(toolSettings.opacity)
        sprayTool.setPixelColorGetter(getPixelColor)
        setActiveTool(sprayTool)
        break
      case "eyedropper":
        setActiveTool(new EyedropperTool(currentColor, getPixelColor, setCurrentColor))
        break      
      case "select":
        setActiveTool(new SelectionTool(currentColor))
        break
      case "border-select":
        const borderSelectionTool = new BorderSelectionTool(currentColor)
        borderSelectionTool.setPixelColorGetter(getPixelColor)
        setActiveTool(borderSelectionTool)
        break
      case "move":
        const moveTool = new MoveTool(currentColor)
        moveTool.setSelectedPixels(selectedPixels)
        setActiveTool(moveTool)
        break
      case "magic-wand":
        setActiveTool(new MagicWandTool(currentColor, getPixelColor, magicWandTolerance))
        break
      case "rotate":
        const rotateTool = new RotationTool(currentColor)
        rotateTool.setSelectedPixels(selectedPixels)
        setActiveTool(rotateTool)
        break
      case "scale":
        const scaleTool = new ScaleTool(currentColor)
        scaleTool.setSelectedPixels(selectedPixels)
        setActiveTool(scaleTool)
        break
      case "text":
        const textTool = new TextTool(currentColor)
        textTool.setText(toolSettings.text)
        textTool.setFontSize(toolSettings.fontSize)
        setActiveTool(textTool)
        break
      case "noise":
        const noiseTool = new NoiseTool(currentColor)
        noiseTool.setDensity(toolSettings.density)
        setActiveTool(noiseTool)
        break
      case "mirror":
        const mirrorTool = new MirrorTool(currentColor)
        mirrorTool.setAxis(toolSettings.axis as "horizontal" | "vertical")
        mirrorTool.setCenter(Math.floor(canvasWidth / 2), Math.floor(canvasHeight / 2))
        setActiveTool(mirrorTool)
        break
      case "gradient":
        const gradientTool = new GradientTool(toolSettings.startColor)
        gradientTool.setEndColor(toolSettings.endColor)
        gradientTool.setGradientType(toolSettings.gradientType as "linear" | "radial")
        setActiveTool(gradientTool)
        break
      case "color-replace":
        const colorReplaceSettings: ColorReplaceSettings = {
          mode: toolSettings.mode,
          targetColor: toolSettings.targetColor,
          newColor: toolSettings.newColor,
          tolerance: toolSettings.tolerance,
          hueShift: toolSettings.hueShift,
          saturationAdjust: toolSettings.saturationAdjust,
          lightnessAdjust: toolSettings.lightnessAdjust
        }
        const colorReplaceTool = new ColorReplaceTool(currentColor, colorReplaceSettings)
        colorReplaceTool.setPixelColorGetter(getPixelColor)
        // Set up the replace function to use the pixel engine's method
        colorReplaceTool.setReplaceFunction((oldColor: string, newColor: string) => {
          // This should be called from the parent component that has access to pixel engine
          console.log('Replace color:', oldColor, 'with:', newColor)
        })
        setActiveTool(colorReplaceTool)
        break
      default:
        setActiveTool(null)
    }
  }, [currentTool, getPixelColor, canvasWidth, canvasHeight, setCurrentColor])

  // Update tool properties when they change (separate effect to avoid recreating tools)
  useEffect(() => {
    if (!activeTool) return

    // Update color for all tools
    activeTool.setColor(currentColor)
    
    // Update size for tools that support it
    if ('setSize' in activeTool) {
      (activeTool as any).setSize(toolSettings.size)
    }
    
    // Update opacity for tools that support it
    if ('setOpacity' in activeTool) {
      (activeTool as any).setOpacity(toolSettings.opacity)
    }
    
    // Update brush shape for PencilTool
    if (activeTool instanceof PencilTool) {
      activeTool.setBrushShape(toolSettings.brushShape)
    }

    // Update filled property for shape tools
    if ('setFilled' in activeTool) {
      (activeTool as any).setFilled(toolSettings.filled)
    }

    // Update specific tool properties
    if (activeTool instanceof SprayTool) {
      activeTool.setDensity(toolSettings.density)
    }

    if (activeTool instanceof TextTool) {
      activeTool.setText(toolSettings.text)
      activeTool.setFontSize(toolSettings.fontSize)
    }

    if (activeTool instanceof NoiseTool) {
      activeTool.setDensity(toolSettings.density)
    }

    if (activeTool instanceof MirrorTool) {
      activeTool.setAxis(toolSettings.axis as "horizontal" | "vertical")
      activeTool.setCenter(Math.floor(canvasWidth / 2), Math.floor(canvasHeight / 2))
    }

    if (activeTool instanceof GradientTool) {
      activeTool.setEndColor(toolSettings.endColor)
      activeTool.setGradientType(toolSettings.gradientType as "linear" | "radial")
    }

    if (activeTool instanceof ColorReplaceTool) {
      const colorReplaceSettings: ColorReplaceSettings = {
        mode: toolSettings.mode,
        targetColor: toolSettings.targetColor,
        newColor: toolSettings.newColor,
        tolerance: toolSettings.tolerance,
        hueShift: toolSettings.hueShift,
        saturationAdjust: toolSettings.saturationAdjust,
        lightnessAdjust: toolSettings.lightnessAdjust
      }
      activeTool.updateSettings(colorReplaceSettings)
    }

    // Handle apply trigger for color replace tool
    if (activeTool instanceof ColorReplaceTool && toolSettings.apply) {
      // Get unique colors from the canvas
      const uniqueColors = layerManager.layers
        .flatMap(layer => Object.values(layer.pixels))
        .filter((color, index, self) => color && self.indexOf(color) === index)
      
      activeTool.executeReplace(uniqueColors)
      
      // Reset apply flag (this should be handled by the parent component)
      console.log('Color replace applied')
    }

    if (activeTool instanceof MagicWandTool) {
      activeTool.setTolerance(magicWandTolerance)
    }    // Update selected pixels for transformation tools
    if (activeTool instanceof MoveTool || activeTool instanceof RotationTool || activeTool instanceof ScaleTool) {
      (activeTool as any).setSelectedPixels(selectedPixels)
    }

    // Set selection mask for all tools to respect selection boundaries
    if (activeTool && 'setSelectionMask' in activeTool) {
      (activeTool as any).setSelectionMask(selectedPixels)
    }
  }, [activeTool, currentColor, toolSettings, canvasWidth, canvasHeight, selectedPixels, magicWandTolerance, layerManager])

  // Function to set up color replace functionality
  const setupColorReplace = useCallback((replaceFunction: (oldColor: string, newColor: string) => void) => {
    if (activeTool instanceof ColorReplaceTool) {
      activeTool.setReplaceFunction(replaceFunction)
    }
  }, [activeTool])

  return {
    activeTool,
    isDrawing,
    setIsDrawing,
    setupColorReplace,
  }
}

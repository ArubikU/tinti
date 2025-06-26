"use client"

import { averageColors } from "@/lib/drawing-tools/types"
import { LayerManager } from "@/lib/pixel-engine"
import { useCallback } from "react"
import { useExportService } from "./useExportService"

export function useProjectOperations(
  project: any,
  user: any,
  layerManager: LayerManager,
  canvasWidth: number,
  canvasHeight: number,
  colorPalette: string[],
  onSave: (data: any) => void,
  setCurrentProject?: (project: any) => void,
  sendMessage?: (message: any) => void,
  updateMoment?: () => void,
  setCanvasWidth?: (width: number) => void,
  setCanvasHeight?: (height: number) => void
) {
  // Use the centralized export service
  const exportService = useExportService({
    project,
    user,
    layerManager,
    canvasWidth,
    canvasHeight,
    colorPalette
  })

  const handleExport = useCallback(() => {
    exportService.exportAsPNG()
  }, [exportService])

  const handleExportTin = useCallback(() => {
    exportService.exportAsTIN()
  }, [exportService])
  
  const handleSave = useCallback(async () => {
    if (!project) return
    
    // Generate thumbnail using the export service
    const base64Image = exportService.generateThumbnail()

    // Prepare all frame data
    const framesData = {
      frames: layerManager.frames.map((frame, index) => ({
        id: frame.id,
        name: frame.name,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          pixels: layer.pixels
        }))
      })),
      currentFrame: layerManager.getCurrentFrame()
    }

    const projectData = {
      title: project.title,
      description: project.description,
      is_public: project.is_public,
      is_collaborative: project.is_collaborative,
      data: {
        layers: layerManager.getLayers().map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          pixels: layer.pixels
        })),
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        palette: colorPalette,
        frames: framesData.frames,
        currentFrame: framesData.currentFrame
      },
      thumbnail_url: base64Image
    }

    await onSave(projectData)
  }, [exportService, layerManager, canvasWidth, canvasHeight, colorPalette, onSave, project])

  const handleProjectUpdate = useCallback((updates: any) => {
    if (setCurrentProject) {
      setCurrentProject(updates)
    }
  }, [setCurrentProject])

const handleCanvasResize = useCallback((
  width: number,
  height: number,
  method: "stretch" | "crop" | "pad",
  skipWebSocket: boolean = false,
  align: "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right" = "center"
) => {
  layerManager.saveToHistory()

  const currentLayers = layerManager.getLayers()
  const currentWidth = canvasWidth
  const currentHeight = canvasHeight

  if (currentWidth === width && currentHeight === height) return

  const getOffset = () => {
    const dx = width - currentWidth
    const dy = height - currentHeight

    const offsetX = {
      "left": 0,
      "center": Math.floor(dx / 2),
      "right": dx,
    }

    const offsetY = {
      "top": 0,
      "center": Math.floor(dy / 2),
      "bottom": dy,
    }

    const [vertical, horizontal] = align.includes("-")
      ? align.split("-")
      : align === "center"
      ? ["center", "center"]
      : ["center", align]

    return {
      offsetX: offsetX[horizontal as keyof typeof offsetX] || 0,
      offsetY: offsetY[vertical as keyof typeof offsetY] || 0
    }
  }

  const applyResize = (layer: any) => {
    const newPixels: { [key: string]: string } = {}
    const { offsetX, offsetY } = getOffset()

    Object.entries(layer.pixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      let newX: number = x, newY: number = y

      switch (method) {
        case "stretch": {
          // Calcular escalas
          const scaleX = width / currentWidth
          const scaleY = height / currentHeight
          
          if (scaleX >= 1 && scaleY >= 1) {
            // AGRANDAR: Interpolar/duplicar píxeles
            for (let newY = 0; newY < height; newY++) {
              for (let newX = 0; newX < width; newX++) {
                // Encontrar píxel original correspondiente
                const origX = Math.floor(newX / scaleX)
                const origY = Math.floor(newY / scaleY)
                const origKey = `${origX},${origY}`
                
                if (layer.pixels[origKey]) {
                  newPixels[`${newX},${newY}`] = layer.pixels[origKey]
                }
              }
            }
          } else {
            // ACHICAR: Agrupar y promediar colores
            const pixelGroups: { [key: string]: string[] } = {}
            
            // Agrupar píxeles originales por su nueva posición
            Object.entries(layer.pixels).forEach(([key, color]) => {
              const [x, y] = key.split(",").map(Number)
              const newX = Math.floor(x * scaleX)
              const newY = Math.floor(y * scaleY)
              
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const newKey = `${newX},${newY}`
                if (!pixelGroups[newKey]) pixelGroups[newKey] = []
                pixelGroups[newKey].push(color as string)
              }
            })
            
            // Promediar colores para cada grupo
            Object.entries(pixelGroups).forEach(([key, colors]) => {
              newPixels[key] = averageColors(colors)
            })
          }
          
          // No procesar más píxeles ya que el stretch se maneja completamente aquí
          return
        }

        case "crop":
          // Se mantiene, pero se puede alinear con offset
          newX = x + offsetX
          newY = y + offsetY
          break
        case "pad":
          newX = x + offsetX
          newY = y + offsetY
          break
      }

      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        newPixels[`${newX},${newY}` as any] = color as any
      }
    })

    layer.pixels = newPixels
  }

  currentLayers.forEach(applyResize)

  layerManager.frames.forEach(frame => {
    frame.layers.forEach(applyResize)
  })

  console.log(`Canvas redimensionado de ${currentWidth}x${currentHeight} a ${width}x${height} usando método: ${method} con alineación: ${align}`)

  if (setCurrentProject) {
    setCurrentProject({
      ...project,
      canvas_width: width,
      canvas_height: height,
    })
  }

  setCanvasWidth?.(width)
  setCanvasHeight?.(height)
  updateMoment?.()

  if (!skipWebSocket && sendMessage && project?.is_collaborative) {
    sendMessage({
      type: "canvas_resize",
      data: {
        width,
        height,
        method,
        previousWidth: currentWidth,
        previousHeight: currentHeight,
        userId: user?.id,
        username: user?.username,
        align,
        timestamp: Date.now()
      }
    })
  }
}, [
  layerManager,
  canvasWidth,
  canvasHeight,
  sendMessage,
  project?.is_collaborative,
  user?.id,
  user?.username,
  setCurrentProject,
  project,
  updateMoment,
  setCanvasWidth,
  setCanvasHeight
])


  return {
    handleExport,
    handleExportTin,
    handleSave,
    handleProjectUpdate,
    handleCanvasResize,
    // Expose the export service for global access
    exportService
  }
}

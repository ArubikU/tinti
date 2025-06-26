"use client"

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
          locked: layer.locked,
          pixels: layer.pixels
        }))
      })),
      currentFrame: layerManager.getCurrentFrameIndex(),
      animationFps: layerManager.getAnimationFps()
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
          locked: layer.locked,
          pixels: layer.pixels
        })),
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        palette: colorPalette,
        frames: framesData.frames,
        currentFrame: framesData.currentFrame,
        animationFps: framesData.animationFps
      },
      thumbnail_url: base64Image
    }

    await onSave(projectData)
  }, [exportService, layerManager, canvasWidth, canvasHeight, colorPalette, onSave])

  const handleProjectUpdate = useCallback((updates: any) => {
    if (setCurrentProject) {
      setCurrentProject(updates)
    }
  }, [setCurrentProject])

  const handleCanvasResize = useCallback((width: number, height: number, method: "stretch" | "crop" | "pad", skipWebSocket: boolean = false) => {
    layerManager.saveToHistory()
    
    const currentLayers = layerManager.getLayers()
    const currentWidth = canvasWidth
    const currentHeight = canvasHeight
    
    // Si no hay cambio en las dimensiones, no hacer nada
    if (currentWidth === width && currentHeight === height) {
      return
    }
    
    // Aplicar el redimensionamiento a cada capa
    currentLayers.forEach(layer => {
      const newPixels: { [key: string]: string } = {}
      
      Object.entries(layer.pixels).forEach(([key, color]) => {
        const [x, y] = key.split(",").map(Number)
        let newX: number, newY: number
        
        switch (method) {
          case "stretch":
            // Estirar/contraer proporcionalmente
            newX = Math.round((x / currentWidth) * width)
            newY = Math.round((y / currentHeight) * height)
            
            // Asegurar que está dentro de los límites
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
              newPixels[`${newX},${newY}`] = color
            }
            break
            
          case "crop":
            // Mantener posición, recortar si excede los nuevos límites
            newX = x
            newY = y
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
              newPixels[`${newX},${newY}`] = color
            }
            break
            
          case "pad":
            // Centrar el contenido existente en el nuevo canvas
            const offsetX = Math.floor((width - currentWidth) / 2)
            const offsetY = Math.floor((height - currentHeight) / 2)
            
            newX = x + offsetX
            newY = y + offsetY
            
            // Solo incluir si está dentro de los nuevos límites
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
              newPixels[`${newX},${newY}`] = color
            }
            break
        }
      })
      
      // Actualizar los píxeles de la capa
      layer.pixels = newPixels
    })
    
    // Aplicar el mismo redimensionamiento a todos los frames
    const frames = layerManager.frames
    frames.forEach(frame => {
      frame.layers.forEach(layer => {
        const newPixels: { [key: string]: string } = {}
        
        Object.entries(layer.pixels).forEach(([key, color]) => {
          const [x, y] = key.split(",").map(Number)
          let newX: number, newY: number
          
          switch (method) {
            case "stretch":
              newX = Math.round((x / currentWidth) * width)
              newY = Math.round((y / currentHeight) * height)
              
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                newPixels[`${newX},${newY}`] = color
              }
              break
              
            case "crop":
              newX = x
              newY = y
              
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                newPixels[`${newX},${newY}`] = color
              }
              break
              
            case "pad":
              const offsetX = Math.floor((width - currentWidth) / 2)
              const offsetY = Math.floor((height - currentHeight) / 2)
              
              newX = x + offsetX
              newY = y + offsetY
              
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                newPixels[`${newX},${newY}`] = color
              }
              break
          }
        })
        
        layer.pixels = newPixels
      })
    })
    
    console.log(`Canvas redimensionado de ${currentWidth}x${currentHeight} a ${width}x${height} usando método: ${method}`)
    
    // Actualizar las dimensiones del proyecto
    if (setCurrentProject) {
      setCurrentProject({
        ...project,
        canvas_width: width,
        canvas_height: height,
      })
    }
    
    // Actualizar las dimensiones en el estado del editor
    if (setCanvasWidth) {
      setCanvasWidth(width)
    }
    if (setCanvasHeight) {
      setCanvasHeight(height)
    }
    
    // Forzar re-renderizado del canvas
    if (updateMoment) {
      updateMoment()
    }
    
    // Enviar evento de websocket para notificar a otros usuarios (solo si no viene de un evento remoto)
    if (!skipWebSocket && sendMessage && project.is_collaborative) {
      sendMessage({
        type: "canvas_resize",
        data: {
          width,
          height,
          method,
          previousWidth: currentWidth,
          previousHeight: currentHeight,
          userId: user.id,
          username: user.username,
          timestamp: Date.now()
        }
      })
    }
  }, [
    layerManager,
    canvasWidth,
    canvasHeight,
    sendMessage,
    project.is_collaborative,
    user.id,
    user.username,
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

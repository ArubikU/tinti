"use client"

import { exportAnimationAsImages, exportFrameAsImage } from "@/lib/animation-export"
import { downloadTinFile } from "@/lib/file"
import type { LayerManager } from "@/lib/pixel-engine"

export interface ExportOptions {
  project: {
    id: string
    title: string
    description?: string
  }
  user?: {
    id: string
    username: string
    display_name?: string
  }
  canvas: {
    width: number
    height: number
  }
  layerManager: LayerManager
  colorPalette: string[]
}

export class ExportService {
  private static instance: ExportService
  
  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService()
    }
    return ExportService.instance
  }

  /**
   * Exporta el proyecto como PNG
   */
  exportAsPNG(options: ExportOptions): void {
    const { project, canvas, layerManager } = options
    
    const canvasElement = document.createElement("canvas")
    canvasElement.width = canvas.width
    canvasElement.height = canvas.height
    const ctx = canvasElement.getContext("2d")!

    // Render all visible layers
    layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity
        Object.entries(layer.pixels).forEach(([key, color]) => {
          const [x, y] = key.split(",").map(Number)
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        })
        ctx.globalAlpha = 1
      }
    })

    // Download as PNG
    const link = document.createElement("a")
    link.download = `${project.title}.png`
    link.href = canvasElement.toDataURL()
    link.click()
  }

  /**
   * Exporta el proyecto como archivo .tin
   */
  exportAsTIN(options: ExportOptions): void {
    const { project, canvas, layerManager, colorPalette, user } = options
    
    // Export frames data
    const framesData = layerManager.exportFramesData()

    const projectData = {
      title: project.title,
      description: project.description,
      canvas_width: canvas.width,
      canvas_height: canvas.height,
      layers_data: layerManager.getLayers(),
      frames_data: framesData.frames.length > 1 ? framesData.frames : undefined,
      color_palette: colorPalette,
      author: user?.display_name || user?.username || "Usuario"
    }
    
    downloadTinFile(projectData)
  }

  /**
   * Exporta una animación como secuencia de imágenes PNG
   */
  exportAnimationAsImages(options: ExportOptions & { scale?: number }): void {
    const { canvas, layerManager, scale = 8 } = options
    const frames = layerManager.frames
    
    exportAnimationAsImages(frames, canvas.width, canvas.height, scale)
  }

  /**
   * Exporta un frame específico como imagen
   */
  exportFrameAsImage(options: ExportOptions & { 
    frameIndex: number
    scale?: number 
    filename?: string 
  }): void {
    const { canvas, layerManager, frameIndex, scale = 8, filename, project } = options
    const frames = layerManager.frames
    
    if (frames[frameIndex]) {
      const customFilename = filename || `${project.title}-${frames[frameIndex].name}.png`
      exportFrameAsImage(frames[frameIndex], canvas.width, canvas.height, scale, customFilename)
    }
  }

  /**
   * Genera un thumbnail del proyecto
   */
  generateThumbnail(options: ExportOptions): string {
    const { canvas, layerManager } = options
    
    const canvasElement = document.createElement("canvas")
    canvasElement.width = canvas.width
    canvasElement.height = canvas.height
    const ctx = canvasElement.getContext("2d")!
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Render all visible layers
    layerManager.getLayers().forEach((layer) => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity
        Object.entries(layer.pixels).forEach(([key, color]) => {
          const [x, y] = key.split(",").map(Number)
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        })
        ctx.globalAlpha = 1
      }
    })
    
    return canvasElement.toDataURL("image/png")
  }
  /**
   * Exporta usando la API del servidor (para usar desde cualquier lugar)
   */  async exportViaAPI(projectId: string, format: "png" | "jpg" | "webp" | "tint" = "png"): Promise<void> {
    try {
      console.log(`Iniciando exportación vía API: ${projectId}, formato: ${format}`)
      const response = await fetch(`/api/projects/${projectId}/export?format=${format}`)
      
      console.log(`Respuesta de la API: status ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error en la respuesta de la API: ${response.status} - ${errorText}`)
        throw new Error(`Error al exportar el proyecto: ${response.status} - ${errorText}`)
      }      const blob = await response.blob()
      console.log(`Blob creado: ${blob.size} bytes, tipo: ${blob.type}`)
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `export.${format}`
      document.body.appendChild(link) // Asegurar que el link esté en el DOM
      link.click()
      document.body.removeChild(link) // Limpiar el DOM
      
      URL.revokeObjectURL(url)
      console.log(`Exportación completada exitosamente`)
    } catch (error) {
      console.error("Error en exportación via API:", error)
      throw error
    }
  }

  /**
   * Exporta proyecto como archivo .tin usando la API
   */  async exportAsTintViaAPI(projectId: string, filename?: string): Promise<void> {
    try {
      console.log(`Iniciando exportación .tin vía API: ${projectId}`)
      const response = await fetch(`/api/projects/${projectId}/export?format=tint`)
      
      console.log(`Respuesta de la API .tin: status ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error en la respuesta de la API .tin: ${response.status} - ${errorText}`)
        throw new Error(`Error al exportar archivo .tin: ${response.status} - ${errorText}`)
      }

      const blob = await response.blob()
      console.log(`Blob .tin creado: ${blob.size} bytes, tipo: ${blob.type}`)
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename || `project.tin`
      document.body.appendChild(link) // Asegurar que el link esté en el DOM
      link.click()
      document.body.removeChild(link) // Limpiar el DOM
      
      URL.revokeObjectURL(url)
      console.log(`Exportación .tin completada exitosamente`)
    } catch (error) {
      console.error("Error en exportación .tin via API:", error)
      throw error
    }
  }
}

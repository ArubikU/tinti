"use client"

import type { Frame } from "@/lib/pixel-engine"

// Función para crear un canvas de un frame específico
export function createFrameCanvas(frame: Frame, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  
  // Limpiar con fondo transparente
  ctx.clearRect(0, 0, width, height)
  
  // Renderizar todas las capas visibles del frame
  frame.layers.forEach((layer) => {
    if (layer.visible) {
      ctx.globalAlpha = layer.opacity
      Object.entries(layer.pixels).forEach(([key, color]) => {
        const [x, y] = key.split(",").map(Number)
        if (x >= 0 && x < width && y >= 0 && y < height) {
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        }
      })
      ctx.globalAlpha = 1
    }
  })
  
  return canvas
}

// Función para crear un canvas escalado para mejor visualización
export function createScaledFrameCanvas(frame: Frame, width: number, height: number, scale: number = 8): HTMLCanvasElement {
  const baseCanvas = createFrameCanvas(frame, width, height)
  const scaledCanvas = document.createElement("canvas")
  scaledCanvas.width = width * scale
  scaledCanvas.height = height * scale
  
  const ctx = scaledCanvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(baseCanvas, 0, 0, width * scale, height * scale)
  
  return scaledCanvas
}

// Función para exportar una animación como secuencia de imágenes PNG
export function exportAnimationAsImages(frames: Frame[], width: number, height: number, scale: number = 8) {
  frames.forEach((frame, index) => {
    const canvas = createScaledFrameCanvas(frame, width, height, scale)
    const link = document.createElement("a")
    link.download = `frame-${index.toString().padStart(3, "0")}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  })
}

// Función para crear un preview de la animación en un canvas
export function createAnimationPreview(
  frames: Frame[], 
  width: number, 
  height: number, 
  canvas: HTMLCanvasElement,
  scale: number = 1,
  onFrameChange?: (frameIndex: number) => void
): () => void {
  let currentFrameIndex = 0
  let animationId: number | null = null
  let lastFrameTime = 0
  
  const ctx = canvas.getContext("2d")!
  canvas.width = width * scale
  canvas.height = height * scale
  ctx.imageSmoothingEnabled = false
  
  const animate = (timestamp: number) => {
    if (frames.length === 0) return
    
    const currentFrame = frames[currentFrameIndex]
    
    if (timestamp - lastFrameTime >= currentFrame.duration) {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Renderizar frame actual
      currentFrame.layers.forEach((layer) => {
        if (layer.visible) {
          ctx.globalAlpha = layer.opacity
          Object.entries(layer.pixels).forEach(([key, color]) => {
            const [x, y] = key.split(",").map(Number)
            if (x >= 0 && x < width && y >= 0 && y < height) {
              ctx.fillStyle = color
              ctx.fillRect(x * scale, y * scale, scale, scale)
            }
          })
          ctx.globalAlpha = 1
        }
      })
      
      // Avanzar al siguiente frame
      currentFrameIndex = (currentFrameIndex + 1) % frames.length
      lastFrameTime = timestamp
      
      // Notificar cambio de frame
      if (onFrameChange) {
        onFrameChange(currentFrameIndex)
      }
    }
    
    animationId = requestAnimationFrame(animate)
  }
  
  // Iniciar animación
  animationId = requestAnimationFrame(animate)
  
  // Retornar función para detener la animación
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
}

// Función para calcular la duración total de la animación
export function getAnimationDuration(frames: Frame[]): number {
  return frames.reduce((total, frame) => total + frame.duration, 0)
}

// Función para obtener información de la animación
export function getAnimationInfo(frames: Frame[]) {
  const totalDuration = getAnimationDuration(frames)
  const fps = frames.length > 0 ? (1000 / (totalDuration / frames.length)) : 0
  
  return {
    frameCount: frames.length,
    totalDuration,
    averageFps: Math.round(fps * 10) / 10,
    averageFrameDuration: frames.length > 0 ? Math.round(totalDuration / frames.length) : 0
  }
}

// Función para exportar frame único como imagen
export function exportFrameAsImage(frame: Frame, width: number, height: number, scale: number = 8, filename?: string) {
  const canvas = createScaledFrameCanvas(frame, width, height, scale)
  const link = document.createElement("a")
  link.download = filename || `${frame.name.toLowerCase().replace(/\s+/g, "-")}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

// Función para validar frames antes de exportar
export function validateFrames(frames: Frame[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (frames.length === 0) {
    errors.push("No hay frames para exportar")
  }
  
  frames.forEach((frame, index) => {
    if (frame.duration <= 0) {
      errors.push(`Frame ${index + 1} tiene duración inválida`)
    }
    
    if (frame.layers.length === 0) {
      errors.push(`Frame ${index + 1} no tiene capas`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

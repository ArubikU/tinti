"use client"

import { deflate } from "pako"
import type { TinFile, TinFileV1Data } from "./tin-reader"

/**
 * Crea un archivo .tin v1.0 desde datos del proyecto
 */
export function createTinFileV1(projectData: {
  title: string
  description?: string
  canvas_width: number
  canvas_height: number
  layers_data: any[]
  frames_data?: any[]
  color_palette?: string[]
  author?: string
}): TinFile {
  const data: TinFileV1Data = {
    canvas_width: projectData.canvas_width,
    canvas_height: projectData.canvas_height,
    layers: projectData.layers_data.map(layer => ({
      name: layer.name || "Capa",
      visible: layer.visible !== false,
      opacity: layer.opacity || 1,
      pixels: layer.pixels || {}
    }))
  }

  // Agregar frames si existen
  if (projectData.frames_data && projectData.frames_data.length > 0) {
    data.frames = projectData.frames_data.map(frame => ({
      layers: frame.layers || data.layers,
      duration: frame.duration || 500
    }))
  }

  // Agregar paleta de colores si existe
  if (projectData.color_palette && projectData.color_palette.length > 0) {
    data.color_palette = projectData.color_palette
  }
  return {
    version: "1.0",
    metadata: {
      title: projectData.title,
      author: projectData.author || "Usuario",
      date: new Date().toISOString(),
      description: projectData.description || projectData.title
    },
    data
  }
}

/**
 * Escribe un archivo .tin como buffer comprimido
 */
export function writeTinFile(tinFile: TinFile): ArrayBuffer {
  try {
    // Convertir a JSON
    const jsonString = JSON.stringify(tinFile)
    
    // Comprimir con zlib (pako)
    const compressed = deflate(jsonString)
      return new Uint8Array(compressed).buffer
  } catch (error) {
    throw new Error(`Error al escribir archivo .tin: ${error}`)
  }
}

/**
 * Crea y descarga un archivo .tin desde datos del proyecto
 */
export function downloadTinFile(projectData: {
  title: string
  description?: string
  canvas_width: number
  canvas_height: number
  layers_data: any[]
  frames_data?: any[]
  color_palette?: string[]
  author?: string
}): void {
  const tinFile = createTinFileV1(projectData)
  const buffer = writeTinFile(tinFile)
  
  // Crear blob y descargar
  const blob = new Blob([buffer], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = `${projectData.title.replace(/[^a-zA-Z0-9]/g, "_")}.tin`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}

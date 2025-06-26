"use client"

import { inflate } from "pako"

export interface TinFileMetadata {
  title?: string
  author?: string
  date?: string
  description?: string
  [key: string]: any
}

export interface TinFile {
  version: string
  metadata: TinFileMetadata
  data: any
}

export interface TinFileV1Data {
  canvas_width: number
  canvas_height: number
  layers: Array<{
    id?: number
    name: string
    visible: boolean
    opacity: number
    pixels: Record<string, string>
  }>
  frames?: Array<{
    id?: number
    name?: string
    layers: Array<{
      id?: number
      name: string
      visible: boolean
      opacity: number
      pixels: Record<string, string>
    }>
    duration?: number
  }>
  color_palette?: string[]
}

/**
 * Lee un archivo .tin desde un buffer
 */
export async function readTinFile(buffer: ArrayBuffer): Promise<TinFile> {
  try {
    const uint8Array = new Uint8Array(buffer)
    let jsonString: string
    
    // Intentar primero como JSON sin comprimir
    try {
      jsonString = new TextDecoder().decode(uint8Array)
      JSON.parse(jsonString) // Verificar que sea JSON válido
    } catch {
      // Si falla, intentar descomprimir con zlib (pako)
      try {
        jsonString = inflate(uint8Array, { to: "string" })
      } catch (pakoError) {
        throw new Error(`No se pudo leer el archivo: ni como JSON directo ni como archivo comprimido`)
      }
    }    // Parsear JSON
    const data = JSON.parse(jsonString)
    
    // Validar estructura básica
    if (!data.version || !data.metadata || !data.data) {
      throw new Error("Estructura de archivo .tin inválida")
    }
    
    return data as TinFile
  } catch (error) {
    throw new Error(`Error al leer archivo .tin: ${error}`)
  }
}

/**
 * Lee un archivo .tin v1.0 y lo convierte al formato del proyecto
 */
export function readTinFileV1(tinFile: TinFile): TinFileV1Data {
  if (tinFile.version !== "1.0") {
    throw new Error(`Versión no soportada: ${tinFile.version}`)
  }
  
  const data = tinFile.data as TinFileV1Data
  
  // Validar datos requeridos
  if (!data.canvas_width || !data.canvas_height || !data.layers) {
    throw new Error("Datos requeridos faltantes en archivo .tin v1.0")
  }
  
  return data
}

/**
 * Convierte los datos de un archivo .tin v1.0 a un proyecto
 */
export function tinFileToProject(tinFile: TinFile): {
  title: string
  description?: string
  canvas_width: number
  canvas_height: number
  layers_data: any
  frames_data?: any
  color_palette?: string[]
} {  const data = readTinFileV1(tinFile)
  
  const result = {
    title: tinFile.metadata.title || tinFile.metadata.description || "Proyecto importado",
    description: tinFile.metadata.description,
    canvas_width: data.canvas_width,
    canvas_height: data.canvas_height,
    layers_data: data.layers.map((layer, index) => ({
      id: layer.id || index,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      pixels: layer.pixels
    })),
    frames_data: data.frames?.map((frame, frameIndex) => ({
      id: frame.id || Date.now() + frameIndex,
      name: frame.name || `Frame ${frameIndex + 1}`,
      duration: frame.duration || 100,
      layers: frame.layers.map((layer, layerIndex) => ({
        id: layer.id || layerIndex,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        pixels: layer.pixels
      }))
    })),
    color_palette: data.color_palette
  }  
  return result
}

/**
 * Lee una imagen y la convierte a un proyecto básico
 */
export async function imageToProject(file: File): Promise<{
  title: string
  canvas_width: number
  canvas_height: number
  layers_data: any
}> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const pixels: Record<string, string> = {}
      
      // Convertir ImageData a formato de píxeles
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4
          const r = imageData.data[index]
          const g = imageData.data[index + 1]
          const b = imageData.data[index + 2]
          const a = imageData.data[index + 3]
          
          if (a > 0) { // Solo píxeles no transparentes
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
            pixels[`${x},${y}`] = hex
          }
        }
      }
        const layers = [{
        id: 0,
        name: "Capa 1",
        visible: true,
        opacity: 1,
        pixels
      }]
      
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""), // Quitar extensión
        canvas_width: img.width,
        canvas_height: img.height,
        layers_data: layers
      })
    }
    
    img.onerror = () => reject(new Error("Error al cargar la imagen"))
    img.src = URL.createObjectURL(file)
  })
}

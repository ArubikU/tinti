import { DrawingTool } from './base-tool'
import type { Point } from './types'

export interface ColorReplaceSettings {
  mode: 'specific' | 'hue-shift' | 'palette-replace'
  targetColor?: string
  newColor?: string
  hueShift?: number // -180 to 180 degrees
  saturationAdjust?: number // -1 to 1
  lightnessAdjust?: number // -1 to 1
  tolerance?: number // 0 to 100 for fuzzy matching
  paletteMap?: { [oldColor: string]: string }
}

export class ColorReplaceTool extends DrawingTool {
  private settings: ColorReplaceSettings
  private replaceFunction?: (oldColor: string, newColor: string) => void

  constructor(color: string, settings: ColorReplaceSettings = { mode: 'specific' }) {
    super(color, 1, 1)
    this.settings = {
      tolerance: 0,
      hueShift: 0,
      saturationAdjust: 0,
      lightnessAdjust: 0,
      ...settings
    }
  }

  setReplaceFunction(fn: (oldColor: string, newColor: string) => void) {
    this.replaceFunction = fn
  }

  updateSettings(newSettings: Partial<ColorReplaceSettings>) {
    this.settings = { ...this.settings, ...newSettings }
  }

  // Convierte RGB a HSL
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return [h * 360, s, l]
  }

  // Convierte HSL a RGB
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Extrae componentes RGB de un color hex
  private parseColor(color: string): [number, number, number, number] {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
          255
        ]
      } else if (hex.length === 8) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
          parseInt(hex.slice(6, 8), 16)
        ]
      }
    } else if (color.startsWith('rgba')) {
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+|\d*\.\d+)\)/)
      if (match) {
        return [
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          Math.round(parseFloat(match[4]) * 255)
        ]
      }
    } else if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (match) {
        return [
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          255
        ]
      }
    }
    return [0, 0, 0, 255]
  }

  // Convierte componentes RGB a string hex
  private rgbaToHex(r: number, g: number, b: number, a: number = 255): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
    if (a < 255) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Verifica si dos colores coinciden dentro de la tolerancia
  private colorsMatch(color1: string, color2: string): boolean {
    const tolerance = this.settings.tolerance || 0
    if (tolerance === 0) {
      return color1 === color2
    }

    const [r1, g1, b1] = this.parseColor(color1)
    const [r2, g2, b2] = this.parseColor(color2)

    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) + 
      Math.pow(g1 - g2, 2) + 
      Math.pow(b1 - b2, 2)
    )

    return distance <= (tolerance / 100) * 441.67 // 441.67 es la máxima distancia RGB
  }

  // Aplica transformaciones HSL a un color
  private transformColor(color: string): string {
    const [r, g, b, a] = this.parseColor(color)
    let [h, s, l] = this.rgbToHsl(r, g, b)

    // Aplicar ajustes
    if (this.settings.hueShift) {
      h = (h + this.settings.hueShift + 360) % 360
    }

    if (this.settings.saturationAdjust) {
      s = Math.max(0, Math.min(1, s + this.settings.saturationAdjust))
    }

    if (this.settings.lightnessAdjust) {
      l = Math.max(0, Math.min(1, l + this.settings.lightnessAdjust))
    }

    const [newR, newG, newB] = this.hslToRgb(h, s, l)
    return this.rgbaToHex(newR, newG, newB, a)
  }

  // Obtiene todos los colores únicos del canvas
  private getAllUniqueColors(): string[] {
    if (!this.getPixelColor) return []
    
    const colors = new Set<string>()
    // Este método debería ser llamado desde el contexto donde se conoce el tamaño del canvas
    // Por ahora retornamos un array vacío y será implementado por el componente padre
    return Array.from(colors)
  }

  // Método principal para aplicar el reemplazo de color
  applyColorReplace(uniqueColors: string[]): { [oldColor: string]: string } {
    const colorMap: { [oldColor: string]: string } = {}

    switch (this.settings.mode) {
      case 'specific':
        if (this.settings.targetColor && this.settings.newColor) {
          // Buscar colores que coincidan con el objetivo (considerando tolerancia)
          uniqueColors.forEach(color => {
            if (this.colorsMatch(color, this.settings.targetColor!)) {
              colorMap[color] = this.settings.newColor!
            }
          })
        }
        break

      case 'hue-shift':
        // Aplicar transformación HSL a todos los colores
        uniqueColors.forEach(color => {
          const transformedColor = this.transformColor(color)
          if (transformedColor !== color) {
            colorMap[color] = transformedColor
          }
        })
        break

      case 'palette-replace':
        if (this.settings.paletteMap) {
          // Usar el mapa de paleta personalizado
          uniqueColors.forEach(color => {
            Object.entries(this.settings.paletteMap!).forEach(([oldColor, newColor]) => {
              if (this.colorsMatch(color, oldColor)) {
                colorMap[color] = newColor
              }
            })
          })
        }
        break
    }

    return colorMap
  }

  // Método para ser llamado desde el editor
  executeReplace(uniqueColors: string[]) {
    if (!this.replaceFunction) return

    const colorMap = this.applyColorReplace(uniqueColors)
    
    // Aplicar todos los reemplazos
    Object.entries(colorMap).forEach(([oldColor, newColor]) => {
      this.replaceFunction!(oldColor, newColor)
    })
  }

  // Métodos de DrawingTool (no usados en esta herramienta pero requeridos)
  onStart(point: Point): Array<{ x: number; y: number; color: string | null }> {
    return []
  }

  onMove(point: Point): Array<{ x: number; y: number; color: string | null }> {
    return []
  }

  onEnd(): Array<{ x: number; y: number; color: string | null }> {
    return []
  }

  getPreview(): { [key: string]: string } {
    return {}
  }

  // Métodos heredados (mantenemos compatibilidad)
  startDrawing(point: Point): { [key: string]: string } {
    return {}
  }

  draw(point: Point): { [key: string]: string } {
    return {}
  }

  endDrawing(): { [key: string]: string } {
    return {}
  }

  preview(point: Point): { [key: string]: string } {
    return {}
  }
}

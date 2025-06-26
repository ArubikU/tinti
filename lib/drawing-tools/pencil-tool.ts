import { DrawingTool } from './base-tool'
import type { Point } from './types'

export type BrushShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'cross'

export class PencilTool extends DrawingTool {
  protected lastPoint: Point | null = null
  protected isDrawing = false
  protected brushShape: BrushShape = 'circle'

  setBrushShape(shape: BrushShape) {
    this.brushShape = shape
  }

  getBrushShape(): BrushShape {
    return this.brushShape
  }

  onStart(point: Point) {
    this.isDrawing = true
    this.lastPoint = point
    return this.getBrushPixels(point.x, point.y)
  }

  onMove(point: Point) {
    if (!this.isDrawing || !this.lastPoint) return []

    if (this.size === 1) {
      // Para tamaño 1, usar el algoritmo de línea tradicional
      const linePixels = this.getLinePixels(this.lastPoint, point)
      this.lastPoint = point
      return linePixels.map((p) => {
        const finalColor = this.applyOpacity(p.x, p.y, this.color)
        return { ...p, color: finalColor }
      })
    } else {
      // Para tamaños mayores, dibujar la forma del pincel en cada punto de la línea
      const linePixels = this.getLinePixels(this.lastPoint, point)
      const allPixels: Array<{ x: number; y: number; color: string }> = []
      
      linePixels.forEach(linePoint => {
        const brushPixels = this.getBrushPixels(linePoint.x, linePoint.y)
        allPixels.push(...brushPixels)
      })
      
      this.lastPoint = point
      
      // Remover duplicados
      const uniquePixels = new Map<string, { x: number; y: number; color: string }>()
      allPixels.forEach(pixel => {
        const key = `${pixel.x},${pixel.y}`
        if (!uniquePixels.has(key)) {
          uniquePixels.set(key, pixel)
        }
      })
      
      return Array.from(uniquePixels.values())
    }
  }

  onEnd() {
    this.isDrawing = false
    this.lastPoint = null
    return []
  }
  getPreview(point?: Point) {
    if (!point) return {}
    
    if (this.size === 1) {
      return { [`${point.x},${point.y}`]: this.color }
    }
    
    const preview: { [key: string]: string } = {}
    const radius = Math.floor(this.size / 2)
    const shapePixels = this.getShapePixels(this.brushShape, radius)
    
    shapePixels.forEach(({ x: offsetX, y: offsetY }) => {
      const x = point.x + offsetX
      const y = point.y + offsetY
      preview[`${x},${y}`] = this.color
    })
    
    return preview
  }
  protected getBrushPixels(centerX: number, centerY: number): Array<{ x: number; y: number; color: string }> {
    if (this.size === 1) {
      // Solo dibujar si está dentro de la selección (o sin selección activa)
      if (this.isInSelection(centerX, centerY)) {
        const finalColor = this.applyOpacity(centerX, centerY, this.color)
        return [{ x: centerX, y: centerY, color: finalColor }]
      }
      return []
    }

    const pixels: Array<{ x: number; y: number; color: string }> = []
    const radius = Math.floor(this.size / 2)
    
    const shapePixels = this.getShapePixels(this.brushShape, radius)
    
    shapePixels.forEach(({ x: offsetX, y: offsetY }) => {
      const x = centerX + offsetX
      const y = centerY + offsetY
      
      // Solo añadir píxeles que estén dentro de la selección (o sin selección activa)
      if (this.isInSelection(x, y)) {
        const finalColor = this.applyOpacity(x, y, this.color)
        pixels.push({ x, y, color: finalColor })
      }
    })

    return pixels
  }

  protected getShapePixels(shape: BrushShape, radius: number): Point[] {
    const pixels: Point[] = []
    
    switch (shape) {
      case 'circle':
        return this.getCirclePixels(radius)
      case 'square':
        return this.getSquarePixels(radius)
      case 'diamond':
        return this.getDiamondPixels(radius)
      case 'triangle':
        return this.getTrianglePixels(radius)
      case 'cross':
        return this.getCrossPixels(radius)
      default:
        return this.getCirclePixels(radius)
    }
  }

  protected getCirclePixels(radius: number): Point[] {
    const pixels: Point[] = []
    
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        const distance = Math.sqrt(x * x + y * y)
        if (distance <= radius) {
          pixels.push({ x, y })
        }
      }
    }
    
    return pixels
  }

  protected getSquarePixels(radius: number): Point[] {
    const pixels: Point[] = []
    
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        pixels.push({ x, y })
      }
    }
    
    return pixels
  }

  protected getDiamondPixels(radius: number): Point[] {
    const pixels: Point[] = []
    
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (Math.abs(x) + Math.abs(y) <= radius) {
          pixels.push({ x, y })
        }
      }
    }
    
    return pixels
  }

  protected getTrianglePixels(radius: number): Point[] {
    const pixels: Point[] = []
    
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        // Triángulo apuntando hacia arriba
        if (y >= -radius && y <= radius && 
            x >= -Math.floor((radius + y) / 2) && 
            x <= Math.floor((radius + y) / 2)) {
          pixels.push({ x, y })
        }
      }
    }
    
    return pixels
  }

  protected getCrossPixels(radius: number): Point[] {
    const pixels: Point[] = []
    
    // Línea horizontal
    for (let x = -radius; x <= radius; x++) {
      pixels.push({ x, y: 0 })
    }
    
    // Línea vertical
    for (let y = -radius; y <= radius; y++) {
      pixels.push({ x: 0, y })
    }
    
    return pixels
  }

  protected getLinePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const dx = Math.abs(end.x - start.x)
    const dy = Math.abs(end.y - start.y)
    const sx = start.x < end.x ? 1 : -1
    const sy = start.y < end.y ? 1 : -1
    let err = dx - dy

    let x = start.x
    let y = start.y

    while (true) {
      pixels.push({ x, y })

      if (x === end.x && y === end.y) break

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }

    return pixels
  }
}

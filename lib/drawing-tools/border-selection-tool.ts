import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class BorderSelectionTool extends DrawingTool {
  private selectedPixels: { [key: string]: string } = {}
  private borderPixels: Set<string> = new Set()
  private isSelecting = false
  private currentPoint: Point | null = null

  onStart(point: Point) {
    this.isSelecting = true
    this.currentPoint = point
    this.borderPixels.clear()
    this.selectedPixels = {}
    
    // Añadir el punto inicial al borde
    this.borderPixels.add(`${point.x},${point.y}`)
    return []
  }

  onMove(point: Point) {
    if (!this.isSelecting || !this.currentPoint) return []
    
    // Añadir línea desde el último punto hasta el actual
    const linePixels = this.getLinePixels(this.currentPoint, point)
    linePixels.forEach(p => {
      this.borderPixels.add(`${p.x},${p.y}`)
    })
    
    this.currentPoint = point
    return []
  }

  onEnd() {
    if (!this.isSelecting) return []
    
    this.isSelecting = false
    
    // Usar flood fill para encontrar el área encerrada
    if (this.borderPixels.size > 2) {
      this.findEnclosedArea()
    }
    
    return []
  }

  getPreview() {
    const preview: { [key: string]: string } = {}
    
    // Mostrar el borde siendo dibujado
    this.borderPixels.forEach(key => {
      preview[key] = "rgba(166, 120, 255, 0.8)"
    })
    
    // Mostrar área seleccionada con transparencia
    Object.keys(this.selectedPixels).forEach(key => {
      if (!this.borderPixels.has(key)) {
        preview[key] = "rgba(166, 120, 255, 0.2)"
      }
    })
    
    return preview
  }

  private getLinePixels(start: Point, end: Point): Point[] {
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

  private findEnclosedArea() {
    if (!this.getPixelColor) return
    
    // Obtener los límites del área del borde
    const borderCoords = Array.from(this.borderPixels).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })
    
    if (borderCoords.length === 0) return
    
    const minX = Math.min(...borderCoords.map(p => p.x))
    const maxX = Math.max(...borderCoords.map(p => p.x))
    const minY = Math.min(...borderCoords.map(p => p.y))
    const maxY = Math.max(...borderCoords.map(p => p.y))
    
    // Buscar puntos dentro del área cerrada usando ray casting
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.isPointInside(x, y)) {
          const color = this.getPixelColor(x, y)
          if (color) {
            this.selectedPixels[`${x},${y}`] = color
          }
        }
      }
    }
  }

  private isPointInside(x: number, y: number): boolean {
    // Ray casting algorithm para determinar si un punto está dentro del polígono
    const borderCoords = Array.from(this.borderPixels).map(key => {
      const [px, py] = key.split(',').map(Number)
      return { x: px, y: py }
    })
    
    let inside = false
    let j = borderCoords.length - 1
    
    for (let i = 0; i < borderCoords.length; i++) {
      const xi = borderCoords[i].x
      const yi = borderCoords[i].y
      const xj = borderCoords[j].x
      const yj = borderCoords[j].y
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
      j = i
    }
    
    return inside
  }

  getSelectedPixels(): { [key: string]: string } {
    return this.selectedPixels
  }

  hasSelectedPixels(): boolean {
    return Object.keys(this.selectedPixels).length > 0
  }

  getSelectionBounds() {
    if (Object.keys(this.selectedPixels).length === 0) return null
    
    const coords = Object.keys(this.selectedPixels).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })
    
    const xs = coords.map(coord => coord.x)
    const ys = coords.map(coord => coord.y)
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  }

  isValidSelection(): boolean {
    return Object.keys(this.selectedPixels).length > 0
  }
}

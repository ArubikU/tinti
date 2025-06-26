import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class RectangleTool extends DrawingTool {
  private startPoint: Point | null = null
  private currentPoint: Point | null = null
  private filled = false

  constructor(color: string, size = 1, filled = false) {
    super(color, size)
    this.filled = filled
  }

  setFilled(filled: boolean) {
    this.filled = filled
  }

  onStart(point: Point) {
    this.startPoint = point
    this.currentPoint = point
    return []
  }

  onMove(point: Point) {
    this.currentPoint = point
    return []
  }
  onEnd() {
    if (!this.startPoint || !this.currentPoint) return []

    const pixels = this.filled
      ? this.getFilledRectanglePixels(this.startPoint, this.currentPoint)
      : this.getRectanglePixels(this.startPoint, this.currentPoint)
    this.startPoint = null
    this.currentPoint = null
    
    // Solo devolver píxeles que estén dentro de la selección (o sin selección activa)
    return pixels
      .filter(p => this.isInSelection(p.x, p.y))
      .map((p) => {
        const finalColor = this.applyOpacity(p.x, p.y, this.color)
        return { ...p, color: finalColor }
      })
  }
  getPreview(point?: Point) {
    if (!this.startPoint || !this.currentPoint) return {}

    const pixels = this.filled
      ? this.getFilledRectanglePixels(this.startPoint, this.currentPoint)
      : this.getRectanglePixels(this.startPoint, this.currentPoint)
    const preview: { [key: string]: string } = {}
    pixels.forEach((p) => {
      preview[`${p.x},${p.y}`] = this.color
    })
    return preview
  }

  private getRectanglePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    // Draw border only
    for (let x = minX; x <= maxX; x++) {
      pixels.push({ x, y: minY })
      pixels.push({ x, y: maxY })
    }
    for (let y = minY + 1; y < maxY; y++) {
      pixels.push({ x: minX, y })
      pixels.push({ x: maxX, y })
    }

    return pixels
  }

  private getFilledRectanglePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        pixels.push({ x, y })
      }
    }

    return pixels
  }
}

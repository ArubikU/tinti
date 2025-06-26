import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class EraserTool extends DrawingTool {
  private lastPoint: Point | null = null
  private isDrawing = false
  onStart(point: Point) {
    this.isDrawing = true
    this.lastPoint = point
    
    // Solo borrar si está dentro de la selección (o sin selección activa)
    if (this.isInSelection(point.x, point.y)) {
      return [{ x: point.x, y: point.y, color: null }]
    }
    return []
  }

  onMove(point: Point) {
    if (!this.isDrawing || !this.lastPoint) return []

    const pixels = this.getLinePixels(this.lastPoint, point)
    this.lastPoint = point
    
    // Solo devolver píxeles que estén dentro de la selección (o sin selección activa)
    return pixels
      .filter(p => this.isInSelection(p.x, p.y))
      .map((p) => ({ ...p, color: null }))
  }

  onEnd() {
    this.isDrawing = false
    this.lastPoint = null
    return []
  }

  getPreview() {
    return {}
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
}

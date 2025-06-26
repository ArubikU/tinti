import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class LineTool extends DrawingTool {
  private startPoint: Point | null = null
  private currentPoint: Point | null = null

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

    const pixels = this.getLinePixels(this.startPoint, this.currentPoint)
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

    const pixels = this.getLinePixels(this.startPoint, this.currentPoint)
    const preview: { [key: string]: string } = {}
    pixels.forEach((p) => {
      preview[`${p.x},${p.y}`] = this.color
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
}

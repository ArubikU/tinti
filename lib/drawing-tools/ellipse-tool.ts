import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class EllipseTool extends DrawingTool {
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
      ? this.getFilledEllipsePixels(this.startPoint, this.currentPoint)
      : this.getEllipsePixels(this.startPoint, this.currentPoint)
    this.startPoint = null
    this.currentPoint = null
    return pixels.map((p) => {
      const finalColor = this.applyOpacity(p.x, p.y, this.color)
      return { ...p, color: finalColor }
    })
  }
  getPreview(point?: Point) {
    if (!this.startPoint || !this.currentPoint) return {}

    const pixels = this.filled
      ? this.getFilledEllipsePixels(this.startPoint, this.currentPoint)
      : this.getEllipsePixels(this.startPoint, this.currentPoint)
    const preview: { [key: string]: string } = {}
    pixels.forEach((p) => {
      preview[`${p.x},${p.y}`] = this.color
    })
    return preview
  }

  private getEllipsePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const centerX = Math.floor((start.x + end.x) / 2)
    const centerY = Math.floor((start.y + end.y) / 2)
    const radiusX = Math.abs(end.x - start.x) / 2
    const radiusY = Math.abs(end.y - start.y) / 2

    for (let angle = 0; angle < 360; angle += 1) {
      const radian = (angle * Math.PI) / 180
      const x = Math.round(centerX + radiusX * Math.cos(radian))
      const y = Math.round(centerY + radiusY * Math.sin(radian))
      pixels.push({ x, y })
    }

    return pixels
  }

  private getFilledEllipsePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const centerX = Math.floor((start.x + end.x) / 2)
    const centerY = Math.floor((start.y + end.y) / 2)
    const radiusX = Math.abs(end.x - start.x) / 2
    const radiusY = Math.abs(end.y - start.y) / 2

    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const normalizedX = (x - centerX) / radiusX
        const normalizedY = (y - centerY) / radiusY
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          pixels.push({ x, y })
        }
      }
    }

    return pixels
  }
}

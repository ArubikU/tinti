import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class CircleTool extends DrawingTool {
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
      ? this.getFilledCirclePixels(this.startPoint, this.currentPoint)
      : this.getCirclePixels(this.startPoint, this.currentPoint)
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
      ? this.getFilledCirclePixels(this.startPoint, this.currentPoint)
      : this.getCirclePixels(this.startPoint, this.currentPoint)
    const preview: { [key: string]: string } = {}
    pixels.forEach((p) => {
      preview[`${p.x},${p.y}`] = this.color
    })
    return preview
  }

  private getCirclePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const centerX = start.x
    const centerY = start.y
    const radius = Math.round(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2))

    let x = radius
    let y = 0
    let err = 0

    while (x >= y) {
      pixels.push({ x: centerX + x, y: centerY + y })
      pixels.push({ x: centerX + y, y: centerY + x })
      pixels.push({ x: centerX - y, y: centerY + x })
      pixels.push({ x: centerX - x, y: centerY + y })
      pixels.push({ x: centerX - x, y: centerY - y })
      pixels.push({ x: centerX - y, y: centerY - x })
      pixels.push({ x: centerX + y, y: centerY - x })
      pixels.push({ x: centerX + x, y: centerY - y })

      if (err <= 0) {
        y += 1
        err += 2 * y + 1
      }

      if (err > 0) {
        x -= 1
        err -= 2 * x + 1
      }
    }

    return pixels
  }

  private getFilledCirclePixels(start: Point, end: Point): Point[] {
    const pixels: Point[] = []
    const centerX = start.x
    const centerY = start.y
    const radius = Math.round(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2))

    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        if (distance <= radius) {
          pixels.push({ x, y })
        }
      }
    }

    return pixels
  }
}

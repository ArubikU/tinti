import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class GradientTool extends DrawingTool {
  private startPoint: Point | null = null
  private currentPoint: Point | null = null
  private endColor = "#FFB6A6"
  private gradientType: "linear" | "radial" = "linear"

  setEndColor(color: string) {
    this.endColor = color
  }

  setGradientType(type: "linear" | "radial") {
    this.gradientType = type
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

    const pixels =
      this.gradientType === "linear"
        ? this.getLinearGradientPixels(this.startPoint, this.currentPoint)
        : this.getRadialGradientPixels(this.startPoint, this.currentPoint)

    this.startPoint = null
    this.currentPoint = null
    return pixels.map((p) => ({ ...p, color: p.color }))
  }

  getPreview() {
    if (!this.startPoint || !this.currentPoint) return {}

    const pixels =
      this.gradientType === "linear"
        ? this.getLinearGradientPixels(this.startPoint, this.currentPoint)
        : this.getRadialGradientPixels(this.startPoint, this.currentPoint)

    const preview: { [key: string]: string } = {}
    pixels.forEach((p) => {
      preview[`${p.x},${p.y}`] = p.color
    })
    return preview
  }

  private getLinearGradientPixels(start: Point, end: Point): Array<{ x: number; y: number; color: string }> {
    const pixels: Array<{ x: number; y: number; color: string }> = []
    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2)

    if (distance === 0) return pixels

    const minX = Math.min(start.x, end.x) - 10
    const maxX = Math.max(start.x, end.x) + 10
    const minY = Math.min(start.y, end.y) - 10
    const maxY = Math.max(start.y, end.y) + 10

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const dotProduct =
          ((x - start.x) * (end.x - start.x) + (y - start.y) * (end.y - start.y)) / (distance * distance)
        const t = Math.max(0, Math.min(1, dotProduct))

        const color = this.interpolateColor(this.color, this.endColor, t)
        pixels.push({ x, y, color })
      }
    }

    return pixels
  }

  private getRadialGradientPixels(start: Point, end: Point): Array<{ x: number; y: number; color: string }> {
    const pixels: Array<{ x: number; y: number; color: string }> = []
    const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2)

    if (radius === 0) return pixels

    for (let x = start.x - radius; x <= start.x + radius; x++) {
      for (let y = start.y - radius; y <= start.y + radius; y++) {
        const distance = Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2)
        if (distance <= radius) {
          const t = distance / radius
          const color = this.interpolateColor(this.color, this.endColor, t)
          pixels.push({ x: Math.round(x), y: Math.round(y), color })
        }
      }
    }

    return pixels
  }

  private interpolateColor(color1: string, color2: string, t: number): string {
    const hex1 = color1.replace("#", "")
    const hex2 = color2.replace("#", "")

    const r1 = Number.parseInt(hex1.substr(0, 2), 16)
    const g1 = Number.parseInt(hex1.substr(2, 2), 16)
    const b1 = Number.parseInt(hex1.substr(4, 2), 16)

    const r2 = Number.parseInt(hex2.substr(0, 2), 16)
    const g2 = Number.parseInt(hex2.substr(2, 2), 16)
    const b2 = Number.parseInt(hex2.substr(4, 2), 16)

    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }
}

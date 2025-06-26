import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class MirrorTool extends DrawingTool {
  private axis: "horizontal" | "vertical" = "horizontal"
  private centerX = 0
  private centerY = 0

  setAxis(axis: "horizontal" | "vertical") {
    this.axis = axis
  }

  setCenter(x: number, y: number) {
    this.centerX = x
    this.centerY = y
  }

  onStart(point: Point) {
    return this.mirrorPixel(point)
  }

  onMove(point: Point) {
    return this.mirrorPixel(point)
  }

  onEnd() {
    return []
  }

  getPreview() {
    return {}
  }

  private mirrorPixel(point: Point) {
    const pixels: { x: number; y: number; color: string }[] = []

    // Original pixel
    pixels.push({ x: point.x, y: point.y, color: this.color })

    // Mirrored pixel
    if (this.axis === "horizontal") {
      const mirroredY = 2 * this.centerY - point.y
      pixels.push({ x: point.x, y: mirroredY, color: this.color })
    } else {
      const mirroredX = 2 * this.centerX - point.x
      pixels.push({ x: mirroredX, y: point.y, color: this.color })
    }

    return pixels
  }
}

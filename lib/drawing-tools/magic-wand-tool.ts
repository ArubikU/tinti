import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class MagicWandTool extends DrawingTool {
  private tolerance = 32
  private pixelColorGetter: (x: number, y: number) => string | null

  constructor(
    color: string,
    getPixelColor: (x: number, y: number) => string | null,
    tolerance = 32
  ) {
    super(color)
    this.pixelColorGetter = getPixelColor
    this.tolerance = tolerance
  }

  setTolerance(tolerance: number) {
    this.tolerance = tolerance
  }

  onStart(point: Point) {
    return []
  }

  onMove(point: Point) {
    return []
  }

  onEnd() {
    return []
  }

  getPreview() {
    return {}
  }

  selectSimilar(startPoint: Point, canvasWidth: number, canvasHeight: number): { [key: string]: string } {
    const targetColor = this.pixelColorGetter(startPoint.x, startPoint.y)
    if (!targetColor) return {}

    const selectedPixels: { [key: string]: string } = {}
    const stack = [startPoint]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue

      const currentColor = this.pixelColorGetter(x, y)
      if (!currentColor || !this.colorsAreSimilar(targetColor, currentColor)) continue

      visited.add(key)
      selectedPixels[key] = currentColor

      // Add adjacent pixels to stack
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      )
    }

    return selectedPixels
  }

  private colorsAreSimilar(color1: string, color2: string): boolean {
    if (color1 === color2) return true

    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) return false

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    )

    return distance <= this.tolerance
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
}

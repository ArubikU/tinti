import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class BucketTool extends DrawingTool {
  private canvasWidth: number
  private canvasHeight: number
  private pixelColorGetter: (x: number, y: number) => string | null
  constructor(
    color: string,
    canvasWidth: number,
    canvasHeight: number,
    getPixelColor: (x: number, y: number) => string | null,
    size = 1,
    opacity = 1
  ) {
    super(color, size, opacity)
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.pixelColorGetter = getPixelColor
    this.setPixelColorGetter(getPixelColor)
  }

  onStart(point: Point) {
    return this.floodFill(point.x, point.y)
  }

  onMove(point: Point) {
    return []
  }

  onEnd() {
    return []
  }

  getPreview() {
    return {}
  }  private floodFill(startX: number, startY: number) {
    // Si hay una selección y el punto de inicio no está en ella, no hacer nada
    if (!this.isInSelection(startX, startY)) return []
    
    const targetColor = this.pixelColorGetter(startX, startY)
    const finalColor = this.applyOpacity(startX, startY, this.color)
    
    // Si el color final es igual al color objetivo, no hacer nada
    if (targetColor === finalColor) return []

    const pixels: { x: number; y: number; color: string }[] = []
    const stack = [{ x: startX, y: startY }]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) continue
      if (this.pixelColorGetter(x, y) !== targetColor) continue
      
      // Solo procesar píxeles que estén dentro de la selección (o sin selección activa)
      if (!this.isInSelection(x, y)) continue

      visited.add(key)
      const pixelFinalColor = this.applyOpacity(x, y, this.color)
      pixels.push({ x, y, color: pixelFinalColor })

      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }

    return pixels
  }
}

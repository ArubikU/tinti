import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class SprayTool extends DrawingTool {
  private isDrawing = false
  private density = 0.3

  setDensity(density: number) {
    this.density = density
  }

  onStart(point: Point) {
    this.isDrawing = true
    return this.sprayPaint(point.x, point.y)
  }

  onMove(point: Point) {
    if (!this.isDrawing) return []
    return this.sprayPaint(point.x, point.y)
  }

  onEnd() {
    this.isDrawing = false
    return []
  }

  getPreview() {
    return {}
  }
  private sprayPaint(centerX: number, centerY: number) {
    const pixels: { x: number; y: number; color: string }[] = []
    const radius = this.size
    const particleCount = Math.floor(20 * this.density)

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * 2 * Math.PI
      const distance = Math.random() * radius
      const x = Math.round(centerX + Math.cos(angle) * distance)
      const y = Math.round(centerY + Math.sin(angle) * distance)

      // Solo añadir píxeles que estén dentro de la selección (o sin selección activa)
      if (this.isInSelection(x, y)) {
        const finalColor = this.applyOpacity(x, y, this.color)
        pixels.push({ x, y, color: finalColor })
      }
    }

    return pixels
  }
}

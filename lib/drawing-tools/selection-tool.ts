import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class SelectionTool extends DrawingTool {
  private startPoint: Point | null = null
  private currentPoint: Point | null = null
  private selectedPixels: { [key: string]: string } = {}
  private isSelecting = false

  onStart(point: Point) {
    this.startPoint = point
    this.currentPoint = point
    this.isSelecting = true
    this.selectedPixels = {}
    return []
  }

  onMove(point: Point) {
    if (this.isSelecting) {
      this.currentPoint = point
    }
    return []
  }

  onEnd() {
    this.isSelecting = false
    return []
  }

  getPreview() {
    if (!this.startPoint || !this.currentPoint || !this.isSelecting) return {}

    const preview: { [key: string]: string } = {}
    const minX = Math.min(this.startPoint.x, this.currentPoint.x)
    const maxX = Math.max(this.startPoint.x, this.currentPoint.x)
    const minY = Math.min(this.startPoint.y, this.currentPoint.y)
    const maxY = Math.max(this.startPoint.y, this.currentPoint.y)

    // Draw selection border with dashed line effect
    for (let x = minX; x <= maxX; x++) {
      // Top and bottom borders with dashed effect
      if ((x - minX) % 2 === 0) {
        preview[`${x},${minY}`] = "rgba(166, 120, 255, 0.8)"
        preview[`${x},${maxY}`] = "rgba(166, 120, 255, 0.8)"
      }
    }
    for (let y = minY + 1; y < maxY; y++) {
      // Left and right borders with dashed effect
      if ((y - minY) % 2 === 0) {
        preview[`${minX},${y}`] = "rgba(166, 120, 255, 0.8)"
        preview[`${maxX},${y}`] = "rgba(166, 120, 255, 0.8)"
      }
    }

    return preview
  }

  getSelectionBounds() {
    if (!this.startPoint || !this.currentPoint) return null

    return {
      minX: Math.min(this.startPoint.x, this.currentPoint.x),
      maxX: Math.max(this.startPoint.x, this.currentPoint.x),
      minY: Math.min(this.startPoint.y, this.currentPoint.y),
      maxY: Math.max(this.startPoint.y, this.currentPoint.y),
    }
  }

  isValidSelection(): boolean {
    const bounds = this.getSelectionBounds()
    return bounds !== null && bounds.maxX > bounds.minX && bounds.maxY > bounds.minY
  }
}

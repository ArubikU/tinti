import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class RotationTool extends DrawingTool {
  private selectedPixels: { [key: string]: string } = {}
  private center: Point = { x: 0, y: 0 }
  private angle = 0
  private startPoint: Point | null = null
  private isRotating = false

  setSelectedPixels(pixels: { [key: string]: string }) {
    this.selectedPixels = pixels
    this.calculateCenter()
  }

  private calculateCenter() {
    if (Object.keys(this.selectedPixels).length === 0) return

    const coords = Object.keys(this.selectedPixels).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })

    const sumX = coords.reduce((sum, coord) => sum + coord.x, 0)
    const sumY = coords.reduce((sum, coord) => sum + coord.y, 0)

    this.center = {
      x: Math.round(sumX / coords.length),
      y: Math.round(sumY / coords.length)
    }
  }

  onStart(point: Point) {
    this.startPoint = point
    this.isRotating = true
    return []
  }

  onMove(point: Point) {
    if (!this.isRotating || !this.startPoint) return []

    // Calculate angle based on mouse movement
    const startAngle = Math.atan2(this.startPoint.y - this.center.y, this.startPoint.x - this.center.x)
    const currentAngle = Math.atan2(point.y - this.center.y, point.x - this.center.x)
    this.angle = currentAngle - startAngle

    return []
  }

  onEnd() {
    if (!this.isRotating || Object.keys(this.selectedPixels).length === 0) {
      this.isRotating = false
      return []
    }

    const pixels: { x: number; y: number; color: string | null }[] = []

    // Clear original positions
    Object.keys(this.selectedPixels).forEach(key => {
      const [x, y] = key.split(',').map(Number)
      pixels.push({ x, y, color: null })
    })

    // Apply rotation and set new positions
    const rotatedPixels: { [key: string]: string } = {}
    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      const rotated = this.rotatePoint({ x, y }, this.center, this.angle)
      const newKey = `${rotated.x},${rotated.y}`
      
      pixels.push({ x: rotated.x, y: rotated.y, color })
      rotatedPixels[newKey] = color
    })

    this.selectedPixels = rotatedPixels
    this.isRotating = false
    this.angle = 0
    return pixels
  }

  getPreview() {
    if (!this.isRotating || Object.keys(this.selectedPixels).length === 0) return {}

    const preview: { [key: string]: string } = {}

    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      const rotated = this.rotatePoint({ x, y }, this.center, this.angle)
      preview[`${rotated.x},${rotated.y}`] = color
    })

    return preview
  }

  private rotatePoint(point: Point, center: Point, angle: number): Point {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    const translatedX = point.x - center.x
    const translatedY = point.y - center.y

    const rotatedX = translatedX * cos - translatedY * sin
    const rotatedY = translatedX * sin + translatedY * cos

    return {
      x: Math.round(rotatedX + center.x),
      y: Math.round(rotatedY + center.y)
    }
  }

  getCurrentAngle(): number {
    return this.angle * (180 / Math.PI) // Convert to degrees
  }

  getSelectedPixels(): { [key: string]: string } {
    return this.selectedPixels
  }

  hasSelectedPixels(): boolean {
    return Object.keys(this.selectedPixels).length > 0
  }

  getCursor(point?: { x: number; y: number }): string {
    if (!point || Object.keys(this.selectedPixels).length === 0) {
      return 'auto'
    }
    
    // Si el cursor está sobre la selección, mostrar cursor de rotación
    const key = `${point.x},${point.y}`
    if (this.selectedPixels[key]) {
      return 'grab'
    }
    
    return 'auto'
  }
}

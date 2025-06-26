import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class MoveTool extends DrawingTool {
  private startPoint: Point | null = null
  private selectedPixels: { [key: string]: string } = {}
  private isMoving = false
  private lastOffset: { x: number; y: number } = { x: 0, y: 0 }

  setSelectedPixels(pixels: { [key: string]: string }) {
    this.selectedPixels = pixels
  }
  
  getSelectedPixels() {
    return this.selectedPixels
  }

  onStart(point: Point) {
    this.startPoint = point
    this.isMoving = true
    this.lastOffset = { x: 0, y: 0 }
    return []
  }

  onMove(point: Point) {
    if (!this.isMoving || !this.startPoint || Object.keys(this.selectedPixels).length === 0) {
      return []
    }

    const deltaX = point.x - this.startPoint.x
    const deltaY = point.y - this.startPoint.y

    // Only update if the offset has changed
    if (deltaX === this.lastOffset.x && deltaY === this.lastOffset.y) {
      return []
    }

    const pixels: { x: number; y: number; color: string | null }[] = []

    // Clear pixels at the last offset position
    Object.keys(this.selectedPixels).forEach((key) => {
      const [x, y] = key.split(",").map(Number)
      pixels.push({ x: x + this.lastOffset.x, y: y + this.lastOffset.y, color: null })
    })

    // Set pixels at the new offset position
    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      pixels.push({ x: x + deltaX, y: y + deltaY, color })
    })

    this.lastOffset = { x: deltaX, y: deltaY }
    return pixels
  }

  onEnd() {
    if (!this.isMoving || !this.startPoint || Object.keys(this.selectedPixels).length === 0) {
      this.isMoving = false
      this.startPoint = null
      return []
    }

    const deltaX = this.lastOffset.x
    const deltaY = this.lastOffset.y

    const pixels: { x: number; y: number; color: string | null }[] = []

    // Clear original positions
    Object.keys(this.selectedPixels).forEach((key) => {
      const [x, y] = key.split(",").map(Number)
      pixels.push({ x, y, color: null })
    })

    // Set final positions
    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      pixels.push({ x: x + deltaX, y: y + deltaY, color })
    })

    // Update selected pixels positions for future operations
    const newSelectedPixels: { [key: string]: string } = {}
    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      const newKey = `${x + deltaX},${y + deltaY}`
      newSelectedPixels[newKey] = color
    })
    this.selectedPixels = newSelectedPixels

    this.isMoving = false
    this.startPoint = null
    this.lastOffset = { x: 0, y: 0 }
    return pixels
  }

  getPreview() {
    if (!this.isMoving || !this.startPoint || Object.keys(this.selectedPixels).length === 0) {
      return {}
    }

    const preview: { [key: string]: string } = {}
    const deltaX = this.lastOffset.x
    const deltaY = this.lastOffset.y

    // Show preview of moved pixels
    Object.entries(this.selectedPixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      preview[`${x + deltaX},${y + deltaY}`] = color
    })

    return preview
  }

  hasSelectedPixels(): boolean {
    return Object.keys(this.selectedPixels).length > 0
  }

  getCursor(point?: { x: number; y: number }): string {
    if (!point || Object.keys(this.selectedPixels).length === 0) {
      return 'auto'
    }
    
    // Si el cursor está sobre la selección, mostrar cursor de movimiento
    const key = `${point.x},${point.y}`
    if (this.selectedPixels[key]) {
      return 'move'
    }
    
    return 'auto'
  }
}

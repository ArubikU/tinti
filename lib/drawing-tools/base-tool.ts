import type { Point } from './types'
import { blendColors } from './types'

export abstract class DrawingTool {
  protected color: string
  protected size: number
  protected opacity: number
  protected getPixelColor?: (x: number, y: number) => string | null
  protected selectionMask: { [key: string]: boolean } = {}
  protected respectSelection = false

  constructor(color: string, size = 1, opacity = 1) {
    this.color = color
    this.size = size
    this.opacity = opacity
  }

  setColor(color: string) {
    this.color = color
  }

  setSize(size: number) {
    this.size = size
  }

  setOpacity(opacity: number) {
    this.opacity = Math.max(0.1, Math.min(1, opacity))
  }
  setPixelColorGetter(getter: (x: number, y: number) => string | null) {
    this.getPixelColor = getter
  }

  setSelectionMask(selectedPixels: { [key: string]: string }) {
    this.selectionMask = {}
    Object.keys(selectedPixels).forEach(key => {
      this.selectionMask[key] = true
    })
    this.respectSelection = Object.keys(selectedPixels).length > 0
  }

  protected isInSelection(x: number, y: number): boolean {
    if (!this.respectSelection) return true
    return this.selectionMask[`${x},${y}`] === true
  }
  protected applyOpacity(x: number, y: number, color: string): string {
    if (this.opacity >= 1 || !this.getPixelColor) {
      return color
    }
    
    const existingColor = this.getPixelColor(x, y)
    return blendColors(existingColor, color, this.opacity)
  }

  getCursor(point?: { x: number; y: number }): string {
    return 'auto'
  }

  abstract onStart(point: Point): Array<{ x: number; y: number; color: string | null }>
  abstract onMove(point: Point): Array<{ x: number; y: number; color: string | null }>
  abstract onEnd(): Array<{ x: number; y: number; color: string | null }>
  abstract getPreview(): { [key: string]: string }
}

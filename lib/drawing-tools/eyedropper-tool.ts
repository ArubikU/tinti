import { DrawingTool } from './base-tool'
import type { Point } from './types'

export class EyedropperTool extends DrawingTool {
  private pixelColorGetter: (x: number, y: number) => string | null
  private onColorPicked: (color: string) => void

  constructor(
    color: string,
    getPixelColor: (x: number, y: number) => string | null,
    onColorPicked: (color: string) => void,
  ) {
    super(color)
    this.pixelColorGetter = getPixelColor
    this.onColorPicked = onColorPicked
  }

  onStart(point: Point) {
    const pickedColor = this.pixelColorGetter(point.x, point.y)
    if (pickedColor) {
      this.onColorPicked(pickedColor)
    }
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
}

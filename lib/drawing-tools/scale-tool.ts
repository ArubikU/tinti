import { DrawingTool } from './base-tool'
import type { Point } from './types'

type Handle = 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | null

export class ScaleTool extends DrawingTool {
  private selectedPixels: { [key: string]: string } = {}
  private bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  private startHandle: Handle = null
  private startPoint: Point | null = null
  private previewPixels: { [key: string]: string } = {}
  private initialRect = { width: 0, height: 0 }
  private scaleX = 1
  private scaleY = 1
  private isShiftPressed = false
  private pivotPoint: Point = { x: 0, y: 0 }
  setSelectedPixels(pixels: { [key: string]: string }) {
    this.selectedPixels = pixels
    this.calculateBounds()
    this.initialRect = {
      width: this.bounds.maxX - this.bounds.minX + 1,
      height: this.bounds.maxY - this.bounds.minY + 1
    }
  }

  private calculateBounds() {
    if (Object.keys(this.selectedPixels).length === 0) {
      this.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
      return
    }
    
    const coords = Object.keys(this.selectedPixels).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })
    const xs = coords.map(p => p.x)
    const ys = coords.map(p => p.y)
    this.bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  }
  private getPivotPoint(handle: Handle): Point {
    const { minX, minY, maxX, maxY } = this.bounds
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    switch (handle) {
      case 'top-left': return { x: maxX, y: maxY }
      case 'top': return { x: centerX, y: maxY }
      case 'top-right': return { x: minX, y: maxY }
      case 'right': return { x: minX, y: centerY }
      case 'bottom-right': return { x: minX, y: minY }
      case 'bottom': return { x: centerX, y: minY }
      case 'bottom-left': return { x: maxX, y: minY }
      case 'left': return { x: maxX, y: centerY }
      default: return { x: centerX, y: centerY }
    }
  }  private getHandleUnderPoint(point: Point): Handle {
    const { minX, minY, maxX, maxY } = this.bounds
    const handles: { [key: string]: Point } = {
      'top-left': { x: minX, y: minY },
      'top': { x: (minX + maxX) / 2, y: minY },
      'top-right': { x: maxX, y: minY },
      'right': { x: maxX, y: (minY + maxY) / 2 },
      'bottom-right': { x: maxX, y: maxY },
      'bottom': { x: (minX + maxX) / 2, y: maxY },
      'bottom-left': { x: minX, y: maxY },
      'left': { x: minX, y: (minY + maxY) / 2 }
    }

    const tolerance = 1
    for (const key in handles) {
      const handle = key as Exclude<Handle, null>
      const h = handles[handle]
      if (Math.abs(h.x - point.x) <= tolerance && Math.abs(h.y - point.y) <= tolerance) {
        return handle
      }
    }
    return null
  }
  onStart(point: Point) {
    this.startHandle = this.getHandleUnderPoint(point)
    this.startPoint = point
    
    if (this.startHandle) {
      this.pivotPoint = this.getPivotPoint(this.startHandle)
    }
    
    return []
  }
  onMove(point: Point) {
    if (!this.startHandle || !this.startPoint) return []

    // Calcular la nueva escala basada en el handle y el movimiento
    const { scaleX, scaleY } = this.calculateScale(point, this.startHandle)
    
    // Validar que las escalas no sean NaN o inválidas
    if (isNaN(scaleX) || isNaN(scaleY) || !isFinite(scaleX) || !isFinite(scaleY)) {
      return []
    }
    
    // Si es una esquina y shift está presionado, mantener proporciones
    if (this.isShiftPressed && this.isCornerHandle(this.startHandle)) {
      const uniformScale = Math.min(Math.abs(scaleX), Math.abs(scaleY))
      this.scaleX = scaleX < 0 ? -uniformScale : uniformScale
      this.scaleY = scaleY < 0 ? -uniformScale : uniformScale
    } else {
      this.scaleX = scaleX
      this.scaleY = scaleY
    }

    // Generar vista previa con interpolación
    this.previewPixels = this.scaleSelection(this.scaleX, this.scaleY)
    return []
  }
  onEnd() {
    // Solo proceder si tenemos una vista previa válida
    if (Object.keys(this.previewPixels).length === 0) {
      this.resetState()
      return []
    }

    const changes: { x: number, y: number, color: string | null }[] = []

    // Borrar píxeles originales
    Object.keys(this.selectedPixels).forEach(key => {
      const [x, y] = key.split(',').map(Number)
      changes.push({ x, y, color: null })
    })
    
    // Aplicar píxeles escalados
    Object.entries(this.previewPixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      changes.push({ x, y, color })
    })

    // Actualizar la selección con los píxeles escalados SOLO si el escalado fue exitoso
    if (changes.length > Object.keys(this.selectedPixels).length) {
      this.selectedPixels = { ...this.previewPixels }
      this.calculateBounds()
    }
    
    // Reset del estado
    this.resetState()
    
    return changes
  }

  private resetState() {
    this.previewPixels = {}
    this.startHandle = null
    this.startPoint = null
    this.scaleX = 1
    this.scaleY = 1
    this.pivotPoint = { x: 0, y: 0 }
  }

  getPreview() {
    return this.previewPixels
  }  private calculateScale(currentPoint: Point, handle: Handle): { scaleX: number; scaleY: number } {
    const { minX, minY, maxX, maxY } = this.bounds
    const originalWidth = maxX - minX + 1
    const originalHeight = maxY - minY + 1
    
    // Evitar divisiones por cero
    if (originalWidth <= 0 || originalHeight <= 0) {
      return { scaleX: 1, scaleY: 1 }
    }
    
    let scaleX = 1
    let scaleY = 1
    
    switch (handle) {
      case 'top-left':
        scaleX = (maxX - currentPoint.x + 1) / originalWidth
        scaleY = (maxY - currentPoint.y + 1) / originalHeight
        break
      case 'top':
        scaleY = (maxY - currentPoint.y + 1) / originalHeight
        scaleX = 1 // No escalar en X
        break
      case 'top-right':
        scaleX = (currentPoint.x - minX + 1) / originalWidth
        scaleY = (maxY - currentPoint.y + 1) / originalHeight
        break
      case 'right':
        scaleX = (currentPoint.x - minX + 1) / originalWidth
        scaleY = 1 // No escalar en Y
        break
      case 'bottom-right':
        scaleX = (currentPoint.x - minX + 1) / originalWidth
        scaleY = (currentPoint.y - minY + 1) / originalHeight
        break
      case 'bottom':
        scaleY = (currentPoint.y - minY + 1) / originalHeight
        scaleX = 1 // No escalar en X
        break
      case 'bottom-left':
        scaleX = (maxX - currentPoint.x + 1) / originalWidth
        scaleY = (currentPoint.y - minY + 1) / originalHeight
        break
      case 'left':
        scaleX = (maxX - currentPoint.x + 1) / originalWidth
        scaleY = 1 // No escalar en Y
        break
    }
    
    // Validar y limpiar escalas
    scaleX = isNaN(scaleX) || !isFinite(scaleX) ? 1 : Math.max(0.1, scaleX)
    scaleY = isNaN(scaleY) || !isFinite(scaleY) ? 1 : Math.max(0.1, scaleY)
    
    return { scaleX, scaleY }
  }

  private isCornerHandle(handle: Handle): boolean {
    return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle as string)
  }  private scaleSelection(scaleX: number, scaleY: number): { [key: string]: string } {
    const result: { [key: string]: string } = {}
    
    // Validar escalas de entrada
    if (isNaN(scaleX) || isNaN(scaleY) || !isFinite(scaleX) || !isFinite(scaleY)) {
      return this.selectedPixels // Retornar selección original si hay error
    }
    
    // Usar el punto de anclaje correcto basado en el handle
    const anchorPoint = this.pivotPoint
    
    // Para cada píxel en la selección original
    for (const [key, color] of Object.entries(this.selectedPixels)) {
      const [origX, origY] = key.split(',').map(Number)
      
      // Validar coordenadas originales
      if (isNaN(origX) || isNaN(origY)) continue
      
      // Calcular posición relativa desde el punto de anclaje
      const relX = origX - anchorPoint.x
      const relY = origY - anchorPoint.y
      
      // Aplicar escala
      const scaledRelX = relX * scaleX
      const scaledRelY = relY * scaleY
      
      // Calcular nueva posición absoluta
      const newX = Math.round(anchorPoint.x + scaledRelX)
      const newY = Math.round(anchorPoint.y + scaledRelY)
      
      // Validar nuevas coordenadas
      if (isNaN(newX) || isNaN(newY) || !isFinite(newX) || !isFinite(newY)) continue
      
      // Si la escala es mayor a 1, necesitamos replicar píxeles
      if (scaleX > 1 || scaleY > 1) {
        // Replicar píxeles para llenar el espacio escalado
        const pixelScaleX = Math.max(1, Math.round(scaleX))
        const pixelScaleY = Math.max(1, Math.round(scaleY))
        
        for (let dx = 0; dx < pixelScaleX; dx++) {
          for (let dy = 0; dy < pixelScaleY; dy++) {
            const replicatedX = newX + dx
            const replicatedY = newY + dy
            result[`${replicatedX},${replicatedY}`] = color
          }
        }
      } else {
        // Para escalas menores, usar interpolación simple (píxel más cercano)
        result[`${newX},${newY}`] = color
      }
    }
    
    return result
  }
  getCursor(point?: Point): string {
    const handle = point ? this.getHandleUnderPoint(point) : null
    if (!handle) return 'auto'
    
    // Cursores específicos para cada handle
    switch (handle) {
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize'
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize'
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      default:
        return 'auto'
    }
  }

  getSelectedPixels(): { [key: string]: string } {
    return this.selectedPixels
  }
  getCurrentScale(): { x: number; y: number } {
    // Asegurar que los valores no sean NaN
    const x = isNaN(this.scaleX) || !isFinite(this.scaleX) ? 1 : this.scaleX
    const y = isNaN(this.scaleY) || !isFinite(this.scaleY) ? 1 : this.scaleY
    return { x, y }
  }

  hasSelectedPixels(): boolean {
    return Object.keys(this.selectedPixels).length > 0
  }

  setShiftPressed(pressed: boolean) {
    this.isShiftPressed = pressed
  }

  getHandles(): { [key: string]: Point } {
    const { minX, minY, maxX, maxY } = this.bounds
    return {
      'top-left': { x: minX, y: minY },
      'top': { x: (minX + maxX) / 2, y: minY },
      'top-right': { x: maxX, y: minY },
      'right': { x: maxX, y: (minY + maxY) / 2 },
      'bottom-right': { x: maxX, y: maxY },
      'bottom': { x: (minX + maxX) / 2, y: maxY },
      'bottom-left': { x: minX, y: maxY },
      'left': { x: minX, y: (minY + maxY) / 2 }
    }
  }

  getBounds() {
    return { ...this.bounds }
  }
}

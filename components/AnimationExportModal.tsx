"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { createAnimationPreview, getAnimationInfo, validateFrames } from "@/lib/animation-export"
import { ExportService } from "@/lib/export/export-service"
import type { Frame } from "@/lib/pixel-engine"
import { Download, FileImage, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface AnimationExportModalProps {
  isOpen: boolean
  onClose: () => void
  frames: Frame[]
  canvasWidth: number
  canvasHeight: number
  projectTitle: string
  // Add layer manager and other required data for the export service
  layerManager?: any
  user?: any
  colorPalette?: string[]
}

export function AnimationExportModal({
  isOpen,
  onClose,
  frames,
  canvasWidth,
  canvasHeight,
  projectTitle,
  layerManager,
  user,
  colorPalette = []
}: AnimationExportModalProps) {
  const [exportScale, setExportScale] = useState(8)
  const [exportFormat, setExportFormat] = useState<"frames" | "single">("frames")
  const [selectedFrame, setSelectedFrame] = useState(0)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [previewCurrentFrame, setPreviewCurrentFrame] = useState(0)
  
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const stopAnimationRef = useRef<(() => void) | null>(null)

  // Get export service instance
  const exportService = useMemo(() => ExportService.getInstance(), [])
  
  const animationInfo = getAnimationInfo(frames)
  const validation = validateFrames(frames)

  // Limpiar animación cuando se cierra el modal
  useEffect(() => {
    if (!isOpen && stopAnimationRef.current) {
      stopAnimationRef.current()
      stopAnimationRef.current = null
      setIsPreviewPlaying(false)
    }
  }, [isOpen])

  // Inicializar preview
  useEffect(() => {
    if (isOpen && previewCanvasRef.current && frames.length > 0) {
      const canvas = previewCanvasRef.current
      
      if (isPreviewPlaying) {
        stopAnimationRef.current = createAnimationPreview(
          frames,
          canvasWidth,
          canvasHeight,
          canvas,
          4, // Scale para preview
          (frameIndex) => setPreviewCurrentFrame(frameIndex)
        )
      } else {
        // Mostrar frame actual
        const ctx = canvas.getContext("2d")!
        canvas.width = canvasWidth * 4
        canvas.height = canvasHeight * 4
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        const currentFrame = frames[previewCurrentFrame] || frames[0]
        currentFrame.layers.forEach((layer) => {
          if (layer.visible) {
            ctx.globalAlpha = layer.opacity
            Object.entries(layer.pixels).forEach(([key, color]) => {
              const [x, y] = key.split(",").map(Number)
              if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
                ctx.fillStyle = color
                ctx.fillRect(x * 4, y * 4, 4, 4)
              }
            })
            ctx.globalAlpha = 1
          }
        })
      }
    }
    
    return () => {
      if (stopAnimationRef.current) {
        stopAnimationRef.current()
        stopAnimationRef.current = null
      }
    }
  }, [isOpen, isPreviewPlaying, previewCurrentFrame, frames, canvasWidth, canvasHeight])

  const handleTogglePreview = useCallback(() => {
    if (stopAnimationRef.current) {
      stopAnimationRef.current()
      stopAnimationRef.current = null
    }
    setIsPreviewPlaying(!isPreviewPlaying)
  }, [isPreviewPlaying])

  const handleStepForward = useCallback(() => {
    setPreviewCurrentFrame((prev) => (prev + 1) % frames.length)
  }, [frames.length])

  const handleStepBackward = useCallback(() => {
    setPreviewCurrentFrame((prev) => (prev - 1 + frames.length) % frames.length)
  }, [frames.length])
  const handleExportFrames = useCallback(() => {
    if (!validation.isValid || !layerManager) return
    
    const exportOptions = {
      project: { id: '', title: projectTitle },
      user,
      canvas: { width: canvasWidth, height: canvasHeight },
      layerManager,
      colorPalette
    }
    
    exportService.exportAnimationAsImages({ ...exportOptions, scale: exportScale })
  }, [validation.isValid, layerManager, projectTitle, user, canvasWidth, canvasHeight, colorPalette, exportService, exportScale])

  const handleExportSingleFrame = useCallback(() => {
    if (frames[selectedFrame] && layerManager) {
      const exportOptions = {
        project: { id: '', title: projectTitle },
        user,
        canvas: { width: canvasWidth, height: canvasHeight },
        layerManager,
        colorPalette
      }
      
      exportService.exportFrameAsImage({
        ...exportOptions,
        frameIndex: selectedFrame,
        scale: exportScale,
        filename: `${projectTitle}-${frames[selectedFrame].name}.png`
      })
    }
  }, [frames, selectedFrame, layerManager, projectTitle, user, canvasWidth, canvasHeight, colorPalette, exportService, exportScale])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Exportar Animación</DialogTitle>
          <DialogDescription>
            Exporta tu animación como secuencia de imágenes o frames individuales
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
              <Card className="p-4">
                <div className="flex justify-center mb-4">
                  <div 
                    className="border-2 border-gray-300 rounded bg-white"
                    style={{
                      width: Math.min(300, canvasWidth * 4),
                      height: Math.min(300, canvasHeight * 4),
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-full"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStepBackward}
                    disabled={frames.length <= 1}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={isPreviewPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={handleTogglePreview}
                    disabled={frames.length <= 1}
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStepForward}
                    disabled={frames.length <= 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Frame {previewCurrentFrame + 1} de {frames.length}
                </div>
              </Card>
            </div>

            {/* Animation Info */}
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Información de la Animación</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Frames:</span> {animationInfo.frameCount}
                </div>
                <div>
                  <span className="text-gray-600">Duración:</span> {animationInfo.totalDuration}ms
                </div>
                <div>
                  <span className="text-gray-600">FPS promedio:</span> {animationInfo.averageFps}
                </div>
                <div>
                  <span className="text-gray-600">Tamaño:</span> {canvasWidth}×{canvasHeight}px
                </div>
              </div>
            </Card>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Configuración de Exportación</h3>
              
              <Card className="p-4 space-y-4">
                {/* Export Format */}
                <div className="space-y-2">
                  <Label>Formato de Exportación</Label>
                  <Select value={exportFormat} onValueChange={(value: "frames" | "single") => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frames">Secuencia de Imágenes (PNG)</SelectItem>
                      <SelectItem value="single">Frame Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scale */}                <div className="space-y-2">
                  <Label>Escala de Exportación: {exportScale}x</Label>
                  <Slider
                    value={exportScale}
                    onValueChange={(value) => setExportScale(value)}
                    min={1}
                    max={16}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">
                    Tamaño final: {canvasWidth * exportScale}×{canvasHeight * exportScale}px
                  </div>
                </div>

                {/* Single Frame Selection */}
                {exportFormat === "single" && (
                  <div className="space-y-2">
                    <Label>Seleccionar Frame</Label>
                    <Select 
                      value={selectedFrame.toString()} 
                      onValueChange={(value) => setSelectedFrame(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frames.map((frame, index) => (
                          <SelectItem key={frame.id} value={index.toString()}>
                            {frame.name} (Frame {index + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Validation Errors */}
                {!validation.isValid && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-semibold text-red-800 mb-1">Errores de Validación:</h4>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Export Buttons */}
                <div className="flex gap-2 pt-4">
                  {exportFormat === "frames" ? (
                    <Button
                      onClick={handleExportFrames}
                      disabled={!validation.isValid}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Todos los Frames
                    </Button>
                  ) : (
                    <Button
                      onClick={handleExportSingleFrame}
                      disabled={!validation.isValid || !frames[selectedFrame]}
                      className="flex-1"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Exportar Frame
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

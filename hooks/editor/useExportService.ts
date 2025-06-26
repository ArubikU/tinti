"use client"

import { ExportService, type ExportOptions } from "@/lib/export/export-service"
import type { LayerManager } from "@/lib/pixel-engine"
import { useCallback, useMemo } from "react"

interface UseExportServiceProps {
  project: {
    id: string
    title: string
    description?: string
  }
  user?: {
    id: string
    username: string
    display_name?: string
  }
  layerManager: LayerManager
  canvasWidth: number
  canvasHeight: number
  colorPalette: string[]
}

export function useExportService({
  project,
  user,
  layerManager,
  canvasWidth,
  canvasHeight,
  colorPalette
}: UseExportServiceProps) {
  const exportService = useMemo(() => ExportService.getInstance(), [])
  
  const baseOptions = useMemo((): ExportOptions => ({
    project,
    user,
    canvas: { width: canvasWidth, height: canvasHeight },
    layerManager,
    colorPalette
  }), [project, user, canvasWidth, canvasHeight, layerManager, colorPalette])

  const exportAsPNG = useCallback(() => {
    exportService.exportAsPNG(baseOptions)
  }, [exportService, baseOptions])

  const exportAsTIN = useCallback(() => {
    exportService.exportAsTIN(baseOptions)
  }, [exportService, baseOptions])

  const exportAnimationAsImages = useCallback((scale = 8) => {
    exportService.exportAnimationAsImages({ ...baseOptions, scale })
  }, [exportService, baseOptions])

  const exportFrameAsImage = useCallback((frameIndex: number, scale = 8, filename?: string) => {
    exportService.exportFrameAsImage({ ...baseOptions, frameIndex, scale, filename })
  }, [exportService, baseOptions])

  const generateThumbnail = useCallback(() => {
    return exportService.generateThumbnail(baseOptions)
  }, [exportService, baseOptions])

  const exportViaAPI = useCallback((format: "png" | "jpg" | "webp" = "png") => {
    if (!project?.id) return Promise.reject(new Error("Project ID not available"))
    return exportService.exportViaAPI(project.id, format)
  }, [exportService, project?.id])

  return {
    exportAsPNG,
    exportAsTIN,
    exportAnimationAsImages,
    exportFrameAsImage,
    generateThumbnail,
    exportViaAPI
  }
}

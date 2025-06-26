"use client"

import { ExportService } from "@/lib/export/export-service"

/**
 * Exporta un proyecto vía API - Utilizable desde cualquier componente
 * Esta función permite exportar desde páginas como el dashboard sin necesidad
 * de tener acceso directo al layerManager
 */
export async function exportProjectViaAPI(
  projectId: string, 
  format: "png" | "jpg" | "webp" | "tint" = "png"
) {
  const exportService = ExportService.getInstance()
  return exportService.exportViaAPI(projectId, format)
}

/**
 * Exporta un proyecto como archivo .tint vía API
 */
export async function exportProjectAsTint(projectId: string, filename?: string) {
  const exportService = ExportService.getInstance()
  return exportService.exportAsTintViaAPI(projectId, filename)
}

/**
 * Hook para exportaciones globales
 * Utilizable en cualquier componente que tenga acceso al proyecto
 */
export function useGlobalExport() {
  return {
    exportViaAPI: exportProjectViaAPI,
    exportAsTint: exportProjectAsTint
  }
}

/**
 * Componente de botón de exportación que puede ser usado en cualquier lugar
 */
interface ExportButtonProps {
  projectId: string
  format?: "png" | "jpg" | "webp" | "tint"
  className?: string
  children?: React.ReactNode
}

export function ExportButton({ 
  projectId, 
  format = "png", 
  className = "",
  children = "Exportar"
}: ExportButtonProps) {
  const handleExport = async () => {
    try {
      await exportProjectViaAPI(projectId, format)
    } catch (error) {
      console.error("Error al exportar:", error)
      // Aquí podrías agregar una notificación de error
    }
  }

  return (
    <button 
      onClick={handleExport}
      className={className}
    >
      {children}
    </button>
  )
}

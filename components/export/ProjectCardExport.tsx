"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExportButton, useGlobalExport } from "@/lib/export"
import { Download, FileImage, FileText } from "lucide-react"

interface ProjectCardExportProps {
  projectId: string
  projectTitle: string
  className?: string
  variant?: "button" | "icon"
}

/**
 * Componente de exportación que puede ser usado en cualquier lugar
 * Por ejemplo, en el dashboard, en cards de proyectos, etc.
 */
export function ProjectCardExport({ 
  projectId, 
  projectTitle, 
  className = "",
  variant = "button"
}: ProjectCardExportProps) {
  const { exportViaAPI, exportAsTint } = useGlobalExport()  
  const handleExportPNG = async () => {
    console.log("Iniciando exportación PNG para proyecto:", projectId)
    try {
      await exportViaAPI(projectId, "png")
      console.log("Exportación PNG completada")
    } catch (error) {
      console.error("Error al exportar PNG:", error)
      alert("Error al exportar PNG: " + (error as Error).message)
    }
  }

  const handleExportJPG = async () => {
    console.log("Iniciando exportación JPG para proyecto:", projectId)
    try {
      await exportViaAPI(projectId, "jpg")
      console.log("Exportación JPG completada")
    } catch (error) {
      console.error("Error al exportar JPG:", error)
      alert("Error al exportar JPG: " + (error as Error).message)
    }
  }  
  
  const handleExportWebP = async () => {
    console.log("Iniciando exportación WebP para proyecto:", projectId)
    try {
      await exportViaAPI(projectId, "webp")
      console.log("Exportación WebP completada")
    } catch (error) {
      console.error("Error al exportar WebP:", error)
      alert("Error al exportar WebP: " + (error as Error).message)
    }
  }
  const handleExportTint = async () => {
    console.log("Iniciando exportación .tin para proyecto:", projectId)
    try {
      await exportAsTint(projectId, `${projectTitle}.tin`)
      console.log("Exportación .tin completada")
    } catch (error) {
      console.error("Error al exportar .tin:", error)
      alert("Error al exportar .tin: " + (error as Error).message)
    }
  }
  const handleTestExport = async () => {
    console.log("Iniciando test de exportación...")
    try {
      const response = await fetch('/api/test-export')
      if (!response.ok) {
        throw new Error(`Error en test: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "test.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log("Test de exportación completado")
    } catch (error) {
      console.error("Error en test de exportación:", error)
      alert("Error en test: " + (error as Error).message)
    }
  }

  const handleDebugProject = async () => {
    console.log("Iniciando debug del proyecto:", projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}/debug`)
      if (!response.ok) {
        throw new Error(`Error en debug: ${response.status}`)
      }
      
      const debugInfo = await response.json()
      console.log("Información de debug:", debugInfo)
      
      // Mostrar información en un alert simple
      const info = `
Proyecto: ${debugInfo.project_info.title}
Canvas: ${debugInfo.project_info.canvas_width}x${debugInfo.project_info.canvas_height}
Tipo de datos: ${debugInfo.project_info.data_type}
Longitud de datos: ${debugInfo.project_info.data_length}
Parse exitoso: ${debugInfo.parse_info?.success}
Capas: ${debugInfo.parse_info?.layers_count || 0}
      `.trim()
      
      alert(info)
    } catch (error) {
      console.error("Error en debug:", error)
      alert("Error en debug: " + (error as Error).message)
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl transition-all duration-300 font-medium relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 ${className}`}
      >
        <Download className="w-4 h-4" />
        {variant === "button" ? "Exportar" : null}
      </DropdownMenuTrigger>      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault()
            handleExportPNG()
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileImage className="w-4 h-4" />
          Exportar como PNG
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault()
            handleExportJPG()
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileImage className="w-4 h-4" />
          Exportar como JPG
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault()
            handleExportWebP()
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileImage className="w-4 h-4" />
          Exportar como WebP
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault()
            handleExportTint()
          }}
          className="flex items-center gap-2 cursor-pointer"
        >          <FileText className="w-4 h-4" />
          Exportar como .tin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Componente simple de botón de exportación
 */
export function SimpleExportButton({ 
  projectId, 
  className = "btn btn-primary" 
}: { 
  projectId: string
  className?: string 
}) {
  return (
    <ExportButton
      projectId={projectId}
      format="png"
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar PNG
    </ExportButton>
  )
}

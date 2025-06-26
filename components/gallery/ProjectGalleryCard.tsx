"use client"

import { ProjectCardExport, SimpleExportButton } from "@/components/export"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Project } from "@/lib/database"
import { Calendar, Eye, Heart } from "lucide-react"

interface ProjectGalleryCardProps {
  project: Project
  showExportButtons?: boolean
  variant?: "dashboard" | "gallery" | "compact"
}

/**
 * Ejemplo de componente que muestra diferentes formas de usar el sistema de exportación
 */
export function ProjectGalleryCard({ 
  project, 
  showExportButtons = true,
  variant = "gallery" 
}: ProjectGalleryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={project.thumbnail_url || "/placeholder-art.png"}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
          {showExportButtons && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <SimpleExportButton 
                projectId={project.id}
                className="bg-white/90 hover:bg-white text-gray-800 text-xs px-2 py-1 rounded-md shadow-lg"
              />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{project.title}</h3>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{project.canvas_width}×{project.canvas_height}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{project.views_count || 0}</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (variant === "dashboard") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="aspect-video relative">
          <img
            src={project.thumbnail_url || "/placeholder-art.png"}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {showExportButtons && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ProjectCardExport 
                projectId={project.id} 
                projectTitle={project.title}
                className="bg-white/95 hover:bg-white border-white/50"
              />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-800 truncate flex-1 text-lg">
              {project.title}
            </h3>
            {project.is_public && (
              <Badge variant="secondary" className="ml-2">
                Público
              </Badge>
            )}
          </div>
          
          {project.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>{project.canvas_width}×{project.canvas_height}px</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{project.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{project.likes_count || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default gallery variant
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={project.thumbnail_url || "/placeholder-art.png"}
          alt={project.title}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
            <p className="text-sm opacity-90 mb-2">por @{project.owner?.username}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span>{project.canvas_width}×{project.canvas_height}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{project.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{project.likes_count || 0}</span>
                </div>
              </div>
              
              {showExportButtons && (
                <ProjectCardExport 
                  projectId={project.id} 
                  projectTitle={project.title}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white text-xs"
                />
              )}
            </div>
          </div>
        </div>
        
        {project.is_public && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Público
          </Badge>
        )}
      </div>
    </Card>
  )
}

/**
 * Ejemplo de galería que usa el componente
 */
interface ProjectGalleryProps {
  projects: Project[]
  variant?: "dashboard" | "gallery" | "compact"
  showExportButtons?: boolean
}

export function ProjectGallery({ 
  projects, 
  variant = "gallery",
  showExportButtons = true 
}: ProjectGalleryProps) {
  const getGridClasses = () => {
    switch (variant) {
      case "compact":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      case "dashboard":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    }
  }

  return (
    <div className={`grid ${getGridClasses()}`}>
      {projects.map((project) => (
        <ProjectGalleryCard
          key={project.id}
          project={project}
          variant={variant}
          showExportButtons={showExportButtons}
        />
      ))}
    </div>
  )
}

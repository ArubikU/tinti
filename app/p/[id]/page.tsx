"use client"

import { PixelEditor } from "@/components/PixelEditor"
import { ProjectComments } from "@/components/ProjectComments"
import { ReportProjectModal } from "@/components/ReportProjectModal"
import { SEOHead } from "@/components/SEOHead"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GlassButton } from "@/components/ui/GlassButton"
import { LikeButton } from "@/components/ui/LikeButton"
import { LoadingBrush } from "@/components/ui/LoadingBrush"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer"
import { UserSettingsModal } from "@/components/UserSettingsModal"
import { GlassToastProvider, useToast } from "@/contexts/ToastContext"
import type { Project, User as UserType } from "@/lib/database"
import { useGlobalExport } from "@/lib/export"
import { LanguageProvider, useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Download, Eye, LogIn, LogOut, Palette, Share2, User as UserIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

function PublicProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [view, setView] = useState<"preview" | "editor">("preview")
  const [isEmbed, setIsEmbed] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const { t } = useLanguage()
  const { success, error } = useToast()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setIsEmbed(searchParams.get("embed") === "true")
  }, [])

  useEffect(() => {
    loadProject()
    checkAuth()
  }, [params.id])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      window.location.reload()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const onLogin = () => {
    // Guardar la URL actual para redirigir después del login
    localStorage.setItem('redirectAfterLogin', window.location.href)
    window.location.href = "/auth/login"
  }

  const isProjectOwner = user && project && user.id === project.owner_id
  const canReport = project && !isProjectOwner

  useEffect(() => {
    loadProject()
    checkAuth()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        setIsLiked(data.project.is_liked || false)
        setLikesCount(data.project.likes_count || 0)
        
        // Registrar vista del proyecto
        registerView()
      } else {
        console.error("Failed to load project")
      }
    } catch (error) {
      console.error("Load project error:", error)
    } finally {
      setLoading(false)
    }
  }

  const registerView = async () => {
    try {
      await fetch(`/api/projects/${params.id}/view`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to register view:", error)
    }
  }

  const toggleLike = async () => {
    if (!user) {
      // En lugar de alert, mostrar glass toast y ofrecer login
      error(
        "Acceso requerido",
        "Debes iniciar sesión para dar like. Haz clic aquí para ir al login."
      )
      // También ofrecer ir al login después de un delay
      setTimeout(() => {
        if (window.confirm("¿Quieres ir a la página de inicio de sesión?")) {
          onLogin()
        }
      }, 2000)
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        
        // Mostrar feedback con glass toast
        if (data.isLiked) {
          success(
            "¡Te gustó el proyecto!",
            "Has dado like a este proyecto exitosamente."
          )
        } else {
          success(
            "Like removido",
            "Has removido tu like de este proyecto."
          )
        }
      } else {
        const errorData = await response.json()
        error(
          "Error al dar like",
          errorData.error || "Ha ocurrido un error inesperado."
        )
      }
    } catch (err) {
      console.error("Toggle like error:", err)
      error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intenta de nuevo."
      )
    }
  }

  const { exportViaAPI } = useGlobalExport()

  const exportProject = () => {
    // Crear URL para exportar como PNG escalado
    const exportUrl = `/api/projects/${params.id}/export?scale=4&format=png&background=true`
    
    // Crear enlace temporal para descargar
    const link = document.createElement('a')
    link.href = exportUrl
    link.download = `${project?.title || 'pixel-art'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPNG = async () => {
    if (!project) return
    try {
      await exportViaAPI(project.id, "png")
    } catch (error) {
      console.error("Error al exportar PNG:", error)
      // Fallback to original method
      exportProject()
    }
  }

  const handleExportJPG = async () => {
    if (!project) return
    try {
      await exportViaAPI(project.id, "jpg")
    } catch (error) {
      console.error("Error al exportar JPG:", error)
    }
  }

  const handleExportWebP = async () => {
    if (!project) return
    try {
      await exportViaAPI(project.id, "webp")
    } catch (error) {
      console.error("Error al exportar WebP:", error)
    }
  }

  const shareProject = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: project?.title,
          text: project?.description,
          url,
        })
        success(
          "Proyecto compartido",
          "El proyecto ha sido compartido exitosamente."
        )
      } else {
        await navigator.clipboard.writeText(url)
        success(
          "URL copiada",
          "La URL del proyecto ha sido copiada al portapapeles."
        )
      }
    } catch (err) {
      console.error("Share error:", err)
      // Fallback: intentar copiar al portapapeles
      try {
        await navigator.clipboard.writeText(url)
        success(
          "URL copiada",
          "La URL del proyecto ha sido copiada al portapapeles."
        )
      } catch (clipboardErr) {
        error(
          "Error al compartir",
          "No se pudo compartir el proyecto. Intenta copiar la URL manualmente."
        )
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <LoadingBrush />
      </div>
    )
  }

  if (!project) {
    return (
      <>
        <SEOHead
          title="Proyecto no encontrado | Tinti.art"
          description="El proyecto que buscas no existe o es privado."
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Proyecto no encontrado</h1>
            <p className="text-gray-400">El proyecto que buscas no existe o es privado.</p>
          </div>
        </div>
      </>
    )
  }

  if (view === "editor" && user) {
    return (
      <>
        <SEOHead
          title={`Editando: ${project.title} | Tinti.art`}
          description={`Editando el proyecto de pixel art "${project.title}" en Tinti.art`}
          image={project.thumbnail_url || "/og-image.png"}
        />
        <PixelEditor project={project} user={user} onSave={() => {}} />
      </>
    )
  }

  const projectUrl = `/p/${project.id}`
  const projectImageUrl = project.thumbnail_url || "/og-image.png"
  if (isEmbed) {
    return (
      <>
      <SEOHead
        title={`${project.title} por @${project.owner?.username} | Tinti.art`}
        description={
          project.description ||
          `Pixel art "${project.title}" creado por @${project.owner?.username} en Tinti.art. ${project.canvas_width}×${project.canvas_height} píxeles.`
        }
        image={projectImageUrl}
        url={projectUrl}
        type="embed"
        publishedTime={project.created_at}
        modifiedTime={project.updated_at}
        author={project.owner?.display_name || project.owner?.username}
        tags={project.tags || []}
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{project.title} por @{project.owner?.display_name || project.owner?.username}</h1>
        <motion.img
          src={project.thumbnail_url || "/og-image.png"}
          alt={project.title}
          className="rounded-lg border border-gray-200 shadow-md w-full max-w-md"
                              style={{ imageRendering: "pixelated" }}
        />
        {project.description && (
          <p className="mt-4 text-gray-600 text-center max-w-md">{project.description}</p>
        )}
<div className="mt-6 p-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50 flex items-center gap-1 sm:gap-2">
  <GlassButton variant="glass" size="sm" onClick={shareProject} icon={Share2}>
    <span className="hidden sm:inline">Compartir</span>
  </GlassButton>
  <GlassButton variant="glass" size="sm" onClick={exportProject} icon={Download}>
    <span className="hidden sm:inline">Descargar</span>
  </GlassButton>
</div>
      </div>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title={`${project.title} por @${project.owner?.username} | Tinti.art`}
        description={
          project.description ||
          `Pixel art "${project.title}" creado por @${project.owner?.username} en Tinti.art. ${project.canvas_width}×${project.canvas_height} píxeles.`
        }
        image={projectImageUrl}
        url={projectUrl}
        type="article"
        publishedTime={project.created_at}
        modifiedTime={project.updated_at}
        author={project.owner?.display_name || project.owner?.username}
        tags={project.tags || []}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-3 sm:p-4 flex-shrink-0"
          style={{
            boxShadow: "0 8px 32px rgba(166, 120, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <ResponsiveContainer>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <GlassButton 
                  variant="glass" 
                  size="sm" 
                  onClick={() => {
                    //redirect to main page with ?view=
                    window.location.href = "/?view=explore"
                  }} 
                  icon={ArrowLeft} 
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Volver</span>
                </GlassButton>

              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <GlassButton variant="glass" size="sm" onClick={shareProject} icon={Share2}>
                  <span className="hidden sm:inline">Compartir</span>
                </GlassButton>
                
                {/* Report Button - Solo mostrar si no es el dueño del proyecto */}
                {canReport && (
                  <ReportProjectModal 
                    projectId={project.id} 
                    projectTitle={project.title}
                    currentUser={user}
                  />
                )}

                                <div className="flex items-center gap-2 sm:gap-3">
                                  {user ? (
                                    <>
                                    <button className="flex items-center gap-2 sm:gap-3 hover:bg-white/50 rounded-full px-2 py-1 transition-colors"
                                    onClick={() => setIsSettingsModalOpen(true)}>
                                      <img
                                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                        alt={user.display_name || user.username}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg hover:border-purple-500 transition-all"
                                      />
                                      <span className="hidden sm:block font-medium text-gray-700 text-sm lg:text-base">
                                        {user.display_name || user.username}
                                      </span>
                                    </button>
                                      <PrimaryButton variant="outline" size="sm" onClick={logout} icon={LogOut} className="hidden sm:flex">
                                        {t('auth.logout')}
                                      </PrimaryButton>
                                      <button
                                        onClick={logout}
                                        className="sm:hidden w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"
                                      >
                                        <LogOut className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-white shadow-lg flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                      </div>
                                      <span className="hidden sm:block font-medium text-gray-700 text-sm lg:text-base">
                                        {t('explore.offlineMode')}
                                      </span>
                                      {onLogin && (
                                        <PrimaryButton variant="primary" size="sm" onClick={onLogin} className="hidden sm:flex"
                                        icon={LogIn}>
                                          {t('auth.login')}
                                        </PrimaryButton>
                                      )}
                                      {onLogin && (
                                        <button
                                          onClick={onLogin}
                                          className="sm:hidden w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"
                                        >
                                          <UserIcon className="w-4 h-4" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </motion.div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Información del proyecto */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-4 sm:p-6 bg-white/40 border-rounded-xl backdrop-blur-md border border-white/20 text-gray-800">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#A678FF] to-[#FFB6A6] bg-clip-text text-transparent truncate">{project.title}</h1>

                {project.description && (
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">{project.description}</p>
                )}

                {/* Autor */}
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={
                      project.owner?.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner?.username || "user"}`
                    }
                    alt={project.owner?.display_name || project.owner?.username}
                    className="w-10 h-10 rounded-full border-2 border-white/30"
                  />
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-gray-800">
                      {project.owner?.display_name || project.owner?.username}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">@{project.owner?.username}</div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                  <div className="text-center p-2 sm:p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">
                      {project.canvas_width}×{project.canvas_height}
                    </div>
                    <div className="text-xs text-gray-600">Tamaño</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">{likesCount}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">{project.views_count || 0}</div>
                    <div className="text-xs text-gray-600">Vistas</div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                  <LikeButton
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onToggle={toggleLike}
                    disabled={!user}
                    size="md"
                    showCount={true}
                  />
                  
                  {!user && (
                    <p className="text-xs text-gray-600 text-center">
                      <button 
                        onClick={onLogin}
                        className="text-purple-600 hover:text-purple-800 underline"
                      >
                        Inicia sesión
                      </button> para dar like y comentar
                    </p>
                  )}

                  <Button variant="outline" className="w-full border-white/30 text-gray-700 hover:bg-white/20" onClick={exportProject} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PNG
                  </Button>

                  <Button variant="outline" className="w-full border-white/30 text-gray-700 hover:bg-white/20" onClick={shareProject} size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-800">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-white/20 text-gray-700 border-white/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="mt-6 pt-6 border-t border-white/30 space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Creado el {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Proyecto público
                  </div>
                </div>
              </Card>
            </div>

            {/* Preview del proyecto */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-4 sm:p-6 bg-white/40 border-rounded-xl backdrop-blur-md border border-white/20">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Preview</h2>

                <div className="flex justify-center mb-6">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-2/4 h-2/4 object-contain p-2 sm:p-4"
                        style={{
                          imageRendering: "pixelated",
                          maxWidth: "75%",
                          maxHeight: "75%",
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                        <Palette className="w-16 h-16 mb-4" />
                        <p className="text-center text-sm">No hay imagen disponible</p>
                      </div>
                    )}
                </div>
              </Card>

              {/* Comentarios */}
              <ProjectComments 
                projectId={project.id} 
                currentUser={user} 
                projectOwnerId={project.owner_id || ""} 
              />
            </div>
          </div>
        </div>
                {/* User Settings Modal */}
                <UserSettingsModal
                  isOpen={isSettingsModalOpen}
                  onClose={() => setIsSettingsModalOpen(false)}
                user={user as any}
                onUpdateUser={async (updates) => {
                  // Update user settings - you may need to implement this API call
                  try {
                    const response = await fetch('/api/auth/update-profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updates)
                    })
                    
                    if (!response.ok) {
                      throw new Error('Failed to update profile')
                    }
                    
                    // Optionally refresh user data here
                    console.log('Profile updated successfully')
                  } catch (error) {
                    console.error('Error updating profile:', error)
                    throw error
                  }
                }}
                />
      </div>
    </>
  )
}

export default function Page() {
  return (
    <LanguageProvider>
      <GlassToastProvider>
        <PublicProjectPage />
      </GlassToastProvider>
    </LanguageProvider>
  )
}

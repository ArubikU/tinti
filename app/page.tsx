"use client"

import { AuthModal } from "@/components/AuthModal"
import { CreateProjectModal } from "@/components/CreateProjectModal"
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog"
import { ImportProjectModal } from "@/components/ImportProjectModal"
import { MoveProjectDialog } from "@/components/MoveProjectDialog"
import { PixelEditor } from "@/components/PixelEditor"
import { ProjectSettings } from "@/components/ProjectSettings"
import { LoadingBrush } from "@/components/ui/LoadingBrush"
import { DashboardView, ExploreView, LandingView } from "@/components/views"
import type { Folder, Project, User } from "@/lib/database"
import { LanguageProvider, useLanguage } from "@/lib/language"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

function TintiArt() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [publicProjects, setPublicProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"dashboard" | "editor" | "explore">("dashboard")
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [publicProjectsLoading, setPublicProjectsLoading] = useState(false)
  const [publicProjectsSort, setPublicProjectsSort] = useState("popular")
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    likes: 0,
    comments: 0
  })
  
  // Estados para carpetas
  const [folders, setFolders] = useState<(Folder & { project_count: number })[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [moveProjectDialog, setMoveProjectDialog] = useState<{
    isOpen: boolean
    project: Project | null
  }>({ isOpen: false, project: null })
  const [projectSettingsDialog, setProjectSettingsDialog] = useState<{
    isOpen: boolean
    project: Project | null
  }>({ isOpen: false, project: null })
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [showImportProjectModal, setShowImportProjectModal] = useState(false)
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<{
    isOpen: boolean
    project: Project | null
  }>({ isOpen: false, project: null })
  
  // Estados para vistas
  const [projectViewMode, setProjectViewMode] = useState<"grid" | "list">("grid")
  const [editingFolderTitle, setEditingFolderTitle] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState("")
  
  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
    loadPublicProjects()
    loadStats()
    
    // Manejar parámetros de URL para importación
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    
    if (action === 'import-image' || action === 'import-tin') {
      setShowImportProjectModal(true)
    } else if (action === 'new') {
      setShowCreateProjectModal(true)
    }
  }, [])

  // Cargar proyectos cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      loadProjects()
      loadFolders()
    }
  }, [user])

  
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }
useEffect(() => {
  if (loading) return // espera a que termine la verificación

  const urlParams = new URLSearchParams(window.location.search)
  const viewParam = urlParams.get("view")
  const actionParam = urlParams.get("action")

  if (actionParam === "new" && user) {
    setView("editor")
    createProject({
      title: t('project.newProject'),
      description: "",
      canvas_width: 32,
      canvas_height: 32,
      folderId: null,
    })
  }

  if (viewParam === "dashboard" || viewParam === "explore") {
    setView(viewParam as "dashboard" | "explore")
  }
}, [loading, user])

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  urlParams.delete("action")
  urlParams.set("view", view)
  window.history.replaceState({}, "", `?${urlParams.toString()}`)
}, [view])


  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const loadPublicProjects = async (sort = "popular") => {
    setPublicProjectsLoading(true)
    try {
      const response = await fetch(`/api/projects/public?limit=12&sort=${sort}`)
      if (response.ok) {
        const data = await response.json()
        setPublicProjects(data.projects)
      }
    } catch (error) {
      console.error("Failed to load public projects:", error)
    } finally {
      setPublicProjectsLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const response = await fetch("/api/folders")
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders)
      }
    } catch (error) {
      console.error("Failed to load folders:", error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const createProject = async (projectData: {
    title: string
    description?: string
    canvas_width: number
    canvas_height: number
    folderId?: string | null
    layers_data?: any[]
    frames_data?: any[]
    color_palette?: string[]
  }) => {
    if (!user) {
      // Crear proyecto temporal sin guardar
      const tempProject: Project & { isTemporary?: boolean } = {
        id: `temp-${Date.now()}`,
        title: projectData.title,
        description: projectData.description || "",
        owner_id: "temp",
        canvas_width: projectData.canvas_width,
        canvas_height: projectData.canvas_height,
        is_public: false,
        is_collaborative: false,
        data: {
          layers: projectData.layers_data || [{ id: 0, name: "Layer 1", visible: true, opacity: 1, pixels: {} }],
          activeLayer: 0,
          // Si hay frames importados, usarlos; si no, crear uno por defecto
          frames: projectData.frames_data || [{
            id: Date.now(),
            name: "Frame 1",
            layers: projectData.layers_data || [{ id: 0, name: "Layer 1", visible: true, opacity: 1, pixels: {} }],
            duration: 100
          }],
          currentFrame: 0,
          animationFps: 10,
          palette: projectData.color_palette || []
        },
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isTemporary: true,
      }
      setCurrentProject(tempProject)
      setView("editor")
      return
    }

    try {
      // Preparar los datos del proyecto, incluyendo datos importados si existen
      const projectPayload: any = {
        title: projectData.title,
        description: projectData.description,
        canvas_width: projectData.canvas_width,
        canvas_height: projectData.canvas_height
      }
      
      // Si hay datos importados, incluirlos en el payload
      if (projectData.layers_data || projectData.frames_data || projectData.color_palette) {
        projectPayload.data = {
          layers: projectData.layers_data || [{ id: 0, name: "Layer 1", visible: true, opacity: 1, pixels: {} }],
          activeLayer: 0,
          frames: projectData.frames_data || [{
            id: Date.now(),
            name: "Frame 1",
            layers: projectData.layers_data || [{ id: 0, name: "Layer 1", visible: true, opacity: 1, pixels: {} }],
            duration: 100
          }],
          currentFrame: 0,
          animationFps: 10,
          palette: projectData.color_palette || []
        }
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectPayload),
      })

      if (response.ok) {
        const data = await response.json()
        const newProject = data.project
        
        // Si hay una carpeta seleccionada, mover el proyecto a esa carpeta
        if (projectData.folderId) {
          try {
            await fetch(`/api/projects/${newProject.id}/folder`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ folder_id: projectData.folderId }),
            })
            
            // Actualizar el proyecto en el estado con la carpeta
            newProject.folder_id = projectData.folderId
            newProject.folder_name = folders.find(f => f.id === projectData.folderId)?.name
          } catch (error) {
            console.error("Failed to move project to folder:", error)
          }
        }
        
        setProjects((prev) => [newProject, ...prev])
        setCurrentProject(newProject)
        setView("editor")
        
        // Recargar carpetas para actualizar contadores
        setTimeout(() => {
          loadFolders()
          loadProjects() // Recargar también proyectos para asegurar datos actualizados
        }, 100)
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const saveProject = async (projectData: any) => {
    if (!currentProject) return

    if ((currentProject as any).isTemporary) {
      // Mostrar modal de login para guardar
      setShowAuthModal(true)
      return
    }
    try {
      const response = await fetch(`/api/projects/${currentProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        console.log("Project saved successfully")
        const updatedProject = (await response.json()).project
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        )
      }
    } catch (error) {
      console.error("Failed to save project:", error)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setProjects([])
      setCurrentProject(null)
      setView("dashboard")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const createGuestProject = () => {
    createProject({
      title: "Mi Pixel Art",
      
      description: t('project.demoDescription'),
      canvas_width: 32,
      canvas_height: 32
    })
  }

  const createFolder = async (name: string, parentId?: string) => {
    try {
      // Si el nombre contiene slashes, crear la jerarquía de carpetas
      if (name.includes('/')) {
        const parts = name.split('/').filter(part => part.trim())
        let currentParentId = parentId
        let fullPath = ""
        
        // Crear cada parte de la jerarquía
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          fullPath = fullPath ? `${fullPath}/${part}` : part
          
          // Verificar si ya existe una carpeta con este nombre completo
          const existingFolder = folders.find(f => f.name === fullPath)
          
          if (!existingFolder) {
            const response = await fetch("/api/folders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: fullPath, parent_id: currentParentId }),
            })

            if (response.ok) {
              const data = await response.json()
              const newFolder = { ...data.folder, project_count: 0 }
              setFolders((prev) => [...prev, newFolder])
              currentParentId = newFolder.id
            } else {
              console.error("Failed to create folder part:", part)
              return
            }
          } else {
            currentParentId = existingFolder.id
          }
        }
      } else {
        // Crear carpeta simple
        const response = await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, parent_id: parentId }),
        })

        if (response.ok) {
          const data = await response.json()
          setFolders((prev) => [...prev, { ...data.folder, project_count: 0 }])
        }
      }
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
  }

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const folderToRename = folders.find(f => f.id === folderId)
      if (!folderToRename) return

      const oldName = folderToRename.name
      
      // Actualizar subcarpetas ANTES de renombrar la carpeta padre
      await updateChildFolderNames(oldName, newName)
      
      // Después actualizar la carpeta padre
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        // Recargar todas las carpetas para obtener los datos actualizados
        await loadFolders()
      }
    } catch (error) {
      console.error("Failed to rename folder:", error)
    }
  }

  // Función helper para actualizar nombres de carpetas hijas en el backend
  const updateChildFolderNames = async (oldParentName: string, newParentName: string) => {
    try {
      await fetch("/api/folders/update-children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          oldParentName, 
          newParentName 
        }),
      })
    } catch (error) {
      console.error("Failed to update child folder names:", error)
    }
  }

  const deleteFolder = async (folderId: string) => {
    try {
      const folderToDelete = folders.find(f => f.id === folderId)
      if (!folderToDelete) return

      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const folderName = folderToDelete.name
        
        // Remover la carpeta y todas sus subcarpetas del estado
        setFolders((prev) => prev.filter((folder) => 
          folder.id !== folderId && !folder.name.startsWith(folderName + '/')
        ))
        
        if (selectedFolder === folderId) {
          setSelectedFolder(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete folder:", error)
    }
  }

  const moveProject = async (projectId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId }),
      })

      if (response.ok) {
        // Actualizar inmediatamente el proyecto en el estado local
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            const targetFolder = folders.find(f => f.id === folderId)
            return {
              ...p,
              folder_id: folderId || undefined,
              folder_name: targetFolder?.name || undefined
            } as Project
          }
          return p
        }))
        
        // Recargar proyectos y carpetas para actualizar contadores
        loadProjects()
        loadFolders()
      }
    } catch (error) {
      console.error("Failed to move project:", error)
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        // Actualizar el proyecto en la lista local
        setProjects(prev => 
          prev.map(p => p.id === projectId ? { ...p, ...data.project } : p)
        )
        // Recargar estadísticas si el proyecto se hizo público
        if (updates.is_public) {
          loadStats()
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar proyecto")
      }
    } catch (error) {
      console.error("Failed to update project:", error)
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remover el proyecto de la lista local
        setProjects(prev => prev.filter(p => p.id !== projectId))
        // Recargar carpetas para actualizar contadores
        loadFolders()
        // Recargar estadísticas
        loadStats()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar proyecto")
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      throw error
    }
  }

  const startEditFolderTitle = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    if (folder) {
      setEditingFolderTitle(folderId)
      setEditFolderName(folder.name)
    }
  }

  const handleRenameFolderTitle = async () => {
    if (editingFolderTitle && editFolderName.trim()) {
      await renameFolder(editingFolderTitle, editFolderName.trim())
    }
    setEditingFolderTitle(null)
    setEditFolderName("")
  }

  const cancelEditFolderTitle = () => {
    setEditingFolderTitle(null)
    setEditFolderName("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <LoadingBrush />
      </div>
    )
  }

  // Vista del editor
  if (view === "editor" && currentProject) {
    return <PixelEditor project={currentProject} user={user} onSave={saveProject} setCurrentProject={setCurrentProject} setView={(view: string) => {
      setView(view as "dashboard" | "editor" | "explore")
    }}/>
  }

  // Si no hay usuario, mostrar página de inicio

  if(!user && view == "explore") {
    return(
      <>
          <ExploreView
            publicProjects={publicProjects}
            publicProjectsLoading={publicProjectsLoading}
            publicProjectsSort={publicProjectsSort}
            setPublicProjectsSort={setPublicProjectsSort}
            loadPublicProjects={loadPublicProjects}
            user={user}
            view={view}
            setView={setView as any}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSidebarOpen={setSidebarOpen}
            logout={logout}
            onLogin={() => setShowAuthModal(true)}
          />
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuth={(userData) => setUser(userData)}
        />
        </>
        )
      }

  if (!user) {
    return (
      <>
        <LandingView
          publicProjects={publicProjects}
          publicProjectsLoading={publicProjectsLoading}
          stats={stats}
          createGuestProject={createGuestProject}
          setShowAuthModal={setShowAuthModal}
          setView={setView as any}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuth={(userData) => setUser(userData)}
        />
      </>
    )
  }

  // Dashboard principal
  return (
    <div>
      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <DashboardView
            user={user}
            view={view}
            setView={setView}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            folders={folders}
            projects={projects}
            setProjectSettingsDialog={setProjectSettingsDialog as any}
            setDeleteProjectDialog={setDeleteProjectDialog as any}
            setMoveProjectDialog={setMoveProjectDialog as any}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            editingFolderTitle={editingFolderTitle}
            editFolderName={editFolderName}
            setEditFolderName={setEditFolderName}
            projectViewMode={projectViewMode}
            setProjectViewMode={setProjectViewMode}
            setShowCreateProjectModal={setShowCreateProjectModal}
            setShowImportProjectModal={setShowImportProjectModal}
            createFolder={createFolder}
            renameFolder={renameFolder}
            deleteFolder={deleteFolder}
            moveProject={moveProject}
            startEditFolderTitle={startEditFolderTitle}
            handleRenameFolderTitle={handleRenameFolderTitle}
            cancelEditFolderTitle={cancelEditFolderTitle}
            setCurrentProject={setCurrentProject}
            logout={logout}
            loadFolders={loadFolders}
          />
        )}

        {view === "explore" && (
          <ExploreView
            publicProjects={publicProjects}
            publicProjectsLoading={publicProjectsLoading}
            publicProjectsSort={publicProjectsSort}
            setPublicProjectsSort={setPublicProjectsSort}
            loadPublicProjects={loadPublicProjects}
            user={user}
            view={view}
            setView={setView as any}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSidebarOpen={setSidebarOpen}
            logout={logout}
          />
        )}
      </AnimatePresence>

      {/* Diálogo para mover proyectos */}
      <MoveProjectDialog
        isOpen={moveProjectDialog.isOpen}
        onClose={() => setMoveProjectDialog({ isOpen: false, project: null })}
        project={moveProjectDialog.project}
        folders={folders}
        onMove={moveProject}
      />

      {/* Modal para crear proyecto */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        selectedFolder={selectedFolder}
        folders={folders}
        onCreate={createProject}
      />

      {/* Modal para importar proyecto */}
      <ImportProjectModal
        isOpen={showImportProjectModal}
        onClose={() => setShowImportProjectModal(false)}
        selectedFolder={selectedFolder}
        folders={folders}
        onCreate={createProject}
      />

      {/* Configuración de proyecto */}
      {projectSettingsDialog.project && (
        <ProjectSettings
          project={projectSettingsDialog.project}
          onUpdate={(updates) => updateProject(projectSettingsDialog.project!.id, updates)}
          isOpen={projectSettingsDialog.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setProjectSettingsDialog({ isOpen: false, project: null })
            }
          }}
        />
      )}

      {/* Diálogo de eliminación de proyecto */}
      <DeleteProjectDialog
        isOpen={deleteProjectDialog.isOpen}
        onClose={() => setDeleteProjectDialog({ isOpen: false, project: null })}
        project={deleteProjectDialog.project}
        onDelete={deleteProject}
      />
    </div>
  )
}

export default function Page() {
  return (
    <LanguageProvider>
      <TintiArt />
    </LanguageProvider>
  )
}
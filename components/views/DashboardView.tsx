"use client"

import EditFolderModal from "@/components/EditFolderModal"
import FolderCollaboratorsModal from "@/components/FolderCollaboratorsModal"
import { FolderTree } from "@/components/FolderTree"
import { UserSettingsModal } from "@/components/UserSettingsModal"
import { AnimatedCard } from "@/components/ui/AnimatedCard"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Folder, Project, User } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import {
  CheckIcon,
  Edit3,
  Eye,
  Folder as FolderIcon,
  FolderOpen,
  Grid3X3,
  Heart,
  Import,
  List,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react"
import { useCallback, useState } from "react"
import { ProjectCardExport } from "../export"
import { Badge } from "../ui/badge"

interface DashboardViewProps {
  user: User
  view: "dashboard" | "editor" | "explore"
  setView: (view: "dashboard" | "editor" | "explore") => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  folders: (Folder & { project_count: number })[]
  projects: Project[]
  selectedFolder: string | null
  setSelectedFolder: (folderId: string | null) => void
  editingFolderTitle: string | null
  editFolderName: string
  setEditFolderName: (name: string) => void
  projectViewMode: "grid" | "list"
  setProjectViewMode: (mode: "grid" | "list") => void
  setShowCreateProjectModal: (show: boolean) => void
  setShowImportProjectModal: (show: boolean) => void
  setProjectSettingsDialog: (dialog: { isOpen: boolean; project?: Project }) => void
  createFolder: (name: string, parentId?: string) => Promise<void>
  renameFolder: (folderId: string, newName: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  moveProject: (projectId: string, folderId: string | null) => Promise<void>
  startEditFolderTitle: (folderId: string) => void
  handleRenameFolderTitle: () => Promise<void>
  cancelEditFolderTitle: () => void
  setCurrentProject: (project: Project) => void
  logout: () => Promise<void>
  setDeleteProjectDialog: (dialog: { isOpen: boolean; project?: Project }) => void
  setMoveProjectDialog: (dialog: { isOpen: boolean; project?: Project }) => VideoFacingModeEnum
  loadFolders?: () => Promise<void>
}

const FOLDERS_ENABLED = true
const CONFIGURATION_ENABLED = false

export function DashboardView({
  user,
  view,
  setView,
  searchTerm,
  setSearchTerm,
  sidebarOpen,
  setSidebarOpen,
  folders,
  projects,
  selectedFolder,
  setSelectedFolder,
  editingFolderTitle,
  editFolderName,
  setEditFolderName,
  projectViewMode,
  setProjectViewMode,
  setShowCreateProjectModal,
  setShowImportProjectModal,
  createFolder,
  renameFolder,
  deleteFolder,
  moveProject,
  startEditFolderTitle,
  handleRenameFolderTitle,
  cancelEditFolderTitle,
  setCurrentProject,
  logout,
  setProjectSettingsDialog,
  setDeleteProjectDialog,
  setMoveProjectDialog,
  loadFolders
}: DashboardViewProps) {
  const { t } = useLanguage()
  
  // Estados para los modales
  const [editFolderModal, setEditFolderModal] = useState<{
    isOpen: boolean
    folder?: Folder & { project_count?: number }
  }>({ isOpen: false })
  
  const [collaboratorsModal, setCollaboratorsModal] = useState<{
    isOpen: boolean
    folder?: Folder
  }>({ isOpen: false })

  const [userSettingsModal, setUserSettingsModal] = useState(false)

  // Funciones para manejar colaboradores
  const handleAddCollaborator = useCallback(async (folderId: string, email: string, role: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error adding collaborator')
      }
    } catch (error) {
      console.error('Error adding collaborator:', error)
      throw error
    }
  }, [])

  const handleRemoveCollaborator = useCallback(async (folderId: string, collaboratorId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators/${collaboratorId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error removing collaborator')
      }
    } catch (error) {
      console.error('Error removing collaborator:', error)
      throw error
    }
  }, [])

  const handleUpdateCollaborator = useCallback(async (folderId: string, collaboratorId: string, role: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators/${collaboratorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error updating collaborator')
      }
    } catch (error) {
      console.error('Error updating collaborator:', error)
      throw error
    }
  }, [])

  // Función para editar folder con descripción, color e icono
  const handleEditFolder = useCallback(async (folderId: string, data: {
    name: string
    description?: string
    color: string
    icon: string
  }) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error updating folder')
      }
      
      // Refrescar la lista de folders sin recargar la página
      if (loadFolders) {
        await loadFolders()
      }
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }, [loadFolders])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <ResponsiveContainer className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                src="/icons/tinti-text.png"
                alt="Tinti.art"
                className="h-12 sm:h-16"
              />
              <nav className="hidden sm:flex items-center gap-2">
                <PrimaryButton
                  variant={view === "dashboard" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView("dashboard")}
                >
                  {t('navigation.dashboard')}
                </PrimaryButton>
                <PrimaryButton
                  variant={view === "explore" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView("explore")}
                >
                  {t('navigation.explore')}
                </PrimaryButton>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t('common.searchProjects')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 lg:w-80 bg-white/80 border-purple-200 rounded-2xl"
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-2 sm:gap-3 hover:bg-white/50 rounded-full px-2 py-1 transition-colors"
                    onClick={() => setUserSettingsModal(true)}>
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.display_name || user.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg hover:border-purple-500 transition-all"
                      />
                      <span className="hidden sm:block font-medium text-gray-700 text-sm lg:text-base">
                        {user.display_name || user.username}
                      </span>
                    </button>
                
                <PrimaryButton 
                  variant="outline" 
                  size="sm" 
                  onClick={logout} 
                  icon={LogOut} 
                  className="hidden lg:flex"
                >
                  {t('auth.logout')}
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder={t('common.searchProjects')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-white/80 border-purple-200 rounded-2xl"
              />
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="sm:hidden flex items-center gap-2 mt-3">
            <PrimaryButton
              variant={view === "dashboard" ? "primary" : "outline"}
              size="sm"
              onClick={() => setView("dashboard")}
              className="flex-1"
            >
              {t('navigation.dashboard')}
            </PrimaryButton>
            <PrimaryButton
              variant={view === "explore" ? "primary" : "outline"}
              size="sm"
              onClick={() => setView("explore")}
              className="flex-1"
            >
              {t('navigation.explore')}
            </PrimaryButton>
          </div>
        </ResponsiveContainer>
      </motion.header>

      <div className="flex">
        {FOLDERS_ENABLED && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-80 p-6"
            >
              <AnimatedCard className="p-6 mb-6">
                <PrimaryButton
                  onClick={() => setShowCreateProjectModal(true)}
                  className="w-full mb-3"
                  icon={Plus}
                >
                  {t('project.createNewShort')}
                </PrimaryButton>

                <PrimaryButton
                  onClick={() => setShowImportProjectModal(true)}
                  className="w-full mb-4"
                  variant="outline"
                  icon={Import}
                >
                  {t('project.import')}
                </PrimaryButton>

                <FolderTree
                  folders={folders}
                  projects={projects}
                  selectedFolder={selectedFolder}
                  onSelectFolder={setSelectedFolder}
                  onCreateFolder={createFolder}
                  onRenameFolder={(folderId, name) => handleEditFolder(folderId, { name, color: '#3b82f6', icon: 'folder' })}
                  onDeleteFolder={deleteFolder}
                  onMoveProject={moveProject}
                  onOpenProject={(project) => {
                    setCurrentProject(project)
                    setView("editor")
                  }}
                  onManageCollaborators={(folderId) => {
                    const folder = folders.find(f => f.id === folderId)
                    if (folder) {
                      setCollaboratorsModal({ isOpen: true, folder })
                    }
                  }}
                  onEditFolder={(folder) => {
                    setEditFolderModal({ isOpen: true, folder })
                  }}
                />
              </AnimatedCard>
            </motion.div>

            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{t('navigation.folders')}</h2>
                        <button
                          onClick={() => setSidebarOpen(false)}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <AnimatedCard className="p-6 mb-6">
                        <PrimaryButton
                          onClick={() => {
                            setShowCreateProjectModal(true)
                            setSidebarOpen(false)
                          }}
                          className="w-full mb-3"
                          icon={Plus}
                        >
                          {t('project.createNewShort')}
                        </PrimaryButton>

                        <PrimaryButton
                          onClick={() => {
                            setShowImportProjectModal(true)
                            setSidebarOpen(false)
                          }}
                          className="w-full mb-4"
                          variant="outline"
                          icon={Import}
                        >
                          {t('project.import')}
                        </PrimaryButton>

                        <FolderTree
                          folders={folders}
                          projects={projects}
                          selectedFolder={selectedFolder}
                          onSelectFolder={(folderId: string | null) => {
                            setSelectedFolder(folderId)
                            setSidebarOpen(false)
                          }}
                          onCreateFolder={createFolder}
                          onRenameFolder={(folderId, name) => handleEditFolder(folderId, { name, color: '#3b82f6', icon: 'folder' })}
                          onDeleteFolder={deleteFolder}
                          onMoveProject={moveProject}
                          onOpenProject={(project) => {
                            setCurrentProject(project)
                            setView("editor")
                            setSidebarOpen(false)
                          }}
                          onManageCollaborators={(folderId) => {
                            const folder = folders.find(f => f.id === folderId)
                            if (folder) {
                              setCollaboratorsModal({ isOpen: true, folder })
                            }
                          }}
                          onEditFolder={(folder) => {
                            setEditFolderModal({ isOpen: true, folder })
                          }}
                        />
                      </AnimatedCard>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Contenido principal */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div className="flex items-center gap-3">
                {selectedFolder && editingFolderTitle === selectedFolder ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onBlur={handleRenameFolderTitle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameFolderTitle()
                        if (e.key === 'Escape') cancelEditFolderTitle()
                      }}
                      className="text-2xl sm:text-3xl font-bold h-auto border-purple-300 focus:border-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleRenameFolderTitle}
                      className="text-green-600 hover:text-green-700 p-1"
                      title={t('common.save')}
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEditFolderTitle}
                      className="text-red-600 hover:text-red-700 p-1"
                      title={t('common.cancel')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {selectedFolder === null 
                        ? t('navigation.dashboard') 
                        : folders.find(f => f.id === selectedFolder)?.name?.split('/').pop() || "Carpeta"
                      }
                    </h2>
                    {selectedFolder && (
                      <button
                        onClick={() => startEditFolderTitle(selectedFolder)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Editar nombre de carpeta"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
                {selectedFolder && !editingFolderTitle && (
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Controles de vista */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setProjectViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      projectViewMode === "grid" 
                        ? "bg-purple-100 text-purple-600" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Vista en grilla"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProjectViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      projectViewMode === "list" 
                        ? "bg-purple-100 text-purple-600" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Vista en lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                {CONFIGURATION_ENABLED && (
                  <PrimaryButton variant="outline" icon={Settings} size="sm">
                    {t('project.settings')}
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* Sección de Carpetas */}
            {(selectedFolder === null ? 
              folders.filter(folder => !folder.name.includes('/')).length > 0 :
              folders.filter(folder => {
                const selectedFolderData = folders.find(f => f.id === selectedFolder)
                return selectedFolderData && folder.name.startsWith(selectedFolderData.name + '/') &&
                  folder.name.split('/').length === selectedFolderData.name.split('/').length + 1
              }).length > 0
            ) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FolderIcon className="w-5 h-5" />
                  {t('navigation.folders')}
                </h3>
                
                {/* Grid optimizado para carpetas - formato rectangular */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                  <AnimatePresence>
                    {selectedFolder === null ? (
                      // Vista "Todos los proyectos" - mostrar carpetas raíz
                      folders
                        .filter(folder => !folder.name.includes('/')) // Solo carpetas raíz
                        .filter(folder => 
                          searchTerm === "" || 
                          folder.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((folder, index) => (
                          <motion.div
                            key={`folder-${folder.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <AnimatedCard
                              className="cursor-pointer overflow-hidden group border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
                              onClick={() => setSelectedFolder(folder.id)}
                            >
                              <div className="aspect-[4/1] bg-gradient-to-br from-purple-50 to-purple-100 relative flex items-center p-3">
                                <FolderIcon className="w-8 h-8 text-purple-400 mr-3" />
                                <div>
                                  <p className="text-purple-600 font-medium text-xs truncate">
                                    {folder.name}
                                  </p>
                                  <p className="text-xs text-purple-400 mt-1">
                                    {folder.project_count} proyecto{folder.project_count !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </AnimatedCard>
                          </motion.div>
                        ))
                    ) : (
                      // Vista de carpeta específica - mostrar subcarpetas
                      folders
                        .filter(folder => {
                          const selectedFolderData = folders.find(f => f.id === selectedFolder)
                          if (!selectedFolderData) return false
                          
                          // Mostrar carpetas que sean hijas directas de la carpeta seleccionada
                          return folder.name.startsWith(selectedFolderData.name + '/') &&
                            folder.name.split('/').length === selectedFolderData.name.split('/').length + 1
                        })
                        .filter(folder => 
                          searchTerm === "" || 
                          folder.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((folder, index) => (
                          <motion.div
                            key={`subfolder-${folder.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <AnimatedCard
                              className="cursor-pointer overflow-hidden group border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
                              onClick={() => setSelectedFolder(folder.id)}
                            >
                              <div className="aspect-[4/1] bg-gradient-to-br from-purple-50 to-purple-100 relative flex items-center p-3">
                                <FolderIcon className="w-8 h-8 text-purple-400 mr-3" />
                                <div>
                                  <p className="text-purple-600 font-medium text-xs truncate">
                                    {folder.name.split('/').pop()}
                                  </p>
                                  <p className="text-xs text-purple-400 mt-1">
                                    {folder.project_count} proyecto{folder.project_count !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </AnimatedCard>
                          </motion.div>
                        ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Sección de Proyectos */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {selectedFolder === null ? t('navigation.recentProjects') : t('navigation.projects')}
              </h3>
            </div>

            <div className={projectViewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
              : "space-y-3"
            }>
              <AnimatePresence>

                {/* Mostrar solo proyectos aquí */}
                {projects
                  .filter((project) => {
                    // Filtro por búsqueda
                    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                    
                    if (!matchesSearch) return false
                    
                    // Filtro por carpeta
                    if (selectedFolder === null) {
                      return true // Mostrar todos en "Todos los proyectos"
                    }
                    
                    // Verificar si el proyecto está en la carpeta seleccionada
                    return project.folder_id === selectedFolder
                  })
                  // Limitar a 10 proyectos más recientes en vista "Todos los proyectos"
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .slice(0, selectedFolder === null ? 10 : undefined)
                  .map((project, index) => {
                    return projectViewMode === "grid" ? (
                      // Vista en grilla
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: (index + 2) * 0.1 }}
                      >
                        
                            <AnimatedCard className="cursor-pointer overflow-hidden group">
                              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden" 
                                onClick={() => {
                                  setCurrentProject(project)
                                  setView("editor")
                                }}>
                                {project.thumbnail_url ? (
                                  <img
                                    src={project.thumbnail_url || "/placeholder.svg"}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-purple-300" />
                                  </div>
                                )}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
                                >
                                  <PrimaryButton size="sm">{t('common.open')}</PrimaryButton>
                                </motion.div>
                              </div>
                              <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-bold text-gray-800 truncate text-sm sm:text-base flex-1">
                                    {project.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <ProjectCardExport 
                                        projectId={project.id} 
                                        projectTitle={project.title}
                                        variant="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      />
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button 
                                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setProjectSettingsDialog({ isOpen: true, project })
                                          }}
                                        >
                                          <Settings className="w-4 h-4 mr-2" />
                                          {t('project.settings')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setMoveProjectDialog({ isOpen: true, project })
                                          }}
                                        >
                                          <FolderOpen className="w-4 h-4 mr-2" />
                                          {t('project.moveToFolder')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteProjectDialog({ isOpen: true, project })
                                          }}
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          {t('project.deleteProject')}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                                  {project.description || t('project.noDescription')}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2 sm:mb-3">
                                  <span className="font-medium">
                                    {project.canvas_width}×{project.canvas_height}
                                  </span>
                                  <span className="hidden sm:block">
                                    {new Date(project.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                    {project.is_collaborative && (
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span className="hidden sm:inline">#{project.collaboration_id}</span>
                                      </div>
                                    )}
                                    {project.is_public ? (
                                      <div className="flex items-center gap-1 text-green-600">
                                        <Eye className="w-3 h-3" />
                                        <span className="hidden sm:inline">Público</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-gray-400">
                                        <Eye className="w-3 h-3" />
                                        <span className="hidden sm:inline">Privado</span>
                                      </div>
                                    )}
                                  </div>
                                  {(project.likes_count || 0) > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Heart className="w-3 h-3" />
                                      <span>{project.likes_count}</span>
                                    </div>
                                  )}
                                </div>
                                {(project.tags && project.tags.length > 0) && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {project.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {project.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{project.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </AnimatedCard>
                      </motion.div>
                    ) : (
                      // Vista en lista
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: (index + 2) * 0.05 }}
                      >
                        <AnimatedCard className="cursor-pointer overflow-hidden group p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden flex-shrink-0">
                              {project.thumbnail_url ? (
                                <img
                                  src={project.thumbnail_url}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  style={{ imageRendering: "pixelated" }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Sparkles className="w-6 h-6 text-purple-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 truncate">{project.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(project.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </AnimatedCard>
                      </motion.div>
                    )
                  })
                }
                
                {/* Tarjetas de acción - Nuevo Proyecto e Importar */}
                {projectViewMode === "grid" ? (
                  <>
                    {/* Tarjeta Nuevo Proyecto - Vista Grid */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: 0 }}
                    >
                      <AnimatedCard className="cursor-pointer overflow-hidden group border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="aspect-square relative overflow-hidden flex items-center justify-center" 
                          onClick={() => setShowCreateProjectModal(true)}>
                          <div className="text-center">
                            <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-2" />
                            <p className="text-purple-600 font-medium text-sm">{t('project.createNewShort')}</p>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2">
                            {t('project.create')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t('project.createDescription')}
                          </p>
                        </div>
                      </AnimatedCard>
                    </motion.div>

                    {/* Tarjeta Importar Proyecto - Vista Grid */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: 0.1 }}
                    >
                      <AnimatedCard className="cursor-pointer overflow-hidden group border-2 border-dashed border-gray-300 hover:border-gray-500 hover:shadow-md transition-all bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="aspect-square relative overflow-hidden flex items-center justify-center" 
                          onClick={() => setShowImportProjectModal(true)}>
                          <div className="text-center">
                            <Import className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium text-sm">{t('project.import')}</p>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2">
                            {t('project.import')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Importa un proyecto existente desde un archivo
                          </p>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Tarjeta Nuevo Proyecto - Vista Lista */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0 }}
                    >
                      <AnimatedCard className="cursor-pointer overflow-hidden group p-4 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-purple-100"
                        onClick={() => setShowCreateProjectModal(true)}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800">{t('project.createNew')}</h3>
                            <p className="text-sm text-gray-600">{t('project.createDescription')}</p>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>

                    {/* Tarjeta Importar Proyecto - Vista Lista */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.05 }}
                    >
                      <AnimatedCard className="cursor-pointer overflow-hidden group p-4 border-2 border-dashed border-gray-300 hover:border-gray-500 hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-gray-100"
                        onClick={() => setShowImportProjectModal(true)}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <Import className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800">{t('project.import')}</h3>
                            <p className="text-sm text-gray-600">{t('project.importDescription')}</p>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile FAB for new project */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateProjectModal(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#A678FF] to-[#FFB6A6] rounded-full shadow-2xl flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modales */}
      <EditFolderModal
        isOpen={editFolderModal.isOpen}
        folder={editFolderModal.folder}
        onClose={() => setEditFolderModal({ isOpen: false })}
        onSave={async (data) => {
          if (editFolderModal.folder) {
            try {
              await handleEditFolder(editFolderModal.folder.id, data)
              setEditFolderModal({ isOpen: false })
            } catch (error) {
              console.error('Error saving folder:', error)
              // Aquí podrías mostrar un toast de error
            }
          }
        }}
      />
      
      {collaboratorsModal.folder && (
        <FolderCollaboratorsModal
          isOpen={collaboratorsModal.isOpen}
          folder={collaboratorsModal.folder}
          onClose={() => setCollaboratorsModal({ isOpen: false })}
          onAddCollaborator={(email, role) => handleAddCollaborator(collaboratorsModal.folder!.id, email, role)}
          onRemoveCollaborator={(collaboratorId) => handleRemoveCollaborator(collaboratorsModal.folder!.id, collaboratorId)}
          onUpdateCollaborator={(collaboratorId, role) => handleUpdateCollaborator(collaboratorsModal.folder!.id, collaboratorId, role)}
        />
      )}

      <UserSettingsModal
        isOpen={userSettingsModal}
        onClose={() => setUserSettingsModal(false)}
        user={user}
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
  )
}

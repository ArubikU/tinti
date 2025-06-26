import { PrimaryButton } from "@/components/ui/PrimaryButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Folder as FolderType, Project } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import {
  Book,
  BookOpen,
  Briefcase,
  ChevronRight,
  Code,
  Edit3,
  ExternalLink,
  Folder,
  FolderOpen,
  FolderPlus,
  Globe,
  Heart,
  HeartCrack,
  MoreHorizontal,
  Music,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Video
} from "lucide-react"
import { useEffect, useState } from "react"

// Función para obtener el color del folder
const getFolderColor = (color?: string) => {
  if (!color) return "text-gray-500"
  
  const colorMap: { [key: string]: string } = {
    '#3b82f6': 'text-blue-500',
    '#ef4444': 'text-red-500',
    '#10b981': 'text-green-500',
    '#f59e0b': 'text-yellow-500',
    '#8b5cf6': 'text-purple-500',
    '#ec4899': 'text-pink-500',
    '#06b6d4': 'text-cyan-500',
    '#84cc16': 'text-lime-500',
    '#f97316': 'text-orange-500',
    '#6366f1': 'text-indigo-500'
  }
  
  return colorMap[color] || "text-gray-500"
}

const getFolderIcon = (icon?: string) => {
  if (!icon) return Folder
  
  const iconMap: { [key: string]: any } = {
    'folder': Folder,
    'star': Sparkles,
    'heart': Heart,
    'briefcase': Briefcase,
    'book': Book,
    'image': Image,
    'music': Music,
    'video': Video,
    'code': Code,
    'settings': Settings
  }
  
  return iconMap[icon] || Folder
}
const getOpenFolderIcon = (icon?: string) => {
  if (!icon) return FolderOpen
  const iconMap: { [key: string]: any } = {
    'folder': FolderOpen,
    'star': Sparkles,
    'heart': HeartCrack,
    'briefcase': Briefcase,
    'book': BookOpen,
    'image': Image,
    'music': Music,
    'video': Video,
    'code': Code,
    'settings': Settings
  }
  return iconMap[icon] || FolderOpen
}

interface FolderTreeProps {
  folders: (FolderType & { 
    project_count: number
    collaborator_count?: number
    is_external?: boolean
  })[]
  projects: Project[]
  selectedFolder: string | null
  onSelectFolder: (folderId: string | null) => void
  onCreateFolder: (name: string, parentId?: string, description?: string, color?: string, icon?: string) => void
  onRenameFolder: (folderId: string, name: string, description?: string, color?: string, icon?: string) => void
  onDeleteFolder: (folderId: string) => void
  onMoveProject: (projectId: string, folderId: string | null) => void
  onOpenProject?: (project: Project) => void
  onManageCollaborators?: (folderId: string) => void
  onEditFolder?: (folder: FolderType & { project_count: number }) => void
}

export const FolderTree = ({
  folders,
  projects,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveProject,
  onOpenProject,
  onManageCollaborators,
  onEditFolder
}: FolderTreeProps) => {
  const { t } = useLanguage()
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Efecto inicial para expandir carpetas automáticamente cuando se cargan
  useEffect(() => {
    console.log('🔄 Initial folders load:', folders.length)
    if (folders.length > 0) {
      const newExpanded = new Set<string>()
      
      // Si hay una carpeta seleccionada, expandir automáticamente hasta ella
      if (selectedFolder) {
        const selectedFolderData = folders.find(f => f.id === selectedFolder)
        if (selectedFolderData) {
          const parts = selectedFolderData.name.split('/')
          for (let i = 1; i < parts.length; i++) {
            const parentPath = parts.slice(0, i).join('/')
            const parentFolder = folders.find(f => f.name === parentPath)
            if (parentFolder) {
              newExpanded.add(parentFolder.id)
            }
          }
          // También expandir la carpeta seleccionada si tiene hijos (subcarpetas o proyectos)
          const hasSubfolders = folders.some(f => f.name.startsWith(selectedFolderData.name + '/'))
          const hasProjects = projects.some(p => p.folder_id === selectedFolder)
          const hasChildren = hasSubfolders || hasProjects
          if (hasChildren) {
            newExpanded.add(selectedFolder)
          }
        }
      } else {
        // Si no hay carpeta seleccionada, expandir las carpetas de primer nivel que tengan hijos (subcarpetas o proyectos)
        const rootFolders = folders.filter(f => !f.name.includes('/'))
        rootFolders.forEach(rootFolder => {
          const hasSubfolders = folders.some(f => f.name.startsWith(rootFolder.name + '/'))
          const hasProjects = projects.some(p => p.folder_id === rootFolder.id)
          const hasChildren = hasSubfolders || hasProjects
          if (hasChildren) {
            newExpanded.add(rootFolder.id)
          }
        })
      }
      
      console.log('🔓 Auto-expanding folders:', Array.from(newExpanded))
      setExpandedFolders(newExpanded)
    }
  }, [folders]) // Solo cuando cambian las carpetas, no selectedFolder para evitar loops

  // Expandir automáticamente las carpetas padres cuando se selecciona una carpeta
  useEffect(() => {
    if (selectedFolder) {
      console.log('🎯 Selected folder changed:', selectedFolder)
      const selectedFolderData = folders.find(f => f.id === selectedFolder)
      console.log('📁 Selected folder data:', selectedFolderData)
      
      if (selectedFolderData) {
        const newExpanded = new Set(expandedFolders)
        
        // Expandir todas las carpetas padres
        const parts = selectedFolderData.name.split('/')
        console.log('🔍 Parts to expand:', parts)
        
        // Para cada nivel de profundidad, encontrar y expandir la carpeta padre
        for (let i = 1; i < parts.length; i++) {
          const parentPath = parts.slice(0, i).join('/')
          const parentFolder = folders.find(f => f.name === parentPath)
          console.log(`  🔍 Looking for parent path: ${parentPath}`, parentFolder ? `Found (${parentFolder.id})` : 'Not found')
          
          if (parentFolder) {
            newExpanded.add(parentFolder.id)
            console.log(`  ✅ Expanded: ${parentFolder.name} (${parentFolder.id})`)
          }
        }

        // También expandir la carpeta seleccionada si tiene hijos (subcarpetas o proyectos)
        const hasSubfolders = folders.some(f => f.name.startsWith(selectedFolderData.name + '/'))
        const hasProjects = projects.some(p => p.folder_id === selectedFolder)
        const hasChildren = hasSubfolders || hasProjects
        if (hasChildren) {
          newExpanded.add(selectedFolder)
          console.log(`  ✅ Expanded selected folder: ${selectedFolderData.name} (${selectedFolder})`)
        }
        
        console.log('📂 New expanded set:', Array.from(newExpanded))
        setExpandedFolders(newExpanded)
      }
    }
  }, [selectedFolder, folders])

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      let folderName = newFolderName.trim()
      
      // Si hay una carpeta seleccionada, crear la nueva carpeta como hija
      if (selectedFolder) {
        const selectedFolderData = folders.find(f => f.id === selectedFolder)
        if (selectedFolderData) {
          // Si el nombre no contiene slash, agregarlo como subcarpeta
          if (!folderName.includes('/')) {
            folderName = `${selectedFolderData.name}/${folderName}`
          } else {
            // Si ya contiene slash, agregarlo al principio del path
            folderName = `${selectedFolderData.name}/${folderName}`
          }
        }
      }
      
      // Si el nombre contiene slashes, crear la jerarquía
      if (folderName.includes('/')) {
        const parts = folderName.split('/').filter(part => part.trim())
        if (parts.length > 0) {
          onCreateFolder(parts.join('/'))
        }
      } else {
        onCreateFolder(folderName)
      }
      setNewFolderName("")
      setShowCreateInput(false)
    }
  }

  const handleRename = (folderId: string) => {
    if (editName.trim() && editName !== folders.find(f => f.id === folderId)?.name) {
      onRenameFolder(folderId, editName.trim())
    }
    setEditingFolder(null)
    setEditName("")
  }

  const startEdit = (folder: FolderType & { project_count: number }) => {
    setEditingFolder(folder.id)
    setEditName(folder.name)
  }

  // Crear estructura jerárquica a partir de nombres con slash
  const buildHierarchy = () => {
    const hierarchy: any = {}
    
    console.log('🔍 Building hierarchy with folders:', folders.map(f => ({ id: f.id, name: f.name, project_count: f.project_count })))
    
    // Ordenar carpetas por profundidad (nivel) para procesar primero las carpetas padre
    const sortedFolders = [...folders].sort((a, b) => {
      const aDepth = a.name.split('/').length
      const bDepth = b.name.split('/').length
      return aDepth - bDepth
    })

    console.log('� Sorted folders by depth:', sortedFolders.map(f => ({ name: f.name, depth: f.name.split('/').length })))

    sortedFolders.forEach(folder => {
      const parts = folder.name.split('/')
      
      if (parts.length === 1) {
        // Carpeta de nivel raíz
        hierarchy[folder.id] = { 
          ...folder, 
          children: {}, 
          level: 0, 
          displayName: folder.name,
          fullPath: folder.name,
          project_count: folder.project_count || 0
        }
        console.log(`📁 Root folder added: ${folder.name} (${folder.id})`)
      } else {
        // Carpeta anidada - encontrar o crear su jerarquía
        console.log(`📂 Processing nested folder: ${folder.name} (${folder.id})`)
        
        let currentLevel = hierarchy
        let currentPath = ''
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          currentPath = currentPath ? `${currentPath}/${part}` : part
          
          if (i === parts.length - 1) {
            // Esta es la carpeta final
            currentLevel[folder.id] = { 
              ...folder, 
              children: {}, 
              level: i, 
              displayName: part,
              fullPath: folder.name,
              project_count: folder.project_count || 0
            }
            console.log(`  📁 Final folder added: ${part} at level ${i} (${folder.id})`)
          } else {
            // Buscar carpeta padre existente
            const parentFolder = folders.find(f => f.name === currentPath)
            
            if (parentFolder && hierarchy[parentFolder.id]) {
              // Usar carpeta real existente
              currentLevel = hierarchy[parentFolder.id].children
              console.log(`  📁 Using existing parent: ${currentPath} (${parentFolder.id})`)
            } else if (parentFolder) {
              // Crear entrada para carpeta real que aún no se ha procesado
              currentLevel[parentFolder.id] = {
                ...parentFolder,
                children: {},
                level: i,
                displayName: part,
                fullPath: currentPath,
                project_count: parentFolder.project_count || 0
              }
              currentLevel = currentLevel[parentFolder.id].children
              console.log(`  📁 Created parent entry: ${currentPath} (${parentFolder.id})`)
            } else {
              // Crear carpeta virtual si no existe
              const virtualId = `virtual-${currentPath}`
              if (!currentLevel[virtualId]) {
                currentLevel[virtualId] = {
                  id: virtualId,
                  name: currentPath,
                  displayName: part,
                  project_count: 0,
                  level: i,
                  isVirtual: true,
                  children: {},
                  fullPath: currentPath
                }
                console.log(`  👻 Virtual parent created: ${currentPath} (${virtualId})`)
              }
              currentLevel = currentLevel[virtualId].children
            }
          }
        }
      }
    })
    
    console.log('🌳 Final hierarchy:', hierarchy)
    return hierarchy
  }

  const renderFolder = (folder: any, isLast = false) => {
    const hasSubfolders = Object.keys(folder.children || {}).length > 0
    const hasProjects = !folder.isVirtual && projects.filter(p => p.folder_id === folder.id).length > 0
    const hasChildren = hasSubfolders || hasProjects
    const isExpanded = expandedFolders.has(folder.id)
    const indent = folder.level * 16
    const FIcon = getFolderIcon(folder.icon)
    const OpenFIcon = getOpenFolderIcon(folder.icon)
    return (
      <div key={folder.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            flex items-center gap-2 p-2 rounded-xl cursor-pointer group relative transition-all duration-200
            ${selectedFolder === folder.id 
              ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 shadow-sm border border-purple-200' 
              : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-25 hover:shadow-sm'
            }
          `}
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {/* Líneas de conexión para jerarquía */}
          {folder.level > 0 && (
            <>
              {/* Línea vertical */}
              <div 
                className="absolute bg-gradient-to-b from-purple-200 to-purple-300 rounded-full" 
                style={{ 
                  left: `${12 + (folder.level - 1) * 16 + 8}px`, 
                  top: 0, 
                  bottom: isLast ? '50%' : 0, 
                  width: '2px' 
                }} 
              />
              {/* Línea horizontal curva */}
              <div 
                className="absolute" 
                style={{ 
                  left: `${12 + (folder.level - 1) * 16 + 8}px`, 
                  top: '50%', 
                  width: '16px', 
                  height: '2px',
                  background: 'linear-gradient(90deg, rgb(196 181 253) 0%, rgb(167 139 250) 100%)',
                  borderTopRightRadius: '2px',
                  transform: 'translateY(-1px)'
                }} 
              />
              {/* Punto de conexión */}
              <div 
                className="absolute bg-purple-400 rounded-full" 
                style={{ 
                  left: `${12 + (folder.level - 1) * 16 + 7}px`, 
                  top: '50%', 
                  width: '4px', 
                  height: '4px',
                  transform: 'translateY(-2px)'
                }} 
              />
            </>
          )}
          
          {/* Botón de expansión */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpansion(folder.id)
              }}
              className="w-5 h-5 flex items-center justify-center hover:bg-purple-100 rounded-full transition-colors duration-200 border border-transparent"
            >
              <ChevronRight 
                className={`w-3 h-3 transition-transform duration-200 text-purple-600 border-transparent ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => !folder.isVirtual && onSelectFolder(folder.id)}
          >
            {!folder.isVirtual && selectedFolder === folder.id ? (
              <OpenFIcon className={`w-4 h-4 flex-shrink-0 ${getFolderColor(folder.color)}`} />
            ) : (
              <FIcon className={`w-4 h-4 flex-shrink-0 ${folder.isVirtual ? 'text-gray-400' : getFolderColor(folder.color)}`} />
            )}
            
            {/* Indicador de folder externo/compartido */}
            {!folder.isVirtual && folder.is_external && (
              <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}
            
            {editingFolder === folder.id && !folder.isVirtual ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(folder.id)
                  if (e.key === 'Escape') {
                    setEditingFolder(null)
                    setEditName("")
                  }
                }}
                className="h-6 text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`text-sm font-medium truncate ${folder.isVirtual ? 'text-gray-500 italic' : ''}`}>
                {folder.displayName || folder.name}
              </span>
            )}
            
            {!folder.isVirtual && (
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <span>({folder.project_count})</span>
                {folder.collaborator_count && folder.collaborator_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {folder.collaborator_count}
                  </span>
                )}
              </div>
            )}
          </div>

          {!folder.isVirtual && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditFolder?.(folder)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {onManageCollaborators && (
                  <DropdownMenuItem onClick={() => onManageCollaborators(folder.id)}>
                    <Users className="w-4 h-4 mr-2" />
                    Colaboradores
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDeleteFolder(folder.id)}
                  className="text-red-600"
                  disabled={folder.project_count > 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>
        
        {/* Renderizar subcarpetas y proyectos si están expandidas */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Renderizar subcarpetas */}
              {Object.values(folder.children).map((child: any, index: number, array: any[]) => {
                // Verificar si es la última carpeta hijo (sin contar proyectos)
                const childProjects = projects.filter(p => p.folder_id === folder.id)
                const isLastChild = index === array.length - 1 && childProjects.length === 0
                return renderFolder(child, isLastChild)
              })}
              
              {/* Renderizar proyectos de esta carpeta si está expandida */}
              {!folder.isVirtual && projects
                .filter(project => project.folder_id === folder.id)
                .map((project, projectIndex, projectArray) => {
                  const isLastProject = projectIndex === projectArray.length - 1
                  return (
                    <motion.div
                      key={`project-${project.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        flex items-center gap-2 p-2 rounded-xl cursor-pointer group relative transition-all duration-200
                        hover:bg-gradient-to-r hover:from-purple-25 hover:to-purple-50 hover:shadow-sm text-gray-600
                      `}
                      style={{ paddingLeft: `${12 + (folder.level + 1) * 16}px` }}
                      onClick={() => {
                        // Abrir el proyecto si se proporciona la función
                        if (onOpenProject) {
                          onOpenProject(project)
                        }
                      }}
                    >
                      {/* Líneas de conexión para proyectos */}
                      <div 
                        className="absolute bg-gradient-to-b from-purple-200 to-purple-300 rounded-full" 
                        style={{ 
                          left: `${12 + folder.level * 16 + 8}px`, 
                          top: 0, 
                          bottom: isLastProject ? '50%' : 0, 
                          width: '2px' 
                        }} 
                      />
                      <div 
                        className="absolute" 
                        style={{ 
                          left: `${12 + folder.level * 16 + 8}px`, 
                          top: '50%', 
                          width: '16px', 
                          height: '2px',
                          background: 'linear-gradient(90deg, rgb(196 181 253) 0%, rgb(167 139 250) 100%)',
                          borderTopRightRadius: '2px',
                          transform: 'translateY(-1px)'
                        }} 
                      />
                      {/* Icono de proyecto en lugar de punto */}
                      <div 
                        className="absolute bg-purple-100 border-2 border-purple-400 rounded-full flex items-center justify-center" 
                        style={{ 
                          left: `${12 + folder.level * 16 + 4}px`, 
                          top: '50%', 
                          width: '10px', 
                          height: '10px',
                          transform: 'translateY(-5px)'
                        }} 
                      >
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      </div>
                      
                      <div className="w-4" />
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0 ml-2">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {project.title}
                        </span>
                        {project.is_public && (
                          <Globe className="w-3 h-3 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  )
                })
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }


  return (
    <div className="space-y-2">
      {/* Botón para crear nueva carpeta */}
      <div className="space-y-2">
        <PrimaryButton
          variant="outline"
          size="sm"
          onClick={() => setShowCreateInput(true)}
          icon={FolderPlus}
          className="w-full justify-start"
        >
          {selectedFolder 
            ? `${t('folderTree.newFolderIn')} ${folders.find(f => f.id === selectedFolder)?.name?.split('/').pop() || t('folderTree.folder')}`
            : t('folderTree.newFolder')
          }
        </PrimaryButton>

        <AnimatePresence>
          {showCreateInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={() => setShowCreateInput(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder()
                    if (e.key === 'Escape') setShowCreateInput(false)
                  }}
                  placeholder={
                    selectedFolder 
                      ? `${t('folderTree.createIn')} ${folders.find(f => f.id === selectedFolder)?.name}/...`
                      : t('folderTree.enterName')
                  }
                  className="h-8 text-sm"
                  autoFocus
                />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Opción "Todos los proyectos" */}
      <motion.div
        className={`
          flex items-center gap-2 p-2 rounded-lg cursor-pointer group
          ${selectedFolder === null ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'}
        `}
        onClick={() => onSelectFolder(null)}
      >
        <Folder className="w-4 h-4" />
        <span className="text-sm font-medium">Todos los proyectos</span>
        <span className="text-xs text-gray-400">
          ({projects.length})
        </span>
      </motion.div>

      {/* Lista de carpetas */}
      <div className="space-y-1">
        {(() => {
          const hierarchy = buildHierarchy()
          const rootFolders = Object.values(hierarchy)
          console.log('🌲 Root folders to render:', rootFolders.map((f: any) => ({ 
            id: f.id, 
            name: f.displayName, 
            hasSubfolders: Object.keys(f.children || {}).length > 0,
            hasProjects: !f.isVirtual && projects.filter(p => p.folder_id === f.id).length > 0,
            hasChildren: Object.keys(f.children || {}).length > 0 || (!f.isVirtual && projects.filter(p => p.folder_id === f.id).length > 0)
          })))
          return rootFolders.map((folder: any, index: number, array: any[]) => 
            renderFolder(folder, index === array.length - 1)
          )
        })()}
      </div>
    </div>
  )
}

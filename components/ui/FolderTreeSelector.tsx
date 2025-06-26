"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Folder } from "@/lib/database"
import {
    Book,
    BookOpen,
    Briefcase,
    ChevronDown,
    ChevronRight,
    Code,
    Folder as FolderIcon,
    FolderOpen,
    Heart,
    HeartCrack,
    Music,
    Search,
    Settings,
    Sparkles,
    Video,
    X
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

// Mapeo de iconos
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
  if (!icon) return FolderIcon
  
  const iconMap: { [key: string]: any } = {
    'folder': FolderIcon,
    'star': Sparkles,
    'heart': Heart,
    'briefcase': Briefcase,
    'book': Book,
    'music': Music,
    'video': Video,
    'code': Code,
    'settings': Settings
  }
  
  return iconMap[icon] || FolderIcon
}

const getOpenFolderIcon = (icon?: string) => {
  if (!icon) return FolderOpen
  const iconMap: { [key: string]: any } = {
    'folder': FolderOpen,
    'star': Sparkles,
    'heart': HeartCrack,
    'briefcase': Briefcase,
    'book': BookOpen,
    'music': Music,
    'video': Video,
    'code': Code,
    'settings': Settings
  }
  return iconMap[icon] || FolderOpen
}

interface FolderNode extends Folder {
  children: FolderNode[]
  level: number
  project_count?: number
}

interface FolderTreeSelectorProps {
  folders: (Folder & { project_count?: number })[]
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  placeholder?: string
  className?: string
}

export function FolderTreeSelector({
  folders,
  selectedFolderId,
  onSelectFolder,
  placeholder = "Buscar carpetas...",
  className = ""
}: FolderTreeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Función para expandir todos los padres de una carpeta
  const expandParents = (folderId: string, folderMap: Map<string, FolderNode>) => {
    const folder = folderMap.get(folderId)
    if (folder?.parent_id) {
      setExpandedFolders(prev => new Set([...prev, folder.parent_id!]))
      expandParents(folder.parent_id, folderMap)
    }
  }

  // Crear estructura de árbol de carpetas
  const { folderTree, folderMap } = useMemo(() => {
    const createTree = (folders: (Folder & { project_count?: number })[]): { folderTree: FolderNode[], folderMap: Map<string, FolderNode> } => {
      console.log('🔍 Debug: Folders received:', folders.map(f => ({ id: f.id, name: f.name, parent_id: f.parent_id })))
      
      const folderMap = new Map<string, FolderNode>()
      const nameToIdMap = new Map<string, string>()
      const roots: FolderNode[] = []

      // Crear nodos para todas las carpetas y mapear nombres a IDs
      folders.forEach(folder => {
        folderMap.set(folder.id, {
          ...folder,
          children: [],
          level: 0
        })
        nameToIdMap.set(folder.name, folder.id)
      })

      // Organizar en estructura de árbol
      folders.forEach(folder => {
        const node = folderMap.get(folder.id)!
        let isRoot = true

        // Método 1: Usar parent_id si existe
        if (folder.parent_id && folderMap.has(folder.parent_id)) {
          const parent = folderMap.get(folder.parent_id)!
          parent.children.push(node)
          node.level = parent.level + 1
          console.log(`📁 (parent_id) Added ${folder.name} as child of ${parent.name}`)
          isRoot = false
        } 
        // Método 2: Inferir jerarquía desde el nombre si no hay parent_id
        else if (folder.name.includes('/')) {
          const pathParts = folder.name.split('/')
          if (pathParts.length > 1) {
            const parentPath = pathParts.slice(0, -1).join('/')
            const parentId = nameToIdMap.get(parentPath)
            
            if (parentId && folderMap.has(parentId)) {
              const parent = folderMap.get(parentId)!
              parent.children.push(node)
              node.level = parent.level + 1
              console.log(`📁 (path) Added ${folder.name} as child of ${parent.name}`)
              isRoot = false
            }
          }
        }

        // Si no se encontró padre, es una carpeta raíz
        if (isRoot) {
          roots.push(node)
          console.log(`🌳 Added ${folder.name} as root folder`)
        }
      })

      console.log('🌲 Final tree structure:', roots.map(r => ({ name: r.name, children: r.children.map(c => c.name) })))

      // Ordenar carpetas alfabéticamente
      const sortFolders = (nodes: FolderNode[]) => {
        nodes.sort((a, b) => {
          // Comparar por el nombre sin la ruta para mejor ordenamiento
          const nameA = a.name.split('/').pop() || a.name
          const nameB = b.name.split('/').pop() || b.name
          return nameA.localeCompare(nameB)
        })
        nodes.forEach(node => sortFolders(node.children))
      }
      
      sortFolders(roots)
      return { folderTree: roots, folderMap }
    }

    return createTree(folders)
  }, [folders])

  // Auto-expandir carpetas padres cuando se selecciona una carpeta
  useEffect(() => {
    if (selectedFolderId && folderMap.has(selectedFolderId)) {
      expandParents(selectedFolderId, folderMap)
    }
  }, [selectedFolderId, folderMap])

  // Filtrar carpetas basándose en el término de búsqueda
  const filteredFolders = useMemo(() => {
    if (!searchTerm.trim()) return folderTree

    const filterTree = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.reduce((acc: FolderNode[], node) => {
        // Buscar tanto en el nombre completo como en el nombre sin ruta
        const displayName = node.name.split('/').pop() || node.name
        const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            node.name.toLowerCase().includes(searchTerm.toLowerCase())
        const filteredChildren = filterTree(node.children)
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren
          })
          
          // Auto-expandir carpetas que coinciden con la búsqueda
          if (filteredChildren.length > 0) {
            setExpandedFolders(prev => new Set([...prev, node.id]))
          }
        }
        
        return acc
      }, [])
    }

    return filterTree(folderTree)
  }, [folderTree, searchTerm])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const renderFolder = (folder: FolderNode) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = folder.children.length > 0
    const FolderIconComponent = isExpanded ? getOpenFolderIcon(folder.icon) : getFolderIcon(folder.icon)
    const colorClass = getFolderColor(folder.color)
    
    // Extraer solo el nombre de la carpeta, no la ruta completa
    const displayName = folder.name.split('/').pop() || folder.name

    return (
      <div key={folder.id} className="w-full">
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded-md
            ${isSelected ? 'bg-blue-50 border border-blue-200' : ''}
          `}
          style={{ paddingLeft: `${8 + folder.level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-4 h-3" />
          )}
          
          <FolderIconComponent className={`w-4 h-4 ${colorClass}`} />
          
          <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
            {displayName}
          </span>
          
          {folder.project_count !== undefined && folder.project_count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {folder.project_count}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => renderFolder(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-8"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Opción "Sin carpeta" */}
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded-md
          ${selectedFolderId === null ? 'bg-blue-50 border border-blue-200' : ''}
        `}
        onClick={() => onSelectFolder(null)}
      >
        <div className="w-4 h-3" />
        <FolderOpen className="w-4 h-4 text-gray-500" />
        <span className={`text-sm flex-1 ${selectedFolderId === null ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
          Sin carpeta
        </span>
      </div>

      {/* Árbol de carpetas */}
      <ScrollArea className="h-64 border rounded-md p-1">
        <div className="space-y-1">
          {filteredFolders.length > 0 ? (
            filteredFolders.map(folder => renderFolder(folder))
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron carpetas</p>
              <p className="text-xs">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay carpetas disponibles</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

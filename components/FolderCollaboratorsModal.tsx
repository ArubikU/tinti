import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Folder, FolderCollaborator } from "@/lib/database"
import {
    Crown,
    Edit,
    ExternalLink,
    Eye,
    Trash2,
    UserPlus,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"

interface FolderCollaboratorsModalProps {
  isOpen: boolean
  onClose: () => void
  folder: Folder
  onAddCollaborator: (email: string, role: string) => Promise<void>
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>
  onUpdateCollaborator: (collaboratorId: string, role: string) => Promise<void>
}

export default function FolderCollaboratorsModal({
  isOpen,
  onClose,
  folder,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateCollaborator
}: FolderCollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<(FolderCollaborator & {
    username?: string
    display_name?: string
    avatar_url?: string
    email?: string
  })[]>([])
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("")
  const [newCollaboratorRole, setNewCollaboratorRole] = useState("editor")
  const [loading, setLoading] = useState(false)
  const [addingCollaborator, setAddingCollaborator] = useState(false)

  useEffect(() => {
    if (isOpen && folder.id) {
      fetchCollaborators()
    }
  }, [isOpen, folder.id])

  const fetchCollaborators = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/folders/${folder.id}/collaborators`)
      if (response.ok) {
        const data = await response.json()
        setCollaborators(data.collaborators || [])
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return

    try {
      setAddingCollaborator(true)
      await onAddCollaborator(newCollaboratorEmail, newCollaboratorRole)
      setNewCollaboratorEmail("")
      setNewCollaboratorRole("editor")
      await fetchCollaborators()
    } catch (error) {
      console.error("Error adding collaborator:", error)
    } finally {
      setAddingCollaborator(false)
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      await onRemoveCollaborator(collaboratorId)
      await fetchCollaborators()
    } catch (error) {
      console.error("Error removing collaborator:", error)
    }
  }

  const handleUpdateRole = async (collaboratorId: string, role: string) => {
    try {
      await onUpdateCollaborator(collaboratorId, role)
      await fetchCollaborators()
    } catch (error) {
      console.error("Error updating collaborator:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "editor":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "owner":
        return "Propietario"
      case "editor":
        return "Editor"
      case "viewer":
        return "Visualizador"
      default:
        return role
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colaboradores de "{folder.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agregar nuevo colaborador */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="font-medium">Agregar colaborador</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="email"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="flex-1"
              />
              
              <Select value={newCollaboratorRole} onValueChange={setNewCollaboratorRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleAddCollaborator}
                disabled={!newCollaboratorEmail.trim() || addingCollaborator}
                size="sm"
              >
                {addingCollaborator ? "..." : "Agregar"}
              </Button>
            </div>
          </div>

          {/* Lista de colaboradores */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Colaboradores actuales</h4>
            
            {loading ? (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50 animate-spin" />
                <p className="text-sm">Cargando colaboradores...</p>
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay colaboradores agregados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getRoleIcon(collaborator.role)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {collaborator.display_name || collaborator.username}
                          </span>
                          {collaborator.is_external && (
                            <span title="Colaborador externo">
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </span>
                          )}
                        </div>
                        {collaborator.email && (
                          <div className="text-xs text-gray-500">{collaborator.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getRoleName(collaborator.role)}
                      </Badge>
                      
                      {collaborator.role !== "owner" && (
                        <div className="flex items-center gap-1">
                          <Select 
                            value={collaborator.role} 
                            onValueChange={(role) => handleUpdateRole(collaborator.id, role)}
                          >
                            <SelectTrigger className="w-20 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Ver</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información sobre herencia */}
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
            <div className="font-medium mb-1">ℹ️ Información importante</div>
            <p>
              Los colaboradores se agregarán automáticamente a todos los proyectos 
              que se creen o muevan a esta carpeta.
            </p>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FolderTreeSelector } from "@/components/ui/FolderTreeSelector"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import type { Folder, Project } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { useState } from "react"

interface MoveProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  folders: Folder[]
  onMove: (projectId: string, folderId: string | null) => Promise<void>
}

export const MoveProjectDialog = ({
  isOpen,
  onClose,
  project,
  folders,
  onMove
}: MoveProjectDialogProps) => {
  const { t } = useLanguage()
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  const handleMove = async () => {
    if (!project) return

    setIsMoving(true)
    try {
      await onMove(project.id, selectedFolder)
      onClose()
    } catch (error) {
      console.error("Error moving project:", error)
    } finally {
      setIsMoving(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('project.moveProject')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
              <p className="text-sm text-gray-500">
                {project.canvas_width}×{project.canvas_height}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('project.selectDestinationFolder')}
            </label>
            <FolderTreeSelector
              folders={folders}
              selectedFolderId={selectedFolder}
              onSelectFolder={setSelectedFolder}
              placeholder={t('folders.searchFolders')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <PrimaryButton
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isMoving}
            >
              {t('common.cancel')}
            </PrimaryButton>
            <PrimaryButton
              onClick={handleMove}
              className="flex-1"
              disabled={isMoving}
            >
              {isMoving ? t('project.moving') : t('project.move')}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

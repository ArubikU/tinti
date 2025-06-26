import { PrimaryButton } from "@/components/ui/PrimaryButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Folder } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import { FolderOpen, Plus } from "lucide-react"
import { useState } from "react"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFolder?: string | null
  folders?: (Folder & { project_count: number })[]
  onCreate: (projectData: {
    title: string
    description?: string
    canvas_width: number
    canvas_height: number
    folderId?: string | null
  }) => void
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  selectedFolder,
  folders = [],
  onCreate
}: CreateProjectModalProps) => {
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [canvasPreset, setCanvasPreset] = useState("32x32")
  const [customWidth, setCustomWidth] = useState(32)
  const [customHeight, setCustomHeight] = useState(32)
  const [isCreating, setIsCreating] = useState(false)

  const CANVAS_PRESETS = [
    { name: t('canvas.presets.small'), width: 16, height: 16 },
    { name: t('canvas.presets.medium'), width: 32, height: 32 },
    { name: t('canvas.presets.large'), width: 64, height: 64 },
    { name: t('canvas.presets.rectangular1'), width: 32, height: 16 },
    { name: t('canvas.presets.rectangular2'), width: 48, height: 32 },
    { name: t('canvas.presets.custom'), width: 0, height: 0 },
  ]

  const handleCreate = async () => {
    if (!title.trim()) return

    setIsCreating(true)
    
    const preset = CANVAS_PRESETS.find(p => p.name === canvasPreset)
    const width = preset?.width || customWidth
    const height = preset?.height || customHeight

    try {      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        canvas_width: Math.max(8, Math.min(128, width)),
        canvas_height: Math.max(8, Math.min(128, height)),
        folderId: selectedFolder
      })
      
      // Reset form
      setTitle("")
      setDescription("")
      setCanvasPreset("32x32")
      setCustomWidth(32)
      setCustomHeight(32)
      onClose()
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const selectedPreset = CANVAS_PRESETS.find(p => p.name === canvasPreset)
  const isCustom = selectedPreset?.name === t('canvas.presets.custom')  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('project.createNew')}
          </DialogTitle>
          
          {/* Indicador de carpeta seleccionada */}
          {selectedFolder && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
              <FolderOpen className="w-4 h-4" />
              <span>
                {t('project.saveInFolder')} <strong>
                  {folders.find(f => f.id === selectedFolder)?.name || t('project.folder')}
                </strong>
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Título del proyecto */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('project.titleRequired')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('project.titlePlaceholder')}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('project.descriptionOptional')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('project.descriptionPlaceholder')}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Tamaño del canvas */}
          <div className="space-y-2">
            <Label>{t('project.canvasSize')}</Label>
            <Select value={canvasPreset} onValueChange={setCanvasPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANVAS_PRESETS.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tamaño personalizado */}
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="space-y-2">
                <Label htmlFor="width">{t('project.width')}</Label>
                <Input
                  id="width"
                  type="number"
                  min="8"
                  max="128"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 32)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t('project.height')}</Label>
                <Input
                  id="height"
                  type="number"
                  min="8"
                  max="128"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 32)}
                />
              </div>
            </motion.div>
          )}

          {/* Vista previa del tamaño */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Vista previa del canvas:</div>
            <div className="flex items-center gap-3">
              <div 
                className="bg-white border-2 border-dashed border-gray-300 rounded"
                style={{
                  width: `${Math.min(40, (selectedPreset?.width || customWidth) / 2)}px`,
                  height: `${Math.min(40, (selectedPreset?.height || customHeight) / 2)}px`,
                  minWidth: "20px",
                  minHeight: "20px"
                }}
              />
              <span className="text-sm font-medium">
                {selectedPreset?.width || customWidth} × {selectedPreset?.height || customHeight} píxeles
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <PrimaryButton
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isCreating}
            >
              {t('project.cancel')}
            </PrimaryButton>
            <PrimaryButton
              onClick={handleCreate}
              className="flex-1"
              disabled={!title.trim() || isCreating}
              icon={Plus}
            >
              {isCreating ? t('common.loading') : t('project.create')}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { CreateProjectModal }


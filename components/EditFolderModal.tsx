import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Folder } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import {
  Archive,
  Book,
  Briefcase,
  Code,
  Folder as FolderIcon,
  Heart,
  Image,
  Music,
  Settings,
  Star,
  Video
} from "lucide-react"
import React, { useState } from "react"

interface EditFolderModalProps {
  isOpen: boolean
  onClose: () => void
  folder?: Folder & { project_count?: number }
  onSave: (data: {
    name: string
    description?: string
    color: string
    icon: string
  }) => Promise<void>
}

export default function EditFolderModal({
  isOpen,
  onClose,
  folder,
  onSave
}: EditFolderModalProps) {
  const { t } = useLanguage()
  
  const FOLDER_COLORS = [
    { value: '#3b82f6', name: t('folderModal.colors.blue'), class: 'bg-blue-500' },
    { value: '#ef4444', name: t('folderModal.colors.red'), class: 'bg-red-500' },
    { value: '#10b981', name: t('folderModal.colors.green'), class: 'bg-green-500' },
    { value: '#f59e0b', name: t('folderModal.colors.yellow'), class: 'bg-yellow-500' },
    { value: '#8b5cf6', name: t('folderModal.colors.purple'), class: 'bg-purple-500' },
    { value: '#ec4899', name: t('folderModal.colors.pink'), class: 'bg-pink-500' },
    { value: '#06b6d4', name: t('folderModal.colors.cyan'), class: 'bg-cyan-500' },
    { value: '#84cc16', name: t('folderModal.colors.lime'), class: 'bg-lime-500' },
    { value: '#f97316', name: t('folderModal.colors.orange'), class: 'bg-orange-500' },
    { value: '#6366f1', name: t('folderModal.colors.indigo'), class: 'bg-indigo-500' }
  ]

  const FOLDER_ICONS = [
    { value: 'folder', icon: FolderIcon, name: t('folderModal.icons.folder') },
    { value: 'star', icon: Star, name: t('folderModal.icons.star') },
    { value: 'heart', icon: Heart, name: t('folderModal.icons.heart') },
    { value: 'briefcase', icon: Briefcase, name: t('folderModal.icons.briefcase') },
    { value: 'book', icon: Book, name: t('folderModal.icons.book') },
    { value: 'image', icon: Image, name: t('folderModal.icons.image') },
    { value: 'music', icon: Music, name: t('folderModal.icons.music') },
    { value: 'video', icon: Video, name: t('folderModal.icons.video') },
    { value: 'code', icon: Code, name: t('folderModal.icons.code') },
    { value: 'settings', icon: Settings, name: t('folderModal.icons.settings') },
    { value: 'archive', icon: Archive, name: t('folderModal.icons.archive') }
  ]

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'folder'
  })
  
  const [isSaving, setIsSaving] = useState(false)

  // Actualizar el formulario cuando se abre el modal o cambia la carpeta
  React.useEffect(() => {
    if (isOpen && folder) {
      setFormData({
        name: folder.name || '',
        description: folder.description || '',
        color: folder.color || '#3b82f6',
        icon: folder.icon || 'folder'
      })
    } else if (isOpen && !folder) {
      // Modal para crear nueva carpeta
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'folder'
      })
    }
  }, [isOpen, folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && !isSaving) {
      try {
        setIsSaving(true)
        await onSave(formData)
        // No cerrar aquí, dejar que onSave maneje el cierre
      } catch (error) {
        console.error('Error saving folder:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const selectedIcon = FOLDER_ICONS.find(icon => icon.value === formData.icon)?.icon || FolderIcon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {folder ? t('folderModal.editFolder') : t('folderModal.newFolder')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('folderModal.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('folderModal.namePlaceholder')}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('folderModal.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('folderModal.descriptionPlaceholder')}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Color e Icono en una fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color */}
            <div className="space-y-2">
              <Label>{t('folderModal.color')}</Label>
              <div className="grid grid-cols-5 gap-1">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`
                      w-6 h-6 rounded-full ${color.class} border-2 transition-all
                      ${formData.color === color.value 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:scale-105'
                      }
                    `}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Icono */}
            <div className="space-y-2">
              <Label>{t('folderModal.icon')}</Label>
              <div className="grid grid-cols-4 gap-1">
                {FOLDER_ICONS.slice(0, 8).map((iconData) => {
                  const IconComponent = iconData.icon
                  return (
                    <button
                      key={iconData.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: iconData.value }))}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center
                        ${formData.icon === iconData.value 
                          ? 'border-purple-500 bg-purple-50 scale-105' 
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                        }
                      `}
                      title={iconData.name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('folderModal.preview')}</Label>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              {React.createElement(selectedIcon, {
                className: `w-4 h-4`,
                style: { color: formData.color }
              })}
              <div>
                <div className="font-medium text-sm">{formData.name || t('folderModal.previewPlaceholder')}</div>
                {formData.description && (
                  <div className="text-xs text-gray-500">{formData.description}</div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} size="sm" disabled={isSaving}>
              {t('folderModal.cancel')}
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isSaving} size="sm">
              {isSaving ? t('folderModal.saving') : (folder ? t('folderModal.save') : t('folderModal.create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

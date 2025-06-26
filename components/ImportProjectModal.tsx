import { PrimaryButton } from "@/components/ui/PrimaryButton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import type { Folder } from "@/lib/database"
import { imageToProject, readTinFile, tinFileToProject } from "@/lib/file"
import { useLanguage } from "@/lib/language"
import { FileImage, FolderOpen, Import, Upload } from "lucide-react"
import { useRef, useState } from "react"

interface ImportProjectModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFolder?: string | null
  folders?: (Folder & { project_count: number })[]
  onCreate: (projectData: {
    title: string
    description?: string
    canvas_width: number
    canvas_height: number
    layers_data?: any[]
    frames_data?: any[]
    color_palette?: string[]
    folderId?: string | null
  }) => void
}

export const ImportProjectModal = ({
  isOpen,
  onClose,
  selectedFolder,
  folders = [],
  onCreate
}: ImportProjectModalProps) => {
  const { t } = useLanguage()
  const [isImporting, setIsImporting] = useState(false)
  const tinFileRef = useRef<HTMLInputElement>(null)
  const imageFileRef = useRef<HTMLInputElement>(null)

  const handleTinFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.tin')) {
      toast({
        title: t('common.error'),
        description: t('import.tinFileError'),
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)

    try {
      const buffer = await file.arrayBuffer()
      const tinFile = await readTinFile(buffer)
      const projectData = tinFileToProject(tinFile)

      await onCreate({
        ...projectData,
        folderId: selectedFolder
      })

      toast({
        title: t('import.tinImported'),
        description: t('import.tinImportedDescription', { title: projectData.title })
      })

      onClose()
    } catch (error) {
      console.error("Error importing .tin file:", error)
      toast({
        title: t('import.importError'),
        description: error instanceof Error ? error.message : t('import.tinImportError'),
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      if (tinFileRef.current) {
        tinFileRef.current.value = ""
      }
    }
  }

  const handleImageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('import.imageFileError'),
        variant: "destructive"
      })
      return
    }

    setIsImporting(true)

    try {
      const projectData = await imageToProject(file)

      await onCreate({
        ...projectData,
        folderId: selectedFolder
      })

      toast({
        title: t('import.imageImported'),
        description: t('import.imageImportedDescription', { title: projectData.title })
      })

      onClose()
    } catch (error) {
      console.error("Error importing image:", error)
      toast({
        title: t('import.importError'),
        description: error instanceof Error ? error.message : t('import.imageImportError'),
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      if (imageFileRef.current) {
        imageFileRef.current.value = ""
      }
    }
  }

  return (    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="w-5 h-5" />
            {t('project.import')}
          </DialogTitle>
          
          {/* Indicador de carpeta seleccionada */}
          {selectedFolder && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
              <FolderOpen className="w-4 h-4" />
              <span>
                {t('import.saveInFolder')}: <strong>
                  {folders.find(f => f.id === selectedFolder)?.name || t('import.folder')}
                </strong>
              </span>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="tin-file" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tin-file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t('import.tinFile')}
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              {t('import.image')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tin-file" className="space-y-4">
            <div className="space-y-3">
              <Label>{t('import.selectTinFile')}</Label>
              <p className="text-sm text-gray-600">
                {t('import.tinFileDescription')}
              </p>
              
              <input
                ref={tinFileRef}
                type="file"
                accept=".tin"
                onChange={handleTinFileImport}
                className="hidden"
              />
              
              <PrimaryButton
                onClick={() => tinFileRef.current?.click()}
                disabled={isImporting}
                icon={Upload}
                className="w-full"
              >
                {isImporting ? t('import.importing') : t('import.selectTinFile')}
              </PrimaryButton>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-3">
              <Label>{t('import.selectImage')}</Label>
              <p className="text-sm text-gray-600">
                {t('import.imageDescription')}
              </p>
              
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                onChange={handleImageImport}
                className="hidden"
              />
              
              <PrimaryButton
                onClick={() => imageFileRef.current?.click()}
                disabled={isImporting}
                icon={FileImage}
                className="w-full"
              >
                {isImporting ? t('import.importing') : t('import.selectImage')}
              </PrimaryButton>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4">
          <PrimaryButton
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isImporting}
          >
            {t('common.cancel')}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import type { Project } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useState } from "react"

interface DeleteProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onDelete: (projectId: string) => Promise<void>
}

export function DeleteProjectDialog({ isOpen, onClose, project, onDelete }: DeleteProjectDialogProps) {
  const { t } = useLanguage()
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const isConfirmationValid = confirmationText === project?.title

  const handleDelete = async () => {
    if (!project || !isConfirmationValid) return

    setIsDeleting(true)
    setError("")

    try {
      await onDelete(project.id)
      onClose()
      setConfirmationText("")
    } catch (error: any) {
      setError(error.message || t('project.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
      setConfirmationText("")
      setError("")
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {t('project.deleteProject')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              {t('project.deleteConfirmMessage', { title: project?.title || '' })}
            </p>
            <p className="text-sm text-red-600 font-medium">
              {t('project.deleteWarning')}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>        <div className="py-4">
          <label htmlFor="confirmation" className="text-sm font-medium text-gray-700 block mb-2">
            {t('project.deleteConfirmLabel')}
          </label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={project?.title || t('project.projectName')}
            className="mt-2"
            disabled={isDeleting}
          />
          
          <AnimatePresence>
            {confirmationText && !isConfirmationValid && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-orange-600 mt-2"
              >
                {t('project.deleteNameMismatch')}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <PrimaryButton
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            icon={isDeleting ? undefined : Trash2}
          >
            {isDeleting ? t('project.deleting') : t('project.deleteProject')}
          </PrimaryButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

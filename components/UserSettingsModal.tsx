import { LanguageSelector } from "@/components/LanguageSelector"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/lib/language"
import { Image, Settings, User } from "lucide-react"
import { useEffect, useState } from "react"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    display_name?: string
    avatar_url?: string
  } | null
  onUpdateUser?: (updates: { display_name?: string; avatar_url?: string }) => Promise<void>
}

export const UserSettingsModal = ({ 
  isOpen, 
  onClose, 
  user,
  onUpdateUser 
}: UserSettingsModalProps) => {
  const { t } = useLanguage()
  const [display_name, setdisplay_name] = useState(user?.display_name || '')
  const [avatar_url, setavatar_url] = useState(user?.avatar_url || '')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setdisplay_name(user.display_name || '')
      setavatar_url(user.avatar_url || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!onUpdateUser) return
    
    setIsUpdating(true)
    try {
      await onUpdateUser({
        display_name: display_name.trim() || undefined,
        avatar_url: avatar_url.trim() || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error updating user settings:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const hasChanges = display_name !== (user?.display_name || '') || 
                    avatar_url !== (user?.avatar_url || '')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('auth.settings')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Settings className="w-4 h-4" />
              {t('settings.changeLanguage')}
            </Label>
            <LanguageSelector />
          </div>

          {/* User Settings - Only show if user is logged in */}
          {user && (
            <>
          <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  {t('settings.changeDisplayName')}
                </Label>
                <Input
                  value={display_name}
                  onChange={(e) => setdisplay_name(e.target.value)}
                  placeholder={t('settings.display_name')}
                  maxLength={50}
                />
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Image className="w-4 h-4" />
                  {t('settings.changeAvatarUrl')}
                </Label>
                <Input
                  value={avatar_url}
                  onChange={(e) => setavatar_url(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? t('common.loading') : t('project.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  {t('project.cancel')}
                </Button>
              </div>
            </>
          )}

          {/* Show language-only message for non-logged users */}
          {!user && (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('settings.changeLanguage')} 
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

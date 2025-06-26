"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language"
import { Copy, ExternalLink, QrCode, Share2 } from "lucide-react"

interface ShareProjectModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle: string
}

export function ShareProjectModal({ isOpen, onOpenChange, projectId, projectTitle }: ShareProjectModalProps) {
  const { t } = useLanguage()
  const projectUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/p/${projectId}`
    : `https://tinti.art/p/${projectId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      toast({
        title: t('share.linkCopied'),
        description: t('share.linkCopiedDescription')
      })
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('share.copyError'),
        variant: "destructive"
      })
    }
  }

  const shareOnSocial = (platform: string) => {
    const text = t('share.socialMessage', { title: projectTitle })
    
    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(projectUrl)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + projectUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`
        break
      case "reddit":
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(text)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const openInNewTab = () => {
    window.open(projectUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t('share.shareProject')}
          </DialogTitle>
          <DialogDescription>
            {t('share.shareDescription', { title: projectTitle })}
          </DialogDescription>
        </DialogHeader>        <div className="space-y-6">
          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="p-4 bg-gray-100 border rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">{t('share.qrCode')}</p>
                <p className="text-xs text-gray-400">{t('share.comingSoon')}</p>
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
              <code className="text-sm text-gray-700 flex-1 break-all">
                {projectUrl}
              </code>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                {t('share.copy')}
              </Button>
              <Button size="sm" variant="outline" onClick={openInNewTab} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('common.open')}
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <h4 className="font-medium">{t('share.shareOnSocial')}</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => shareOnSocial("twitter")}
                className="justify-start"
              >
                <div className="w-4 h-4 mr-2 bg-blue-400 rounded"></div>
                Twitter
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => shareOnSocial("facebook")}
                className="justify-start"
              >
                <div className="w-4 h-4 mr-2 bg-blue-600 rounded"></div>
                Facebook
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => shareOnSocial("whatsapp")}
                className="justify-start"
              >
                <div className="w-4 h-4 mr-2 bg-green-500 rounded"></div>
                WhatsApp
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => shareOnSocial("linkedin")}
                className="justify-start"
              >
                <div className="w-4 h-4 mr-2 bg-blue-700 rounded"></div>
                LinkedIn
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => shareOnSocial("reddit")}
                className="justify-start"
              >
                <div className="w-4 h-4 mr-2 bg-orange-500 rounded"></div>
                Reddit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { ShareProjectModal } from "@/components/ShareProjectModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { Project } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import {
  Copy,
  Crown,
  Edit,
  Eye,
  Globe,
  Link,
  Lock,
  Settings,
  Share2,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X
} from "lucide-react"
import React, { useState } from "react"

interface ProjectSettingsProps {
  project: Project
  onUpdate: (updates: Partial<Project>) => void
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProjectSettings({ project, onUpdate, trigger, isOpen: controlledOpen, onOpenChange }: ProjectSettingsProps) {
  const { t } = useLanguage()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(project.is_public || false)
  const [isCollaborative, setIsCollaborative] = useState(project.is_collaborative || false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description || "")
  const [tags, setTags] = useState<string[]>(project.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("")
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  // Cargar colaboradores cuando se abre el diálogo
  const fetchCollaborators = async () => {
    if (!isCollaborative) return
    
    setIsLoadingCollaborators(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/collaborators`)
      if (response.ok) {
        const data = await response.json()
        setCollaborators(data.collaborators || [])
      }
    } catch (error) {
      console.error("Error loading collaborators:", error)
    } finally {
      setIsLoadingCollaborators(false)
    }
  }

  // Cargar colaboradores cuando se abre el diálogo y está en modo colaborativo
  React.useEffect(() => {
    if (isOpen && isCollaborative) {
      fetchCollaborators()
    }
  }, [isOpen, isCollaborative, project.id])

  // Limpiar colaboradores cuando se desactiva la colaboración
  React.useEffect(() => {
    if (!isCollaborative) {
      setCollaborators([])
    }
  }, [isCollaborative])
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = {
        title,
        description,
        is_public: isPublic,
        is_collaborative: isCollaborative,
        tags
      }
      
      await onUpdate(updates)
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating project:", error)
      alert(t('projectSettings.actions.updateError'))
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const copyProjectUrl = async () => {
    const url = typeof window !== "undefined" 
      ? `${window.location.origin}/p/${project.id}`
      : `https://tinti.art/p/${project.id}`
    
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: t('projectSettings.sharing.linkCopied'),
        description: t('projectSettings.sharing.linkCopiedDescription')
      })
    } catch (error) {
      toast({
        title: t('projectSettings.sharing.copyError'),
        description: t('projectSettings.sharing.copyErrorDescription'),
        variant: "destructive"
      })
    }
  }

  const shareOnSocial = (platform: string) => {
    const url = typeof window !== "undefined" 
      ? `${window.location.origin}/p/${project.id}`
      : `https://tinti.art/p/${project.id}`
    
    const text = t('projectSettings.sharing.socialShareText').replace('{title}', title)
    
    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }
  const addCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return
    
    try {
      const response = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newCollaboratorEmail.trim(),
          role: "editor"
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNewCollaboratorEmail("")
        setCollaborators(prev => [...prev, data.collaborator])
        toast({
          title: t('projectSettings.collaboration.addSuccess'),
          description: `${t('projectSettings.collaboration.addSuccessDescription')} ${newCollaboratorEmail}`
        })
      } else {
        const error = await response.json()
        toast({
          title: t('projectSettings.sharing.copyError'),
          description: error.error || t('projectSettings.collaboration.addError'),
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: t('projectSettings.sharing.copyError'),
        description: t('projectSettings.collaboration.connectionError'),
        variant: "destructive"
      })
    }
  }

  const removeCollaborator = async (collaboratorId: string, email: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/collaborators/${collaboratorId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
        toast({
          title: t('projectSettings.collaboration.removeSuccess'),
          description: `${t('projectSettings.collaboration.removeSuccessDescription')} ${email} ${t('projectSettings.collaboration.removeSuccessDescriptionEnd')}`
        })
      } else {
        const error = await response.json()
        toast({
          title: t('projectSettings.sharing.copyError'),
          description: error.error || t('projectSettings.collaboration.removeError'),
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: t('projectSettings.sharing.copyError'),
        description: t('projectSettings.collaboration.connectionError'),
        variant: "destructive"
      })
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('projectSettings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('projectSettings.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t('projectSettings.tabs.general')}</TabsTrigger>
            <TabsTrigger value="sharing">{t('projectSettings.tabs.sharing')}</TabsTrigger>
            <TabsTrigger value="collaboration">{t('projectSettings.tabs.collaboration')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
          {/* Información básica */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">{t('projectSettings.general.basicInfo')}</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t('projectSettings.general.projectTitle')}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('projectSettings.general.titlePlaceholder')}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="description">{t('projectSettings.general.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('projectSettings.general.descriptionPlaceholder')}
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
              </div>
            </div>
          </Card>

          {/* Visibilidad */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">{t('projectSettings.general.visibility')}</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <div className="font-medium">
                    {isPublic ? t('projectSettings.general.publicProject') : t('projectSettings.general.privateProject')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isPublic 
                      ? t('projectSettings.general.publicDescription')
                      : t('projectSettings.general.privateDescription')
                    }
                  </div>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {isPublic && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-800">{t('projectSettings.general.publicInfo')}</div>
                    <ul className="text-blue-700 mt-1 space-y-1">
                      <li>• {t('projectSettings.general.publicFeatures.gallery')}</li>
                      <li>• {t('projectSettings.general.publicFeatures.interactions')}</li>
                      <li>• {t('projectSettings.general.publicFeatures.publicUrl')}</li>
                      <li>• {t('projectSettings.general.publicFeatures.stats')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tags */}
          {isPublic && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">{t('projectSettings.general.tags')}</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('projectSettings.general.addTag')}
                    maxLength={20}
                  />
                  <Button 
                    onClick={addTag} 
                    disabled={!newTag.trim() || tags.length >= 10}
                    size="sm"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">
                  {tags.length}/10 {t('projectSettings.general.tagsHelp')}
                </p>
              </div>
            </Card>
          )}          {/* Vista previa de URL pública */}
          {isPublic && (
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">{t('projectSettings.general.publicUrl')}</h3>
              <div className="flex items-center gap-2 p-2 bg-white border rounded">
                <Globe className="w-4 h-4 text-gray-500" />
                <code className="text-sm text-gray-700 flex-1">
                  {typeof window !== "undefined" 
                    ? `${window.location.origin}/p/${project.id}`
                    : `https://tinti.art/p/${project.id}`
                  }
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('projectSettings.general.urlAccessible')}
              </p>
            </Card>
          )}
          </TabsContent>

          {/* Tab de Compartir */}
          <TabsContent value="sharing" className="space-y-6 mt-6">
            {!isPublic ? (
              <Card className="p-6 text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('projectSettings.sharing.privateProject')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('projectSettings.sharing.privateDescription')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tabs = document.querySelector('[role="tablist"]')
                    const generalTab = tabs?.querySelector('[value="general"]') as HTMLButtonElement
                    generalTab?.click()
                  }}
                >
                  {t('projectSettings.sharing.goToGeneral')}
                </Button>
              </Card>
            ) : (
              <>
                {/* Enlace directo */}                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    {t('projectSettings.sharing.directLink')}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <code className="text-sm text-gray-700 flex-1 break-all">
                        {typeof window !== "undefined" 
                          ? `${window.location.origin}/p/${project.id}`
                          : `https://tinti.art/p/${project.id}`
                        }
                      </code>
                      <Button size="sm" variant="outline" onClick={copyProjectUrl}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => setShowShareModal(true)}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('projectSettings.sharing.quickShare')}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => shareOnSocial("twitter")}
                        className="flex-1"
                      >
                        Twitter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => shareOnSocial("facebook")}
                        className="flex-1"
                      >
                        Facebook
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => shareOnSocial("whatsapp")}
                        className="flex-1"
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Embed Code */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">{t('projectSettings.sharing.embedCode')}</h3>
                  
                  <div className="space-y-3">
                    <Textarea
                      readOnly
                      value={`<iframe src="${typeof window !== "undefined" 
                        ? window.location.origin 
                        : "https://tinti.art"}/p/${project.id}?embed=true" width="400" height="400" frameborder="0"></iframe>`}
                      rows={3}
                      className="font-mono text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        const embedCode = `<iframe src="${typeof window !== "undefined" 
                          ? window.location.origin 
                          : "https://tinti.art"}/p/${project.id}?embed=true" width="400" height="400" frameborder="0"></iframe>`
                        
                        try {
                          await navigator.clipboard.writeText(embedCode)
                          toast({
                            title: t('projectSettings.sharing.codeCopied'),
                            description: t('projectSettings.sharing.codeCopiedDescription')
                          })
                        } catch (error) {
                          toast({
                            title: t('projectSettings.sharing.copyError'),
                            description: t('projectSettings.sharing.copyErrorDescription'),
                            variant: "destructive"
                          })
                        }
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('projectSettings.sharing.copyCode')}
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab de Colaboración */}
          <TabsContent value="collaboration" className="space-y-6 mt-6">
            {/* Activar colaboración */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('projectSettings.collaboration.title')}
              </h3>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${isCollaborative ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <div className="font-medium">
                      {isCollaborative ? t('projectSettings.collaboration.activated') : t('projectSettings.collaboration.deactivated')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isCollaborative 
                        ? t('projectSettings.collaboration.activatedDescription')
                        : t('projectSettings.collaboration.deactivatedDescription')
                      }
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isCollaborative}
                  onCheckedChange={setIsCollaborative}
                />
              </div>

              {isCollaborative && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800">{t('projectSettings.collaboration.activationInfo')}</div>
                      <ul className="text-blue-700 mt-1 space-y-1">
                        <li>• {t('projectSettings.collaboration.activationFeatures.invite')}</li>
                        <li>• {t('projectSettings.collaboration.activationFeatures.uniqueId')}</li>
                        <li>• {t('projectSettings.collaboration.activationFeatures.realTime')}</li>
                        <li>• {t('projectSettings.collaboration.activationFeatures.permissions')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Gestión de colaboradores */}
            {isCollaborative && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {t('projectSettings.collaboration.manage')}
                </h3>
                
                {/* Agregar colaborador */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={t('projectSettings.collaboration.inviteEmail')}
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addCollaborator} disabled={!newCollaboratorEmail.trim()}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('projectSettings.collaboration.invite')}
                    </Button>
                  </div>

                  {/* Lista de colaboradores */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">{t('projectSettings.collaboration.owner')}</div>
                          <div className="text-sm text-gray-600">{t('projectSettings.collaboration.ownerDescription')}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">{t('projectSettings.collaboration.ownerBadge')}</Badge>
                    </div>                    {/* Placeholder para colaboradores */}
                    {isLoadingCollaborators ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>{t('projectSettings.collaboration.loading')}</p>
                      </div>
                    ) : collaborators.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t('projectSettings.collaboration.noCollaborators')}</p>
                        <p className="text-sm">{t('projectSettings.collaboration.noCollaboratorsDescription')}</p>
                      </div>
                    ) : null}

                    {/* Lista de colaboradores */}
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Edit className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{collab.display_name || collab.username}</div>
                            <div className="text-sm text-gray-600">{collab.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{collab.role}</Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeCollaborator(collab.id, collab.email)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ID de colaboración */}
                {project.collaboration_id && (
                  <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('projectSettings.collaboration.collaborationId')}</div>
                        <code className="text-sm text-gray-600">#{project.collaboration_id}</code>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`#${project.collaboration_id}`)
                            toast({
                              title: t('projectSettings.collaboration.idCopied'),
                              description: t('projectSettings.collaboration.idCopiedDescription')
                            })
                          } catch (error) {
                            toast({
                              title: t('projectSettings.sharing.copyError'),
                              description: t('projectSettings.sharing.copyErrorDescription'),
                              variant: "destructive"
                            })
                          }
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('projectSettings.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? t('projectSettings.actions.saving') : t('projectSettings.actions.saveChanges')}
          </Button>        </DialogFooter>
      </DialogContent>

      {/* Modal de compartir */}
      <ShareProjectModal
        isOpen={showShareModal}
        onOpenChange={setShowShareModal}
        projectId={project.id}
        projectTitle={title}
      />
    </Dialog>
  )
}

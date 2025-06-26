"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/database"
import { MessageCircle, MoreHorizontal, Send, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface ProjectCommentsProps {
  projectId: string
  currentUser: User | null
  projectOwnerId: string
}

export function ProjectComments({ projectId, currentUser, projectOwnerId }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [projectId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }
  const submitComment = async () => {
    if (!currentUser || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment("")
      } else if (response.status === 401) {
        alert("Debes iniciar sesión para comentar")
      } else {
        const error = await response.json()
        alert(error.error || "Error al enviar comentario")
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
      alert("Error al enviar comentario")
    } finally {
      setSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) return

    try {
      const response = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar comentario")
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
      alert("Error al eliminar comentario")
    }
  }
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "hace un momento"
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} día${Math.floor(diffInSeconds / 86400) === 1 ? '' : 's'}`
    
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const canDeleteComment = (comment: Comment) => {
    if (!currentUser) return false
    return comment.user.username === currentUser.username || currentUser.id === projectOwnerId
  }
  return (
    <Card className="p-6 bg-white/40 border-rounded-xl backdrop-blur-md border border-white/20 text-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#A678FF]" />
        <h3 className="text-xl font-bold text-gray-800">Comentarios ({comments.length})</h3>
      </div>

      {/* Formulario para nuevo comentario */}
      {currentUser ? (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <img
              src={
                currentUser.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
              }
              alt={currentUser.display_name || currentUser.username}
              className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/30"
            />            <div className="flex-1">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    submitComment()
                  }
                }}
                className="min-h-[80px] bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 placeholder:text-gray-600 resize-none focus:border-[#A678FF]/50"
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {newComment.length}/1000
                  </span>
                  <span className="text-xs text-gray-500">
                    Ctrl+Enter para enviar
                  </span>
                </div>
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                  className="bg-gradient-to-r from-[#A678FF] to-[#965fff] text-white hover:from-[#965fff] hover:to-[#8a4fff]"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>      ) : (
        <div className="mb-6 p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-center">
          <p className="text-gray-700">
            <button 
              onClick={() => window.location.href = '#auth'}
              className="text-[#A678FF] hover:text-[#965fff] underline font-medium"
            >
              Inicia sesión
            </button>{" "}
            para dejar un comentario
          </p>
        </div>
      )}      {/* Lista de comentarios */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Cargando comentarios...</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay comentarios aún</p>
          <p className="text-sm text-gray-500">Sé el primero en comentar este proyecto</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <img
                src={
                  comment.user.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.username}`
                }
                alt={comment.user.display_name || comment.user.username}
                className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/30"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.user.display_name || comment.user.username}
                    </span>
                    <span className="text-xs text-gray-600">
                      @{comment.user.username}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
              
              {canDeleteComment(comment) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-white/20"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-md border border-white/30">
                    <DropdownMenuItem
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100/50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

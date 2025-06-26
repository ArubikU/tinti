import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Tipos de base de datos
export interface User {
  id: string
  username: string
  email: string
  display_name?: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export interface Frame {
  id: number
  name: string
  layers: any[]
  duration: number // duración en milisegundos
}

export interface Project {
  id: string
  title: string
  description?: string
  owner_id: string
  username?: string
  display_name?: string
  avatar_url?: string
  canvas_width: number
  canvas_height: number
  is_public: boolean
  is_collaborative: boolean
  collaboration_id?: string
  data?: any
  frames?: Frame[] // soporte para animaciones
  current_frame?: number
  animation_fps?: number
  thumbnail_url?: string
  tags: string[]
  created_at: string
  updated_at: string
  owner?: User
  likes_count?: number
  views_count?: number
  is_liked?: boolean
  folder_id?: string
  folder_name?: string
}

export interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  owner_id: string
  parent_id?: string
  created_at: string
  updated_at: string
  is_external?: boolean
  collaborators?: FolderCollaborator[]
}

export interface FolderCollaborator {
  id: string
  folder_id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  invited_at: string
  is_external: boolean
  user?: User
}

export interface Collaborator {
  id: string
  project_id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  invited_at: string
  user?: User
}

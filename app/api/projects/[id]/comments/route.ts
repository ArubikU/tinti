import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener comentarios de un proyecto público
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verificar que el proyecto existe y es público
    const [project] = await sql`
      SELECT id FROM projects WHERE id = ${id} AND is_public = TRUE
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found or not public" }, { status: 404 })
    }

    // Obtener comentarios con información del usuario
    const comments = await sql`
      SELECT c.*, u.username, u.display_name, u.avatar_url
      FROM project_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ${id}
      ORDER BY c.created_at DESC
    `

    // Formatear comentarios
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        username: comment.username,
        display_name: comment.display_name,
        avatar_url: comment.avatar_url
      }
    }))

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Crear un nuevo comentario
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment is too long (max 1000 characters)" }, { status: 400 })
    }

    // Verificar que el proyecto existe y es público
    const [project] = await sql`
      SELECT id FROM projects WHERE id = ${id} AND is_public = TRUE
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found or not public" }, { status: 404 })
    }

    // Crear comentario
    const [comment] = await sql`
      INSERT INTO project_comments (project_id, user_id, content)
      VALUES (${id}, ${decoded.userId}, ${content.trim()})
      RETURNING *
    `

    // Obtener información del usuario para la respuesta
    const [user] = await sql`
      SELECT username, display_name, avatar_url
      FROM users WHERE id = ${decoded.userId}
    `

    const newComment = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      }
    }

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

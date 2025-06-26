import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Eliminar un comentario
export async function DELETE(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    const { id: projectId, commentId } = params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verificar que el comentario existe y obtener información
    const [comment] = await sql`
      SELECT c.user_id, c.project_id, p.owner_id, p.is_public
      FROM project_comments c
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${commentId} AND c.project_id = ${projectId}
    `

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (!comment.is_public) {
      return NextResponse.json({ error: "Project is not public" }, { status: 403 })
    }

    // Verificar permisos: el autor del comentario o el dueño del proyecto pueden eliminar
    if (comment.user_id !== decoded.userId && comment.owner_id !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Eliminar comentario
    await sql`
      DELETE FROM project_comments WHERE id = ${commentId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

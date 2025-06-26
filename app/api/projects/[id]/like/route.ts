import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

// Toggle like en proyecto
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

    // Verificar que el proyecto existe y es público
    const [project] = await sql`
      SELECT id FROM projects WHERE id = ${id} AND is_public = TRUE
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found or not public" }, { status: 404 })
    }

    // Verificar si ya le dio like
    const [existingLike] = await sql`
      SELECT 1 FROM project_likes 
      WHERE project_id = ${id} AND user_id = ${decoded.userId}
    `

    let isLiked: boolean

    if (existingLike) {
      // Quitar like
      await sql`
        DELETE FROM project_likes 
        WHERE project_id = ${id} AND user_id = ${decoded.userId}
      `
      isLiked = false
    } else {
      // Agregar like
      await sql`
        INSERT INTO project_likes (project_id, user_id)
        VALUES (${id}, ${decoded.userId})
      `
      isLiked = true
    }

    // Obtener nuevo conteo
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM project_likes WHERE project_id = ${id}
    `

    return NextResponse.json({
      isLiked,
      likesCount: Number.parseInt(count),
    })
  } catch (error) {
    console.error("Toggle like error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

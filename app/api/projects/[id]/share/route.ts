import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

// Obtener información de compartir
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const [project] = await sql`
      SELECT id, title, is_public, is_collaborative, collaboration_id, owner_id
      FROM projects 
      WHERE id = ${id} AND owner_id = ${decoded.userId}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
    }

    // Obtener colaboradores
    const collaborators = await sql`
      SELECT c.*, u.username, u.display_name, u.avatar_url
      FROM collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ${id}
    `

    return NextResponse.json({
      project,
      collaborators,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${id}`,
      collaborationCode: project.collaboration_id,
    })
  } catch (error) {
    console.error("Get share info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Actualizar configuración de compartir
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { is_public, is_collaborative, regenerate_code } = await request.json()

    // Verificar ownership
    const [project] = await sql`
      SELECT owner_id FROM projects WHERE id = ${id}
    `

    if (!project || project.owner_id !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    let collaboration_id = null
    if (regenerate_code || (is_collaborative && !project.collaboration_id)) {
      collaboration_id = Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    const [updatedProject] = await sql`
      UPDATE projects 
      SET 
        is_public = COALESCE(${is_public}, is_public),
        is_collaborative = COALESCE(${is_collaborative}, is_collaborative),
        collaboration_id = COALESCE(${collaboration_id}, collaboration_id),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error("Update share settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

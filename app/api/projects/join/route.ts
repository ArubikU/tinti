import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

// Unirse a proyecto por código de colaboración
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { collaboration_code } = await request.json()

    if (!collaboration_code) {
      return NextResponse.json({ error: "Collaboration code required" }, { status: 400 })
    }

    // Buscar proyecto por código
    const [project] = await sql`
      SELECT id, title, owner_id, is_collaborative
      FROM projects 
      WHERE collaboration_id = ${collaboration_code.toUpperCase()} AND is_collaborative = TRUE
    `

    if (!project) {
      return NextResponse.json({ error: "Invalid collaboration code" }, { status: 404 })
    }

    // Verificar que no sea el owner
    if (project.owner_id === decoded.userId) {
      return NextResponse.json({ error: "You are already the owner of this project" }, { status: 409 })
    }

    // Verificar que no sea ya colaborador
    const [existing] = await sql`
      SELECT 1 FROM collaborators 
      WHERE project_id = ${project.id} AND user_id = ${decoded.userId}
    `

    if (existing) {
      return NextResponse.json({ error: "You are already a collaborator" }, { status: 409 })
    }

    // Agregar como colaborador
    await sql`
      INSERT INTO collaborators (project_id, user_id, role)
      VALUES (${project.id}, ${decoded.userId}, 'editor')
    `

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
      },
    })
  } catch (error) {
    console.error("Join project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

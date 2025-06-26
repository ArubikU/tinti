import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const projects = await sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url,
             COALESCE(likes_data.likes_count, 0) as likes_count,
             pf.folder_id,
             f.name as folder_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_folders pf ON p.id = pf.project_id
      LEFT JOIN folders f ON pf.folder_id = f.id
      LEFT JOIN (
        SELECT project_id, COUNT(user_id) as likes_count
        FROM project_likes
        GROUP BY project_id
      ) likes_data ON p.id = likes_data.project_id
      WHERE p.owner_id = ${decoded.userId}
         OR p.id IN (
           SELECT project_id FROM collaborators WHERE user_id = ${decoded.userId}
         )
      ORDER BY p.updated_at DESC
    `

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { title, description, canvas_width = 32, canvas_height = 32, is_public = false, data } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Generar collaboration_id único
    const collaboration_id = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Usar datos proporcionados o datos por defecto
    const projectData = data || {
      layers: [{ id: 0, name: "Layer 1", visible: true, opacity: 1, pixels: {} }],
      activeLayer: 0,
    }

    const [project] = await sql`
      INSERT INTO projects (title, description, owner_id, canvas_width, canvas_height, is_public, collaboration_id, is_collaborative, data)
      VALUES (${title}, ${description}, ${decoded.userId}, ${canvas_width}, ${canvas_height}, ${is_public}, ${collaboration_id}, TRUE, ${JSON.stringify(projectData)})
      RETURNING *
    `

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

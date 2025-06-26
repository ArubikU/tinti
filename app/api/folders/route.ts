import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener carpetas del usuario
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

    const folders = await sql`
      SELECT f.*, 
             COALESCE(folder_counts.project_count, 0) as project_count,
             COALESCE(folder_collab.collaborator_count, 0) as collaborator_count,
             CASE WHEN fc.user_id IS NOT NULL THEN true ELSE false END as is_external
      FROM folders f
      LEFT JOIN (
        SELECT 
          f.id as folder_id,
          COUNT(DISTINCT pf.project_id) as project_count
        FROM folders f
        LEFT JOIN project_folders pf ON f.id = pf.folder_id
        LEFT JOIN projects p ON pf.project_id = p.id
        WHERE f.owner_id = ${decoded.userId}
          AND (p.owner_id = ${decoded.userId} OR p.id IS NULL)
        GROUP BY f.id
      ) folder_counts ON f.id = folder_counts.folder_id
      LEFT JOIN (
        SELECT 
          fc.folder_id,
          COUNT(*) as collaborator_count
        FROM folder_collaborators fc
        GROUP BY fc.folder_id
      ) folder_collab ON f.id = folder_collab.folder_id
      LEFT JOIN folder_collaborators fc ON f.id = fc.folder_id AND fc.user_id = ${decoded.userId} AND fc.is_external = true
      WHERE f.owner_id = ${decoded.userId} OR fc.user_id = ${decoded.userId}
      ORDER BY f.created_at DESC
    `

    return NextResponse.json({ folders })
  } catch (error) {
    console.error("Get folders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Crear nueva carpeta
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

    const { name, parent_id, description, color, icon } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 })
    }

    const [folder] = await sql`
      INSERT INTO folders (name, owner_id, parent_id, description, color, icon)
      VALUES (${name}, ${decoded.userId}, ${parent_id || null}, ${description || null}, ${color || '#3b82f6'}, ${icon || 'folder'})
      RETURNING *
    `

    return NextResponse.json({ folder })
  } catch (error) {
    console.error("Create folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Mover proyecto a carpeta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { folder_id } = await request.json()

    // Verificar que el proyecto pertenece al usuario
    const [project] = await sql`
      SELECT * FROM projects 
      WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Si folder_id es null, remover de todas las carpetas
    if (folder_id === null) {
      await sql`
        DELETE FROM project_folders 
        WHERE project_id = ${params.id}
      `
      return NextResponse.json({ success: true })
    }

    // Verificar que la carpeta pertenece al usuario
    const [folder] = await sql`
      SELECT * FROM folders 
      WHERE id = ${folder_id} AND owner_id = ${decoded.userId}
    `

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Remover de carpetas anteriores
    await sql`
      DELETE FROM project_folders 
      WHERE project_id = ${params.id}
    `

    // Agregar a la nueva carpeta
    await sql`
      INSERT INTO project_folders (project_id, folder_id)
      VALUES (${params.id}, ${folder_id})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Move project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Remover proyecto de carpeta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verificar que el proyecto pertenece al usuario
    const [project] = await sql`
      SELECT * FROM projects 
      WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM project_folders 
      WHERE project_id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove project from folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

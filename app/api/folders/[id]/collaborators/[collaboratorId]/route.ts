import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Eliminar colaborador de un folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, collaboratorId: string } }
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

    // Verificar que es propietario del folder
    const [folder] = await sql`
      SELECT * FROM folders WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or not owner" }, { status: 404 })
    }

    // Eliminar colaborador
    const [deleted] = await sql`
      DELETE FROM folder_collaborators 
      WHERE id = ${params.collaboratorId} AND folder_id = ${params.id}
      RETURNING *
    `

    if (!deleted) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove folder collaborator error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Actualizar rol de colaborador
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, collaboratorId: string } }
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

    const { role } = await request.json()

    if (!role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Verificar que es propietario del folder
    const [folder] = await sql`
      SELECT * FROM folders WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or not owner" }, { status: 404 })
    }

    // Actualizar rol del colaborador
    const [updated] = await sql`
      UPDATE folder_collaborators 
      SET role = ${role}
      WHERE id = ${params.collaboratorId} AND folder_id = ${params.id}
      RETURNING *
    `

    if (!updated) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
    }

    return NextResponse.json({ collaborator: updated })
  } catch (error) {
    console.error("Update folder collaborator error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

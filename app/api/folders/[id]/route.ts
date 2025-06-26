import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Actualizar carpeta
export async function PUT(
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

    const { name, description, color, icon } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 })
    }

    // Verificar que el usuario es propietario o colaborador con permisos de edición
    const [access] = await sql`
      SELECT f.*, fc.role as collaborator_role
      FROM folders f
      LEFT JOIN folder_collaborators fc ON f.id = fc.folder_id AND fc.user_id = ${decoded.userId}
      WHERE f.id = ${params.id} 
        AND (f.owner_id = ${decoded.userId} OR (fc.user_id = ${decoded.userId} AND fc.role IN ('editor', 'owner')))
    `

    if (!access) {
      return NextResponse.json({ error: "Folder not found or no edit permissions" }, { status: 404 })
    }

    const [folder] = await sql`
      UPDATE folders 
      SET name = ${name}, 
          description = ${description || null},
          color = ${color || access.color},
          icon = ${icon || access.icon},
          updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    return NextResponse.json({ folder })
  } catch (error) {
    console.error("Update folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Eliminar carpeta
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

    // Obtener información de la carpeta a eliminar
    const [folderToDelete] = await sql`
      SELECT * FROM folders 
      WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!folderToDelete) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Verificar que la carpeta y sus subcarpetas estén vacías de proyectos
    const [projectCount] = await sql`
      SELECT COUNT(*) as count
      FROM project_folders pf
      JOIN folders f ON pf.folder_id = f.id
      WHERE f.owner_id = ${decoded.userId}
        AND (f.id = ${params.id} OR f.name LIKE ${folderToDelete.name + '/%'})
    `

    if (projectCount.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete folder with projects. Move projects first." },
        { status: 400 }
      )
    }

    // Eliminar todas las subcarpetas (carpetas que empiecen con el nombre + '/')
    await sql`
      DELETE FROM folders 
      WHERE owner_id = ${decoded.userId}
        AND (id = ${params.id} OR name LIKE ${folderToDelete.name + '/%'})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { getAuthenticatedUser } from "@/lib/auth";
import { sql } from "@/lib/database";
import { type NextRequest, NextResponse } from "next/server";

// Actualizar rol de colaborador
export async function PUT(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const { id: projectId, userId } = params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { role } = await request.json()

    // Verificar que sea owner del proyecto
    const [project] = await sql`
      SELECT owner_id FROM projects WHERE id = ${projectId}
    `

    if (!project || project.owner_id !== user.id) {
      return NextResponse.json({ error: "Solo el propietario puede actualizar roles de colaborador" }, { status: 403 })
    }

    const [updatedCollaborator] = await sql`
      UPDATE collaborators 
      SET role = ${role}
      WHERE project_id = ${projectId} AND user_id = ${userId}
      RETURNING *
    `

    if (!updatedCollaborator) {
      return NextResponse.json({ error: "Colaborador no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ collaborator: updatedCollaborator })
  } catch (error) {
    console.error("Error actualizando colaborador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Eliminar colaborador
export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const { id: projectId, userId } = params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que sea owner del proyecto o el propio colaborador
    const [project] = await sql`
      SELECT owner_id FROM projects WHERE id = ${projectId}
    `

    if (!project || (project.owner_id !== user.id && user.id !== userId)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Eliminar colaborador
    await sql`
      DELETE FROM collaborators 
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `

    // Verificar si quedan colaboradores, si no, desactivar colaboración
    const remainingCollaborators = await sql`
      SELECT COUNT(*) as count FROM collaborators 
      WHERE project_id = ${projectId}
    `

    if (remainingCollaborators[0].count === 0) {
      await sql`
        UPDATE projects 
        SET is_collaborative = false
        WHERE id = ${projectId}
      `
    }

    return NextResponse.json({
      message: "Colaborador eliminado exitosamente"
    })
  } catch (error) {
    console.error("Error eliminando colaborador:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

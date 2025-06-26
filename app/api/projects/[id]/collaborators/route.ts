import { getAuthenticatedUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener colaboradores
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar acceso al proyecto
    const [access] = await sql`
      SELECT 1 FROM projects p
      LEFT JOIN collaborators c ON p.id = c.project_id
      WHERE p.id = ${id} 
      AND (p.owner_id = ${user.id} OR c.user_id = ${user.id})
    `

    if (!access) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const collaborators = await sql`
      SELECT c.*, u.username, u.display_name, u.avatar_url, u.email
      FROM collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ${id}
      ORDER BY c.invited_at DESC
    `

    return NextResponse.json({ collaborators })
  } catch (error) {
    console.error("Error obteniendo colaboradores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Agregar colaborador
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { email, role = "editor" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    // Verificar que sea propietario del proyecto
    const [project] = await sql`
      SELECT * FROM projects 
      WHERE id = ${id} AND owner_id = ${user.id}
    `

    if (!project) {
      return NextResponse.json({ error: "Solo el propietario puede agregar colaboradores" }, { status: 403 })
    }

    // Buscar usuario por email
    const [targetUser] = await sql`
      SELECT id, username, email, display_name FROM users 
      WHERE email = ${email}
    `

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado con ese email" }, { status: 404 })
    }

    // Verificar que no sea el mismo propietario
    if (targetUser.id === user.id) {
      return NextResponse.json({ error: "No puedes agregarte como colaborador" }, { status: 400 })
    }

    // Verificar que no sea ya colaborador
    const [existing] = await sql`
      SELECT * FROM collaborators 
      WHERE project_id = ${id} AND user_id = ${targetUser.id}
    `

    if (existing) {
      return NextResponse.json({ error: "Este usuario ya es colaborador del proyecto" }, { status: 400 })
    }

    // Agregar colaborador
    const [collaborator] = await sql`
      INSERT INTO collaborators (project_id, user_id, role)
      VALUES (${id}, ${targetUser.id}, ${role})
      RETURNING *
    `

    // Activar colaboración y generar ID si no existe
    if (!project.collaboration_id) {
      const collaborationId = Math.random().toString(36).substring(2, 10).toUpperCase()
      await sql`
        UPDATE projects 
        SET is_collaborative = true, collaboration_id = ${collaborationId}
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE projects 
        SET is_collaborative = true
        WHERE id = ${id}
      `
    }

    const [fullCollaborator] = await sql`
      SELECT c.*, u.username, u.display_name, u.avatar_url, u.email
      FROM collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${collaborator.id}
    `

    return NextResponse.json({
      message: "Colaborador agregado exitosamente",
      collaborator: fullCollaborator
    })
  } catch (error) {
    console.error("Error agregando colaborador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

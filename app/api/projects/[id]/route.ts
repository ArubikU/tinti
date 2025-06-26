import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener un proyecto específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = request.cookies.get("auth-token")?.value

    // Para proyectos públicos no necesitamos autenticación
    const [project] = await sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url,
             COUNT(pl.user_id) as likes_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_likes pl ON p.id = pl.project_id
      WHERE p.id = ${id}
      GROUP BY p.id, u.username, u.display_name, u.avatar_url
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Si es privado, verificar permisos
    if (!project.is_public) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Verificar si es owner o colaborador
      const [access] = await sql`
        SELECT 1 FROM projects p
        LEFT JOIN collaborators c ON p.id = c.project_id
        WHERE p.id = ${id} 
        AND (p.owner_id = ${decoded.userId} OR c.user_id = ${decoded.userId})
      `

      if (!access) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    // Verificar si el usuario actual le dio like (si está autenticado)
    let isLiked = false
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const [like] = await sql`
          SELECT 1 FROM project_likes 
          WHERE project_id = ${id} AND user_id = ${decoded.userId}
        `
        isLiked = !!like
      }
    }

    // Formatear respuesta con información del owner
    const formattedProject = {
      ...project,
      likes_count: Number.parseInt(project.likes_count) || 0,
      is_liked: isLiked,
      owner: {
        username: project.username,
        display_name: project.display_name,
        avatar_url: project.avatar_url
      }
    }

    // Limpiar campos redundantes
    delete formattedProject.username
    delete formattedProject.display_name
    delete formattedProject.avatar_url

    return NextResponse.json({
      project: formattedProject,
    })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Actualizar un proyecto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, data, is_public, is_collaborative, tags, thumbnail_url } = body

    // Verificar permisos
    const [access] = await sql`
      SELECT role FROM projects p
      LEFT JOIN collaborators c ON p.id = c.project_id
      WHERE p.id = ${id} 
      AND (p.owner_id = ${decoded.userId} OR (c.user_id = ${decoded.userId} AND c.role IN ('owner', 'editor')))
    `

    if (!access) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Actualizar proyecto
    const [updatedProject] = await sql`
      UPDATE projects 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        data = COALESCE(${data ? JSON.stringify(data) : null}, data),
        is_public = COALESCE(${is_public}, is_public),
        is_collaborative = COALESCE(${is_collaborative}, is_collaborative),
        tags = COALESCE(${tags || null}, tags),
        thumbnail_url = COALESCE(${thumbnail_url}, thumbnail_url),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Eliminar un proyecto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Solo el owner puede eliminar
    const [project] = await sql`
      SELECT owner_id FROM projects WHERE id = ${id}
    `

    if (!project || project.owner_id !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await sql`DELETE FROM projects WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

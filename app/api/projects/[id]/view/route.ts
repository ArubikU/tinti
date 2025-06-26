import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Registrar vista de proyecto
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = request.cookies.get("auth-token")?.value
    
    // Obtener IP del usuario
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get("x-real-ip") || "unknown"

    // Verificar que el proyecto existe y es público
    const [project] = await sql`
      SELECT id, is_public FROM projects WHERE id = ${id}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Para proyectos privados, verificar permisos
    if (!project.is_public) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

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

    let userId = null
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    try {
      // Intentar insertar vista (fallará si ya existe debido a la constraint UNIQUE)
      if (userId) {
        // Usuario autenticado: una vista por usuario por proyecto
        await sql`
          INSERT INTO project_views (project_id, user_id, ip_address)
          VALUES (${id}, ${userId}, ${ip})
          ON CONFLICT (project_id, user_id) DO NOTHING
        `
      } else {
        // Usuario no autenticado: una vista por IP por proyecto
        await sql`
          INSERT INTO project_views (project_id, ip_address)
          VALUES (${id}, ${ip})
          ON CONFLICT (project_id, ip_address) DO NOTHING
        `
      }
    } catch (error) {
      // Si hay error en la inserción, continuar (probablemente vista duplicada)
      console.log("View already registered or error:", error)
    }

    // Obtener contador actualizado
    const [{ views_count }] = await sql`
      SELECT views_count FROM projects WHERE id = ${id}
    `

    return NextResponse.json({ 
      success: true, 
      views_count: Number.parseInt(views_count) || 0 
    })
  } catch (error) {
    console.error("Register view error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

// Generar thumbnail automático del proyecto
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar permisos
    const [access] = await sql`
      SELECT 1 FROM projects p
      LEFT JOIN collaborators c ON p.id = c.project_id
      WHERE p.id = ${id} 
      AND (p.owner_id = ${decoded.userId} OR (c.user_id = ${decoded.userId} AND c.role IN ('owner', 'editor')))
    `

    if (!access) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Generar thumbnail usando la API de export con escala pequeña
    const exportUrl = `${request.nextUrl.origin}/api/projects/${id}/export?scale=4&format=png&background=true`

    // En un caso real, aquí subirías la imagen a un servicio como Vercel Blob o S3
    // Por ahora, guardamos la URL de export como thumbnail
    const thumbnailUrl = exportUrl

    await sql`
      UPDATE projects 
      SET thumbnail_url = ${thumbnailUrl}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ thumbnailUrl })
  } catch (error) {
    console.error("Generate thumbnail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

// Obtener estadísticas globales de la plataforma
export async function GET() {
  try {
    // Obtener todas las estadísticas en paralelo
    const [
      usersResult,
      projectsResult, 
      publicProjectsResult,
      likesResult,
      commentsResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM projects`,
      sql`SELECT COUNT(*) as count FROM projects WHERE is_public = TRUE`,
      sql`SELECT COUNT(*) as count FROM project_likes`,
      sql`SELECT COUNT(*) as count FROM project_comments`
    ])

    const stats = {
      users: Number.parseInt(usersResult[0].count) || 0,
      projects: Number.parseInt(projectsResult[0].count) || 0,
      publicProjects: Number.parseInt(publicProjectsResult[0].count) || 0,
      likes: Number.parseInt(likesResult[0].count) || 0,
      comments: Number.parseInt(commentsResult[0].count) || 0
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener proyectos públicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const sort = searchParams.get("sort") || "recent" // recent, popular, trending
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")

    const offset = (page - 1) * limit

    let orderBy = "p.updated_at DESC"
    if (sort === "popular") {
      orderBy = "likes_count DESC, p.updated_at DESC"
    } else if (sort === "trending") {
      orderBy = "recent_likes DESC, likes_count DESC, p.updated_at DESC"
    } else if (sort === "views") {
      orderBy = "p.views_count DESC, p.updated_at DESC"
    }

    let whereClause = "p.is_public = TRUE"
    const params: any[] = []

    if (tag) {
      whereClause += ` AND ${tag} = ANY(p.tags)`
    }

    if (search) {
      whereClause += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    const projects = await sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url,
             COUNT(pl.user_id) as likes_count,
             COUNT(CASE WHEN pl.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_likes
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_likes pl ON p.id = pl.project_id
      WHERE ${sql.unsafe(whereClause)}
      GROUP BY p.id, u.username, u.display_name, u.avatar_url
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${limit} OFFSET ${offset}
    `

    // Obtener total para paginación
    const [{ count }] = await sql`
      SELECT COUNT(*) as count
      FROM projects p
      WHERE ${sql.unsafe(whereClause)}
    `

    return NextResponse.json({
      projects: projects.map((p) => ({
        ...p,
        likes_count: Number.parseInt(p.likes_count) || 0,
        recent_likes: Number.parseInt(p.recent_likes) || 0,
      })),
      pagination: {
        page,
        limit,
        total: Number.parseInt(count),
        pages: Math.ceil(Number.parseInt(count) / limit),
      },
    })
  } catch (error) {
    console.error("Get public projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

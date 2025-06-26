import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Obtener colaboradores de un folder
export async function GET(
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

    // Verificar acceso al folder
    const [access] = await sql`
      SELECT f.*, fc.role as collaborator_role
      FROM folders f
      LEFT JOIN folder_collaborators fc ON f.id = fc.folder_id AND fc.user_id = ${decoded.userId}
      WHERE f.id = ${params.id} 
        AND (f.owner_id = ${decoded.userId} OR fc.user_id = ${decoded.userId})
    `

    if (!access) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    const collaborators = await sql`
      SELECT fc.*, u.username, u.display_name, u.avatar_url
      FROM folder_collaborators fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.folder_id = ${params.id}
      ORDER BY fc.invited_at ASC
    `

    return NextResponse.json({ collaborators })
  } catch (error) {
    console.error("Get folder collaborators error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Agregar colaborador a un folder
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

    const { email, role = "editor" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Verificar que es propietario del folder
    const [folder] = await sql`
      SELECT * FROM folders WHERE id = ${params.id} AND owner_id = ${decoded.userId}
    `

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or not owner" }, { status: 404 })
    }

    // Buscar usuario por email
    const [user] = await sql`
      SELECT id, username, email FROM users WHERE email = ${email}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verificar que no sea el propietario
    if (user.id === decoded.userId) {
      return NextResponse.json({ error: "Cannot add yourself as collaborator" }, { status: 400 })
    }

    // Agregar colaborador
    const [collaborator] = await sql`
      INSERT INTO folder_collaborators (folder_id, user_id, role, is_external)
      VALUES (${params.id}, ${user.id}, ${role}, true)
      ON CONFLICT (folder_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        invited_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({ 
      collaborator: {
        ...collaborator,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Add folder collaborator error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

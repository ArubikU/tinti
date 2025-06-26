import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

// Actualizar nombres de carpetas hijas cuando se renombra una carpeta padre
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { oldParentName, newParentName } = await request.json()

    if (!oldParentName || !newParentName) {
      return NextResponse.json({ error: "Old and new parent names required" }, { status: 400 })
    }

    // Actualizar todas las carpetas que empiecen con el nombre anterior + '/'
    const oldPrefix = oldParentName + '/'
    const result = await sql`
      UPDATE folders 
      SET name = ${newParentName} || SUBSTRING(name, ${oldParentName.length + 1})
      WHERE owner_id = ${decoded.userId} 
        AND name LIKE ${oldPrefix + '%'}
        AND name != ${oldParentName}
    `

    console.log('Updated child folders, result:', result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update child folder names error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

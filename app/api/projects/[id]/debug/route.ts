import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Obtener proyecto
    const [project] = await sql`
      SELECT id, title, canvas_width, canvas_height, data FROM projects WHERE id = ${id}
    `

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Información básica sobre el proyecto
    const info = {
      id: project.id,
      title: project.title,
      canvas_width: project.canvas_width,
      canvas_height: project.canvas_height,
      data_type: typeof project.data,
      data_is_null: project.data === null,
      data_length: project.data ? String(project.data).length : 0,
      data_preview: project.data ? String(project.data).substring(0, 200) + "..." : null
    }

    // Intentar parsear los datos
    let parseInfo = null
    if (project.data) {
      try {
        let parsedData
        if (typeof project.data === 'object') {
          parsedData = project.data
          parseInfo = { success: true, method: "already_object" }
        } else {
          parsedData = JSON.parse(project.data)
          parseInfo = { success: true, method: "json_parse" }
        }
        
        parseInfo.layers_count = parsedData.layers ? parsedData.layers.length : 0
        parseInfo.has_layers = !!parsedData.layers
        parseInfo.layers_sample = parsedData.layers ? parsedData.layers.slice(0, 2) : null
      } catch (error) {
        parseInfo = { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }
      }
    }

    return NextResponse.json({
      project_info: info,
      parse_info: parseInfo
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

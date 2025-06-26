import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"
import { deflate } from "pako"
import sharp from "sharp"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "png"
    const scale = Number.parseInt(searchParams.get("scale") || "1")
    const includeBackground = searchParams.get("background") === "true"

    console.log(`Iniciando exportación: ID=${id}, formato=${format}, escala=${scale}`)

    // Obtener proyecto
    const [project] = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `

    if (!project) {
      console.error(`Proyecto no encontrado: ${id}`)
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    console.log(`Proyecto encontrado: ${project.title}, público: ${project.is_public}`)

    // Verificar permisos si es privado
    if (!project.is_public) {
      const token = request.cookies.get("auth-token")?.value
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

    if (!project.data) {
      console.error(`Proyecto sin datos: ${id}`)
      return NextResponse.json({ error: "No data to export" }, { status: 400 })
    }

    console.log(`Procesando datos del proyecto...`)
    console.log(`Tipo de project.data:`, typeof project.data)
    console.log(`Primeros 100 caracteres de project.data:`, String(project.data).substring(0, 100))
    
    let projectData
    try {
      // Si project.data ya es un objeto, usarlo directamente
      if (typeof project.data === 'object' && project.data !== null) {
        projectData = project.data
      } else {
        // Si es string, intentar parsearlo
        projectData = JSON.parse(project.data)
      }
    } catch (parseError) {
      console.error(`Error al parsear datos del proyecto:`, parseError)
      console.error(`Datos problemáticos:`, project.data)
      return NextResponse.json({ 
        error: "Invalid project data format", 
        details: "Los datos del proyecto no tienen un formato JSON válido"
      }, { status: 400 })
    }
    
    const { layers } = projectData
    const width = project.canvas_width
    const height = project.canvas_height

    console.log(`Canvas: ${width}x${height}, capas: ${layers?.length || 0}`)
    
    if (!layers || !Array.isArray(layers)) {
      console.error(`Capas inválidas:`, layers)
      return NextResponse.json({ 
        error: "Invalid layers data", 
        details: "Los datos de las capas no son válidos"
      }, { status: 400 })
    }
    
    if (!width || !height || width <= 0 || height <= 0) {
      console.error(`Dimensiones inválidas: ${width}x${height}`)
      return NextResponse.json({ 
        error: "Invalid canvas dimensions", 
        details: "Las dimensiones del canvas no son válidas"
      }, { status: 400 })
    }

    // Crear canvas para renderizar
    const canvas = Buffer.alloc(width * height * 4) // RGBA

    // Renderizar capas
    let pixelsRendered = 0
    layers.forEach((layer: any, layerIndex: number) => {
      if (!layer || typeof layer !== 'object') {
        console.warn(`Capa ${layerIndex} inválida:`, layer)
        return
      }
      
      if (!layer.visible) return

      if (!layer.pixels || typeof layer.pixels !== 'object') {
        console.warn(`Píxeles de capa ${layerIndex} inválidos:`, layer.pixels)
        return
      }

      Object.entries(layer.pixels).forEach(([key, color]: [string, any]) => {
        try {
          const [x, y] = key.split(",").map(Number)
          if (isNaN(x) || isNaN(y) || x < 0 || x >= width || y < 0 || y >= height) {
            return // Saltar píxeles fuera de rango
          }
          
          const index = (y * width + x) * 4

          // Validar color
          if (!color || typeof color !== 'string') {
            return // Saltar colores inválidos
          }

          // Convertir color hex a RGB
          const hex = color.replace("#", "")
          if (hex.length !== 6 && hex.length !== 8) {
            return // Saltar colores con formato incorrecto
          }
          
          const r = Number.parseInt(hex.substring(0, 2), 16)
          const g = Number.parseInt(hex.substring(2, 4), 16)
          const b = Number.parseInt(hex.substring(4, 6), 16)
          
          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return // Saltar colores que no se pudieron parsear
          }

            canvas[index] = r // R
            canvas[index + 1] = g // G
            canvas[index + 2] = b // B
            canvas[index + 3] = hex.length === 8 
            ? Number.parseInt(hex.substring(6, 8), 16) // A (Alpha)
            : 255 // Default Alpha
          pixelsRendered++
        } catch (pixelError) {
          console.warn(`Error procesando pixel ${key}:`, pixelError)
        }
      })
    })

    console.log(`Píxeles renderizados: ${pixelsRendered}`)

    // Si no hay píxeles, crear una imagen transparente
    if (pixelsRendered === 0) {
      console.warn("No se renderizaron píxeles, creando imagen transparente")
      // Llenar con transparente (todos los valores ya son 0)
    }

    // Procesar con Sharp
    let image = sharp(canvas, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })

    // Escalar si es necesario
    if (scale > 1) {
      image = image.resize(width * scale, height * scale, {
        kernel: "nearest", // Mantener píxeles nítidos
      })
    }

    // Agregar fondo si se solicita
    if (includeBackground) {
      image = image.flatten({ background: "#ffffff" })
    }

    // Convertir al formato solicitado
    let buffer: Buffer
    let contentType: string

    switch (format.toLowerCase()) {
      case "tint":
        // Exportar archivo .tint (formato nativo del proyecto)
        const tintData = {
          version: "1.0",
          metadata: {
            title: project.title,
            author: "Usuario",
            date: new Date().toISOString(),
            description: project.description || project.title
          },
          data: {
            canvas_width: project.canvas_width,
            canvas_height: project.canvas_height,
            layers: projectData.layers.map((layer: any) => ({
              name: layer.name || "Capa",
              visible: layer.visible !== false,
              opacity: layer.opacity || 1,
              pixels: layer.pixels || {}
            })),
            color_palette: projectData.palette || []
          }
        }
        // Comprimir con pako para mantener compatibilidad
        const jsonString = JSON.stringify(tintData)
        const compressed = deflate(jsonString)
        buffer = Buffer.from(compressed)
        contentType = "application/octet-stream"
        break
      case "jpg":
      case "jpeg":
        buffer = await image.jpeg({ quality: 100 }).toBuffer()
        contentType = "image/jpeg"
        break
      case "webp":
        buffer = await image.webp({ quality: 100 }).toBuffer()
        contentType = "image/webp"
        break
      case "gif":
        // Para GIF necesitaríamos una librería especializada
        buffer = await image.png().toBuffer()
        contentType = "image/png"
        break
      default:
        buffer = await image.png().toBuffer()
        contentType = "image/png"
    }

    const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`

    console.log(`Exportación completada: ${filename}, tamaño: ${buffer.length} bytes`)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ 
      error: "Export failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

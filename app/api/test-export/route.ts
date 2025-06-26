import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET() {
  try {
    console.log("Iniciando test de exportación...")
    
    // Crear una imagen simple de 32x32 píxeles
    const width = 32
    const height = 32
    const canvas = Buffer.alloc(width * height * 4) // RGBA
    
    // Llenar con un patrón simple (alternando rojo y azul)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        if ((x + y) % 2 === 0) {
          // Rojo
          canvas[index] = 255     // R
          canvas[index + 1] = 0   // G
          canvas[index + 2] = 0   // B
          canvas[index + 3] = 255 // A
        } else {
          // Azul
          canvas[index] = 0       // R
          canvas[index + 1] = 0   // G
          canvas[index + 2] = 255 // B
          canvas[index + 3] = 255 // A
        }
      }
    }
    
    console.log("Canvas creado, procesando con Sharp...")
    
    // Procesar con Sharp
    const image = sharp(canvas, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
    
    const buffer = await image.png().toBuffer()
    console.log(`Imagen generada: ${buffer.length} bytes`)
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="test.png"',
      },
    })
  } catch (error) {
    console.error("Error en test de exportación:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

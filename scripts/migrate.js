#!/usr/bin/env node

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { sql } from "../lib/database.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  try {
    console.log("🚀 Ejecutando migraciones de base de datos...")
    
    // Leer archivos de migración
    const scriptsDir = path.join(__dirname, "../scripts")
    const files = await fs.readdir(scriptsDir)
    const sqlFiles = files.filter(file => file.endsWith(".sql")).sort()
    
    for (const file of sqlFiles) {
      console.log(`📄 Ejecutando: ${file}`)
      const sqlContent = await fs.readFile(path.join(scriptsDir, file), "utf-8")
      
      try {
        await sql.unsafe(sqlContent)
        console.log(`✅ ${file} ejecutado correctamente`)
      } catch (error) {
        console.log(`⚠️  ${file} falló (posiblemente ya ejecutado):`, error.message)
      }
    }
    
    console.log("🎉 Migraciones completadas")
    
    // Verificar estructura de tablas
    console.log("\n📊 Verificando estructura de base de datos...")
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log("Tablas encontradas:")
    tables.forEach(table => console.log(`  - ${table.table_name}`))
    
    // Verificar conteo de datos
    const counts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM projects`,
      sql`SELECT COUNT(*) as count FROM project_likes`,
      sql`SELECT COUNT(*) as count FROM project_comments`,
      sql`SELECT COUNT(*) as count FROM project_views`,
      sql`SELECT COUNT(*) as count FROM folders`
    ])
    
    console.log("\nEstadísticas de datos:")
    console.log(`  - Usuarios: ${counts[0][0].count}`)
    console.log(`  - Proyectos: ${counts[1][0].count}`)
    console.log(`  - Likes: ${counts[2][0].count}`)
    console.log(`  - Comentarios: ${counts[3][0].count}`)
    console.log(`  - Vistas: ${counts[4][0].count}`)
    console.log(`  - Carpetas: ${counts[5][0].count}`)
    
  } catch (error) {
    console.error("❌ Error en migraciones:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

runMigrations()

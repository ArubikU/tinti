const WebSocket = require("ws")
const http = require("http")
const url = require("url")

// Crear servidor HTTP
const server = http.createServer()

// Crear servidor WebSocket
// Aceptamos cualquier pathname y filtramos manualmente dentro del "connection"
const wss = new WebSocket.Server({ server })

// Almacenar conexiones por proyecto
const projectConnections = new Map()

wss.on("connection", (ws, request) => {
  // Solo aceptamos peticiones cuya ruta empiece por "/ws"
  if (!request.url.startsWith("/ws")) {
    ws.close(1008, "Invalid path")
    return
  }

  const query = url.parse(request.url, true).query
  const projectId = request.url.split("/")[2] // /ws/PROJECT_ID
  const userId = query.userId
  const username = query.username

  if (!projectId || !userId || !username) {
    ws.close(1008, "Missing required parameters")
    return
  }

  // Agregar conexión al proyecto
  if (!projectConnections.has(projectId)) {
    projectConnections.set(projectId, new Map())
  }

  const projectUsers = projectConnections.get(projectId)
  projectUsers.set(userId, { ws, username })

  console.log(`User ${username} joined project ${projectId}`)

  // Notificar a otros usuarios que alguien se unió
  broadcastToProject(
    projectId,
    {
      type: "user_joined",
      data: { userId, username },
    },
    userId,
  )

  // Enviar lista de usuarios conectados al nuevo usuario
  const connectedUsers = Array.from(projectUsers.entries())
    .filter(([id]) => id !== userId)
    .map(([id, data]) => ({ userId: id, username: data.username }))

  ws.send(
    JSON.stringify({
      type: "users_list",
      data: { users: connectedUsers },
    }),
  )

  // Manejar mensajes
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)

      // Reenviar mensaje a otros usuarios del proyecto
      broadcastToProject(projectId, data, userId)
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  // Manejar desconexión
  ws.on("close", () => {
    console.log(`User ${username} left project ${projectId}`)

    if (projectUsers) {
      projectUsers.delete(userId)

      // Si no quedan usuarios, eliminar el proyecto
      if (projectUsers.size === 0) {
        projectConnections.delete(projectId)
      } else {
        // Notificar a otros usuarios que alguien se fue
        broadcastToProject(projectId, {
          type: "user_left",
          data: { userId, username },
        })
      }
    }
  })

  // Manejar errores
  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
  })
})

function broadcastToProject(projectId, message, excludeUserId = null) {
  const projectUsers = projectConnections.get(projectId)
  if (!projectUsers) return

  const messageStr = JSON.stringify(message)

  projectUsers.forEach((userData, userId) => {
    if (userId !== excludeUserId && userData.ws.readyState === WebSocket.OPEN) {
      userData.ws.send(messageStr)
    }
  })
}

// Iniciar servidor
const PORT = process.env.WS_PORT || 3001
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})

// Manejar cierre graceful
process.on("SIGTERM", () => {
  console.log("Closing WebSocket server...")
  wss.close(() => {
    server.close(() => {
      process.exit(0)
    })
  })
})

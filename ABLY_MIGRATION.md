# Migración a Ably WebSocket

## Cambios realizados

### 1. Instalación de Ably
```bash
npm install ably
```

### 2. Actualización del cliente WebSocket (`lib/websocket.ts`)

**Antes:** Usaba WebSocket nativo local en `ws://localhost:3001`
**Después:** Usa Ably Realtime con canales por proyecto

#### Principales cambios:
- Reemplazado `WebSocket` nativo por `Ably.Realtime`
- Cada proyecto tiene su propio canal: `project:${projectId}`
- Manejo automático de reconexión por parte de Ably
- Eventos simplificados usando `publish`/`subscribe`

### 3. Nuevo servidor Ably (`server/ably-websocket.js`)
- Servidor opcional que usa Ably en el backend
- Mantiene compatibilidad con la lógica existente
- Almacena usuarios conectados por proyecto
- Puede agregar lógica adicional como persistencia en base de datos

### 4. Configuración necesaria

#### Variables de entorno requeridas:
```env
NEXT_PUBLIC_ABLY_API_KEY=tu-api-key-publica-de-ably
```

#### Obtener API Keys de Ably:
1. Regístrate en https://ably.com
2. Crea una nueva aplicación
3. Copia las API keys desde el dashboard
4. La key pública va en `NEXT_PUBLIC_ABLY_API_KEY`

### 5. Scripts actualizados

```json
{
  "start": "next start",
  "start:with-ably": "next start & node server/ably-websocket.js",
  "ably": "node server/ably-websocket.js"
}
```

## Ventajas de Ably

1. **Escalabilidad**: Manejo automático de millones de conexiones
2. **Confiabilidad**: Redundancia global y recuperación automática
3. **Simplicidad**: No necesitas manejar servidores WebSocket
4. **Características avanzadas**: Presencia, historia de mensajes, autenticación
5. **Global**: CDN mundial para baja latencia

## Uso

### Cliente (React)
```typescript
const { sendMessage, onMessage, isConnected } = useWebSocket(projectId, userId, username)

// Enviar mensaje
sendMessage({
  type: "pixel_update",
  data: { x: 10, y: 20, color: "#ff0000", layer: 0 }
})

// Escuchar mensajes
onMessage((message) => {
  console.log('Received:', message)
})
```

### Tipos de mensajes soportados:
- `pixel_update`: Actualización de píxeles
- `user_joined`: Usuario se conectó
- `user_left`: Usuario se desconectó  
- `cursor_move`: Movimiento de cursor
- `users_list`: Lista de usuarios conectados

## Migración gradual

El servidor WebSocket original (`server/websocket.js`) se mantiene para compatibilidad.
Puedes cambiar gradualmente o usar ambos sistemas en paralelo durante la transición.

## Consideraciones de costos

Ably tiene un tier gratuito generoso:
- 3M mensajes/mes gratis
- 100 conexiones concurrentes
- Después: $0.50 por millón de mensajes adicionales

Para proyectos pequeños/medianos, el costo será mínimo o cero.

## Testing la migración

### 1. Configurar variables de entorno
Copia `.env.local.example` a `.env.local` y configura tus API keys de Ably:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus keys reales de Ably.

### 2. Probar la conexión
```bash
npm run dev
```

### 3. Verificar en el navegador
- Abre el editor de píxeles
- Verifica en la consola del navegador: "Ably connected"
- Abre otra pestaña/navegador para probar colaboración en tiempo real

### 4. Rollback si es necesario
Si hay problemas, puedes volver al WebSocket local:

```typescript
// En lib/websocket.ts, importar el backup
import { useWebSocketLocal } from './websocket-local'
export { useWebSocketLocal as useWebSocket }
```

## Compatibilidad

✅ **Totalmente compatible** - El componente `PixelEditor.tsx` funciona sin cambios
✅ **Misma interfaz** - `sendMessage` y `onMessage` mantienen la misma API
✅ **Tipos idénticos** - `WebSocketMessage` y `PixelUpdate` sin cambios
✅ **Fallback disponible** - Servidor local se mantiene como backup

## Next Steps

1. ✅ Migración básica completada
2. ⏳ Configurar API keys de Ably
3. ⏳ Testing en desarrollo
4. ⏳ Testing de colaboración multi-usuario
5. ⏳ Deploy a producción
6. ⏳ Monitoreo de métricas en Ably dashboard

## Troubleshooting

### Error: "No se encuentra el módulo ably"
```bash
npm install ably
```

### Error: "Invalid API key"
- Verifica que las API keys en `.env.local` sean correctas
- Asegúrate que la key pública empiece con el proyecto correcto

### Conexión falla
- Verifica conectividad a internet
- Revisa el dashboard de Ably para ver estado de la conexión
- Chequea límites de uso en tu plan de Ably

### Performance issues
- Monitorea el número de mensajes en Ably dashboard
- Considera implementar throttling para eventos frecuentes como `cursor_move`
- Revisa si necesitas upgrade de plan en Ably

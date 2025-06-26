# Sincronización de Frames en Tiempo Real

Este documento describe la implementación del sistema de sincronización de frames para el editor colaborativo de pixel art.

## Características Implementadas

### 1. Tipos de Operaciones de Frames
- **Crear Frame**: Sincroniza cuando se agrega un nuevo frame
- **Eliminar Frame**: Sincroniza cuando se elimina un frame
- **Actualizar Frame**: Sincroniza cambios en nombre y duración
- **Reordenar Frame**: Sincroniza cuando se mueve un frame de posición
- **Duplicar Frame**: Sincroniza la duplicación de frames
- **Cambiar Frame**: Sincroniza cuando se selecciona un frame diferente

### 2. Sincronización de Estado de Animación
- **Estado de Reproducción**: Sincroniza play/pause entre usuarios
- **Frame Actual**: Mantiene todos los usuarios en el mismo frame
- **FPS de Animación**: Sincroniza cambios en la velocidad de reproducción

### 3. Sincronización Completa
- **Sync Inicial**: Cuando un usuario se une, recibe todos los frames
- **Eventos en Tiempo Real**: Todos los cambios se propagan inmediatamente

## Arquitectura

### WebSocket (websocket-ably.ts)
```typescript
// Nuevos tipos de mensajes
type: "frame_created" | "frame_deleted" | "frame_updated" | 
      "frame_reordered" | "frame_duplicated" | "frame_changed" | 
      "frames_sync" | "animation_state_changed"

// Interfaces para datos
interface FrameUpdate
interface FrameOperation  
interface AnimationState
```

### Hook de Sincronización (useFrameSync.ts)
- Maneja todos los eventos de frames entrantes y salientes
- Integra con LayerManager para aplicar cambios
- Evita loops infinitos ignorando eventos propios

### Hook de Animación Mejorado (useAnimation.ts)
- Parámetros opcionales para colaboración
- Sincroniza automáticamente cuando está en modo colaborativo
- Mantiene compatibilidad con modo individual

## Uso

### Modo Individual
```typescript
const animation = useAnimation(layerManager, updateMoment)
```

### Modo Colaborativo
```typescript
const animation = useAnimation(
  layerManager, 
  updateMoment,
  projectId,    // ID del proyecto
  userId,       // ID del usuario
  username      // Nombre del usuario
)
```

## Flujo de Sincronización

1. **Usuario A** realiza una acción (ej: agregar frame)
2. **useAnimation** ejecuta la acción localmente
3. **useFrameSync** envía el evento via WebSocket
4. **Usuario B** recibe el evento
5. **useFrameSync** aplica el cambio en LayerManager de Usuario B
6. **updateMoment** refresca la UI

## Prevención de Conflictos

- Los eventos incluyen `userId` para evitar aplicar cambios propios
- Los frames tienen IDs únicos para sincronización precisa
- El estado de reproducción se maneja cuidadosamente para evitar conflictos

## Integración Automática

El sistema se integra automáticamente cuando:
- El proyecto tiene `is_collaborative: true`
- Se proporcionan los parámetros de usuario
- El WebSocket está conectado

No se requieren cambios en componentes existentes que usen `useAnimation`.

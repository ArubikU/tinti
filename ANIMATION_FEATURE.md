# Sistema de Animación para Tinti.art

## Funcionalidades Implementadas

### 1. Soporte para Frames de Animación

El sistema ahora soporta múltiples frames para crear animaciones de pixel art:

- **Frames múltiples**: Cada proyecto puede tener múltiples frames
- **Duración personalizable**: Cada frame puede tener su propia duración en milisegundos
- **FPS configurable**: Control del FPS de la animación (1-30 fps)
- **Navegación entre frames**: Botones para navegar entre frames o reproducir la animación

### 2. Panel de Frames

Un nuevo panel lateral que incluye:

- **Vista de frames**: Lista visual de todos los frames con thumbnails
- **Controles de reproducción**: Play/pause, step forward/backward
- **Control de FPS**: Slider para ajustar la velocidad de animación
- **Gestión de frames**: Agregar, duplicar, eliminar, reordenar frames
- **Duración por frame**: Control individual de duración para cada frame
- **Renombrar frames**: Capacidad de dar nombres descriptivos a los frames

### 3. Funcionalidades de Animación

#### Reproducción
- Reproducción automática de la animación
- Control manual frame por frame
- Vista previa en tiempo real

#### Gestión de Frames
- **Agregar frame**: Crea un nuevo frame copiando las capas actuales
- **Duplicar frame**: Duplica un frame existente con todas sus capas
- **Eliminar frame**: Elimina un frame (mínimo 1 frame requerido)
- **Reordenar**: Drag & drop para reordenar frames
- **Renombrar**: Click para editar el nombre del frame

#### Configuración
- **Duración por frame**: 50ms - 1000ms por frame
- **FPS global**: 1-30 fps para toda la animación
- **Sincronización**: Los cambios se guardan automáticamente

### 4. Exportación de Animaciones

Modal de exportación con opciones avanzadas:

#### Formatos de Exportación
- **Secuencia de imágenes PNG**: Exporta todos los frames como archivos PNG individuales
- **Frame individual**: Exporta un frame específico como imagen

#### Configuración de Exportación
- **Escala**: 1x - 16x para aumentar el tamaño de la imagen final
- **Selección de frame**: Para exportación individual
- **Vista previa**: Preview de la animación antes de exportar

#### Características del Exportador
- **Validación**: Verifica que los frames sean válidos antes de exportar
- **Información de animación**: Muestra estadísticas de la animación
- **Control de calidad**: Preserva la calidad pixel-perfect

### 5. Integración con el Sistema Existente

#### Compatibilidad
- **Proyectos existentes**: Los proyectos antiguos se convierten automáticamente con 1 frame
- **Capas**: Cada frame mantiene su propio conjunto de capas
- **Guardado**: Los frames se guardan junto con el proyecto

#### Base de Datos
- **Nueva estructura**: Campos agregados a la tabla projects para soportar frames
- **Migración automática**: Los proyectos existentes se actualizan automáticamente

#### Interfaz
- **Móvil y escritorio**: Panel de frames disponible en ambas versiones
- **Controles intuitivos**: Interfaz familiar y fácil de usar
- **Performance optimizada**: Renderizado eficiente de múltiples frames

### 6. Casos de Uso

#### Animaciones Simples
- Sprites animados para juegos
- Iconos con movimiento
- Logos animados
- Efectos visuales simples

#### Animaciones Complejas
- Personajes caminando
- Efectos de partículas
- Transiciones suaves
- Ciclos de animación

### 7. Controles de Interfaz

#### Escritorio
- Panel lateral permanente con todos los controles
- Vista previa en tiempo real
- Controles de teclado (pendiente de implementar)

#### Móvil
- Panel deslizable accesible desde el botón de película
- Controles optimizados para touch
- Vista previa integrada

### 8. Limitaciones Actuales

- **Exportación GIF**: No implementada (solo PNG sequences por ahora)
- **Onion skinning entre frames**: Pendiente de implementar
- **Interpolación**: No hay interpolación automática entre frames
- **Límite de frames**: Sin límite técnico, pero performance puede verse afectada con muchos frames

### 9. Mejoras Futuras Sugeridas

1. **Exportación GIF**: Implementar exportación directa a GIF animado
2. **Onion skinning**: Mostrar frames anteriores/siguientes como guía
3. **Timeline**: Vista de timeline más avanzada
4. **Interpolación**: Generación automática de frames intermedios
5. **Optimización**: Mejor performance para animaciones largas
6. **Audio**: Sincronización con audio (feature avanzada)

## Archivos Modificados/Creados

### Nuevos Archivos
- `lib/animation-export.ts` - Funciones de exportación
- `components/AnimationExportModal.tsx` - Modal de exportación
- `components/editor/FramesPanel.tsx` - Panel de frames

### Archivos Modificados
- `lib/database.ts` - Interfaces actualizadas
- `lib/pixel-engine.ts` - LayerManager con soporte para frames
- `components/PixelEditor.tsx` - Integración del sistema de frames
- `app/page.tsx` - Inicialización de frames en nuevos proyectos

## Uso

1. **Crear animación**: Abre cualquier proyecto en el editor
2. **Acceder a frames**: Click en el icono de película (Film) en la barra de herramientas
3. **Agregar frames**: Click en "Agregar" en el panel de frames
4. **Configurar duración**: Ajusta la duración de cada frame con el slider
5. **Reproducir**: Click en el botón de play para ver la animación
6. **Exportar**: Click en "Exportar" para descargar la animación

El sistema está completamente integrado y listo para usar!

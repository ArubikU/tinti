# Herramienta de Reemplazo de Color

La herramienta de reemplazo de color permite modificar colores en toda la imagen de manera inteligente, ofreciendo tres modos principales:

## Características

### 1. Modo Específico (`specific`)
Reemplaza un color específico por otro con tolerancia configurable.

**Configuraciones:**
- `targetColor`: Color que se quiere reemplazar
- `newColor`: Color de reemplazo
- `tolerance`: Tolerancia para coincidencias (0-100%)

**Uso:**
```typescript
const settings: ColorReplaceSettings = {
  mode: 'specific',
  targetColor: '#FF0000', // Rojo
  newColor: '#00FF00',    // Verde
  tolerance: 10           // 10% de tolerancia
}
```

### 2. Modo Desplazamiento de Matiz (`hue-shift`)
Ajusta el matiz (hue), saturación y luminosidad de todos los colores.

**Configuraciones:**
- `hueShift`: Desplazamiento de matiz (-180 a 180 grados)
- `saturationAdjust`: Ajuste de saturación (-1 a 1)
- `lightnessAdjust`: Ajuste de luminosidad (-1 a 1)

**Uso:**
```typescript
const settings: ColorReplaceSettings = {
  mode: 'hue-shift',
  hueShift: 90,           // Rotar 90 grados
  saturationAdjust: 0.2,  // Aumentar saturación 20%
  lightnessAdjust: -0.1   // Reducir luminosidad 10%
}
```

### 3. Modo Paleta (`palette-replace`)
Reemplaza múltiples colores usando un mapa de correspondencias.

**Configuraciones:**
- `paletteMap`: Objeto con mapeo de colores viejos a nuevos

**Uso:**
```typescript
const settings: ColorReplaceSettings = {
  mode: 'palette-replace',
  paletteMap: {
    '#FF0000': '#00FF00', // Rojo -> Verde
    '#0000FF': '#FFFF00', // Azul -> Amarillo
    '#000000': '#FFFFFF'  // Negro -> Blanco
  }
}
```

## Integración en el Editor

### En el Panel de Herramientas
La herramienta aparece en la categoría "Avanzadas" con el icono de paleta.

### En el SubPanel
Cuando se selecciona la herramienta, aparecen las configuraciones específicas:

1. **Selector de modo**: Tres botones para cambiar entre modos
2. **Configuraciones específicas**: Cambian según el modo seleccionado
3. **Botón "Aplicar Reemplazo"**: Ejecuta la transformación

### Uso Programático

```typescript
// Crear la herramienta
const colorReplaceTool = new ColorReplaceTool('#000000', settings)

// Configurar función de reemplazo
colorReplaceTool.setReplaceFunction((oldColor, newColor) => {
  layerManager.replaceColorInLayersAndFrames(oldColor, newColor)
})

// Obtener colores únicos del canvas
const uniqueColors = layerManager.layers
  .flatMap(layer => Object.values(layer.pixels))
  .filter((color, index, self) => color && self.indexOf(color) === index)

// Ejecutar reemplazo
colorReplaceTool.executeReplace(uniqueColors)
```

## Características Técnicas

### Conversión de Colores
- Soporte para colores hex (#RRGGBB, #RRGGBBAA)
- Soporte para colores RGB y RGBA
- Conversión HSL para ajustes de matiz

### Tolerancia
- Usa distancia euclidiana en espacio RGB
- Configurable de 0% (exacto) a 100% (muy flexible)

### Optimización
- Solo procesa colores únicos presentes en la imagen
- Aplica cambios tanto a capas como a frames de animación
- Preserva canales alfa en colores RGBA

## Ejemplo Completo

```typescript
import { ColorReplaceTool, type ColorReplaceSettings } from '@/lib/drawing-tools'

// Ejemplo 1: Reemplazar rojo por azul con tolerancia
const specificSettings: ColorReplaceSettings = {
  mode: 'specific',
  targetColor: '#FF0000',
  newColor: '#0000FF',
  tolerance: 15
}

// Ejemplo 2: Crear efecto vintage (desaturar y calentar)
const vintageSettings: ColorReplaceSettings = {
  mode: 'hue-shift',
  hueShift: 15,
  saturationAdjust: -0.3,
  lightnessAdjust: -0.1
}

// Ejemplo 3: Cambiar paleta completa
const paletteSettings: ColorReplaceSettings = {
  mode: 'palette-replace',
  paletteMap: {
    '#000000': '#2C3E50', // Negro -> Azul oscuro
    '#FFFFFF': '#ECF0F1', // Blanco -> Gris claro
    '#FF0000': '#E74C3C', // Rojo -> Rojo más suave
    '#00FF00': '#27AE60', // Verde -> Verde más natural
    '#0000FF': '#3498DB'  // Azul -> Azul más suave
  }
}
```

Esta herramienta es perfecta para:
- Cambiar paletas de colores rápidamente
- Crear variaciones de sprites
- Ajustar tonos y saturación
- Corregir colores específicos
- Crear efectos artísticos

export interface Pixel {
  x: number
  y: number
  color: string | null
}

export interface Layer {
  id: number
  name: string
  visible: boolean
  opacity: number
  pixels: { [key: string]: string }
}

export interface Frame {
  id: number
  name: string
  layers: Layer[]
  duration: number // duración en milisegundos
}

export interface CanvasState {
  width: number
  height: number
  layers: Layer[]
  activeLayer: number
  zoom: number
  showGrid: boolean
  // Propiedades para animación
  frames?: Frame[]
  currentFrame?: number
  animationFps?: number
  isPlaying?: boolean
}

export class PixelCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private state: CanvasState

  constructor(canvas: HTMLCanvasElement, initialState: CanvasState) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d",{ willReadFrequently: true })!
    this.ctx.imageSmoothingEnabled = false;
    this.state = initialState
    this.updateCanvasSize()
  }

  updateState(newState: Partial<CanvasState>) {
    this.state = { ...this.state, ...newState }
    this.updateCanvasSize()
  }

  private updateCanvasSize() {
    this.canvas.width = this.state.width * this.state.zoom
    this.canvas.height = this.state.height * this.state.zoom
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawCheckerboard() {
    const patternSize = Math.max(1, this.state.zoom / 4)
    for (let x = 0; x < this.canvas.width; x += patternSize * 2) {
      for (let y = 0; y < this.canvas.height; y += patternSize * 2) {
        this.ctx.fillStyle =
          (Math.floor(x / patternSize) + Math.floor(y / patternSize)) % 2 === 0 ? "#f8f9fa" : "#ffffff"
        this.ctx.fillRect(x, y, patternSize, patternSize)
      }
    }
  }

  drawLayer(layer: Layer, tint?: string) {
    if (!layer.visible) return

    Object.entries(layer.pixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      if (x >= 0 && x < this.state.width && y >= 0 && y < this.state.height) {
        if (tint) {
          if (tint.startsWith("#")) {
            const hex = tint.slice(1)
            const rTint = parseInt(hex.slice(0, 2), 16)
            const gTint = parseInt(hex.slice(2, 4), 16)
            const bTint = parseInt(hex.slice(4, 6), 16)
            let aTint = 1
            if (hex.length === 8) {
              aTint = parseInt(hex.slice(6, 8), 16) / 255
            }

            if (color.startsWith("#")) {
              const colorHex = color.slice(1)
              const rColor = parseInt(colorHex.slice(0, 2), 16)
              const gColor = parseInt(colorHex.slice(2, 4), 16)
              const bColor = parseInt(colorHex.slice(4, 6), 16)
              let aColor = 1
              if (colorHex.length === 8) {
                aColor = parseInt(colorHex.slice(6, 8), 16) / 255
              }

              const r = Math.floor((rTint * rColor) / 255)
              const g = Math.floor((gTint * gColor) / 255)
              const b = Math.floor((bTint * bColor) / 255)
              const a = aTint * aColor * layer.opacity

              this.ctx.globalAlpha = a
              this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 255)`
            } else {
              this.ctx.fillStyle = tint
            }
          } else {
            this.ctx.fillStyle = tint
          }
        } else {
          // Parse color to handle alpha channel
          if (color.startsWith("#")) {
            const hex = color.slice(1)
            if (hex.length === 8) {
              // Color with alpha channel
              const r = parseInt(hex.slice(0, 2), 16)
              const g = parseInt(hex.slice(2, 4), 16)
              const b = parseInt(hex.slice(4, 6), 16)
              const a = parseInt(hex.slice(6, 8), 16) / 255
              
              this.ctx.globalAlpha = a * layer.opacity
              this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            } else {
              // Regular color without alpha
              this.ctx.globalAlpha = layer.opacity
              this.ctx.fillStyle = color
            }
          } else {
            this.ctx.globalAlpha = layer.opacity
            this.ctx.fillStyle = color
          }
        }
        this.ctx.fillRect(x * this.state.zoom, y * this.state.zoom, this.state.zoom, this.state.zoom)
      }
    })
    this.ctx.globalAlpha = 1
  }

  drawGrid() {
    if (!this.state.showGrid || this.state.zoom < 8) return

    this.ctx.strokeStyle = "rgba(166, 120, 255, 0.2)"
    this.ctx.lineWidth = 1

    for (let i = 0; i <= this.state.width; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.state.zoom, 0)
      this.ctx.lineTo(i * this.state.zoom, this.canvas.height)
      this.ctx.stroke()
    }

    for (let i = 0; i <= this.state.height; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.state.zoom)
      this.ctx.lineTo(this.canvas.width, i * this.state.zoom)
      this.ctx.stroke()
    }
  }

drawSelectionOutline(selectedPixels: { [key: string]: string }, activeLayerPixels: { [key: string]: string }) {
  if (Object.keys(selectedPixels).length === 0) return;

  const selectedPositions = new Set(Object.keys(selectedPixels));
  const ctx = this.ctx;

  // Pixelated style settings
  ctx.imageSmoothingEnabled = false;
  ctx.lineCap = 'butt'; // Pixel-like cap
  ctx.lineJoin = 'miter';
  ctx.lineWidth = 1; // Always 1 for sharp lines

  const zoom = this.state.zoom;
  const pixelSize = zoom;

  const getLuminance = (color: string): number => {
    if (!color || !color.startsWith('#')) return 0.5;

    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const time = Date.now() / 150;
  const offset = Math.floor(time) % 8;
  const dashLength = Math.max(1, Math.floor(zoom / 4));

  selectedPositions.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    const pixelX = Math.floor(x * zoom);
    const pixelY = Math.floor(y * zoom);

    const pixelColor = activeLayerPixels[key] || '#FFFFFF';
    const luminance = getLuminance(pixelColor);
    const lightColor = luminance > 0.5 ? '#000000' : '#FFFFFF';
    const darkColor = luminance > 0.5 ? '#FFFFFF' : '#000000';

    const sides = [
      { dx: 0, dy: -1, side: 'top' as const },
      { dx: 0, dy: 1, side: 'bottom' as const },
      { dx: -1, dy: 0, side: 'left' as const },
      { dx: 1, dy: 0, side: 'right' as const }
    ];

    sides.forEach(({ dx, dy, side }) => {
      const neighborKey = `${x + dx},${y + dy}`;
      if (!selectedPositions.has(neighborKey)) {
        let currentPos = 0;

        while (currentPos < pixelSize) {
          const dashEnd = Math.min(currentPos + dashLength, pixelSize);
          const pattern = Math.floor((currentPos + offset) / dashLength) % 2;
          ctx.strokeStyle = pattern === 0 ? lightColor : darkColor;
          ctx.beginPath();

          switch (side) {
            case 'top':
              ctx.moveTo(pixelX + currentPos, pixelY);
              ctx.lineTo(pixelX + dashEnd, pixelY);
              break;
            case 'bottom':
              ctx.moveTo(pixelX + currentPos, pixelY + pixelSize - 1);
              ctx.lineTo(pixelX + dashEnd, pixelY + pixelSize - 1);
              break;
            case 'left':
              ctx.moveTo(pixelX, pixelY + currentPos);
              ctx.lineTo(pixelX, pixelY + dashEnd);
              break;
            case 'right':
              ctx.moveTo(pixelX + pixelSize - 1, pixelY + currentPos);
              ctx.lineTo(pixelX + pixelSize - 1, pixelY + dashEnd);
              break;
          }

          ctx.stroke();
          currentPos += dashLength;
        }
      }
    });
  });
}


  drawPreview(previewPixels: { [key: string]: string }) {
    Object.entries(previewPixels).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number)
      
      // Parse color to handle alpha channel
      if (color.startsWith("#")) {
        const hex = color.slice(1)
        if (hex.length === 8) {
          // Color with alpha channel
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          const a = parseInt(hex.slice(6, 8), 16) / 255
          
          this.ctx.globalAlpha = a * 0.7 // Preview opacity
          this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        } else {
          // Regular color without alpha
          this.ctx.globalAlpha = 0.7
          this.ctx.fillStyle = color
        }
      } else {
        this.ctx.globalAlpha = 0.7
        this.ctx.fillStyle = color
      }
      
      this.ctx.fillRect(x * this.state.zoom, y * this.state.zoom, this.state.zoom, this.state.zoom)
      
    })
    this.ctx.globalAlpha = 1
  }

  render(
    previewPixels: { [key: string]: string } = {}, 
    onionSkin?: { layer: Layer; opacity: number },
    selectedPixels?: { [key: string]: string }
  ) {
    this.clear()
    this.drawCheckerboard()

    // Onion skin
    if (onionSkin) {
      this.state.layers.forEach((layer) => {
        if (layer.id === onionSkin.layer.id) {
          this.drawLayer(layer)
        } else {
          const hexOpacity = Math.round(onionSkin.opacity * 255).toString(16).padStart(2, "0")
          this.drawLayer(layer, `#ffffff${hexOpacity}`)
        }
      })
    } else {
      // Layers
      this.state.layers.forEach((layer) => this.drawLayer(layer))
    }

    // Preview (excluding selection border pixels)
    const filteredPreview = { ...previewPixels }
    if (selectedPixels) {
      // Remove selection border pixels from preview to avoid conflicts
      Object.keys(selectedPixels).forEach(key => {
        if (key in filteredPreview && (
          filteredPreview[key].includes('rgba(255, 255, 255,') || 
          filteredPreview[key].includes('rgba(0, 0, 0,')
        )) {
          delete filteredPreview[key]
        }
      })
    }
    this.drawPreview(filteredPreview)

    // Selection outline
    if (selectedPixels && Object.keys(selectedPixels).length > 0) {
      const activeLayer = this.state.layers[this.state.activeLayer]
      if (activeLayer) {
        this.drawSelectionOutline(selectedPixels, activeLayer.pixels)
      }
    }

    // Grid
    this.drawGrid()
  }

  getPixelPosition(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    const x = Math.floor(((clientX - rect.left) * scaleX) / this.state.zoom)
    const y = Math.floor(((clientY - rect.top) * scaleY) / this.state.zoom)

    if (x >= 0 && x < this.state.width && y >= 0 && y < this.state.height) {
      return { x, y }
    }
    return null
  }

  // Extraer colores únicos del canvas actual
  getUniqueColorsFromCanvas(): string[] {
    const colors = new Set<string>()
    
    this.state.layers.forEach((layer: Layer) => {
      if (layer.visible) {
        Object.values(layer.pixels).forEach((color: string) => {
          if (color && color !== 'transparent') {
            colors.add(color)
          }
        })
      }
    })
    
    return Array.from(colors).filter(color => color.startsWith('#'))
  }

  // Extraer colores únicos de todas las capas (incluso las no visibles)
  getUniqueColorsFromLayers(): string[] {
    const colors = new Set<string>()
    
    this.state.layers.forEach((layer: Layer) => {
      Object.values(layer.pixels).forEach((color: string) => {
        if (color && color !== 'transparent') {
          colors.add(color)
        }
      })
    })
    
    return Array.from(colors).filter(color => color.startsWith('#'))
  }

  // Extraer colores únicos de todos los frames
  getUniqueColorsFromFrames(): string[] {
    const colors = new Set<string>()
    
    // Incluir colores del frame actual
    this.getUniqueColorsFromLayers().forEach(color => colors.add(color))
    
    // Incluir colores de otros frames si existen
    if (this.state.frames) {
      this.state.frames.forEach((frame: Frame) => {
        frame.layers.forEach((layer: Layer) => {
          Object.values(layer.pixels).forEach((color: string) => {
            if (color && color !== 'transparent') {
              colors.add(color)
            }
          })
        })
      })
    }
    
    return Array.from(colors).filter(color => color.startsWith('#'))
  }
  replaceColorInLayersAndFrames(oldColor: string, newColor: string) {
    // Replace color in layers
    this.state.layers.forEach((layer: Layer) => {
      Object.entries(layer.pixels).forEach(([key, color]) => {
        if (color === oldColor) {
          layer.pixels[key] = newColor;
        } else if (color.startsWith("rgba") && (newColor.startsWith("#") || newColor.startsWith("rgb"))) {
          const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+|\d*\.\d+)\)/);
          if (rgbaMatch) {
            const [_, r, g, b, a] = rgbaMatch.map(Number);

            if (newColor.startsWith("#")) {
              const newHex = newColor.slice(1);
              const newR = parseInt(newHex.slice(0, 2), 16);
              const newG = parseInt(newHex.slice(2, 4), 16);
              const newB = parseInt(newHex.slice(4, 6), 16);
              layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
            } else if (newColor.startsWith("rgb")) {
              const rgbMatch = newColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                const [__, newR, newG, newB] = rgbMatch.map(Number);
                layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
              }
            }
          }
        }
      });
    });

    // Replace color in frames
    if (this.state.frames) {
      this.state.frames.forEach((frame: Frame) => {
        frame.layers.forEach((layer: Layer) => {
          Object.entries(layer.pixels).forEach(([key, color]) => {
            if (color === oldColor) {
              layer.pixels[key] = newColor;
            } else if (color.startsWith("rgba") && (newColor.startsWith("#") || newColor.startsWith("rgb"))) {
              const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+|\d*\.\d+)\)/);
              if (rgbaMatch) {
                const [_, r, g, b, a] = rgbaMatch.map(Number);

                if (newColor.startsWith("#")) {
                  const newHex = newColor.slice(1);
                  const newR = parseInt(newHex.slice(0, 2), 16);
                  const newG = parseInt(newHex.slice(2, 4), 16);
                  const newB = parseInt(newHex.slice(4, 6), 16);
                  layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
                } else if (newColor.startsWith("rgb")) {
                  const rgbMatch = newColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                  if (rgbMatch) {
                    const [__, newR, newG, newB] = rgbMatch.map(Number);
                    layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
                  }
                }
              }
            }
          });
        });
      });
    }
  }

}


export class LayerManager {
  layers: Layer[]
  moment: number
  private activeLayerIndex: number
  private history: Layer[][]
  private historyIndex: number
  
  // Propiedades para animación
  frames: Frame[]
  currentFrame: number
  animationFps: number

  constructor(initialLayers: Layer[] = [], initialFrames: Frame[] = []) {
    this.layers = initialLayers.length > 0 ? initialLayers : [this.createDefaultLayer()]
    this.activeLayerIndex = 0
    this.history = [JSON.parse(JSON.stringify(this.layers))]
    this.historyIndex = 0
    this.moment = 0
    
    // Inicializar frames
    if (initialFrames.length > 0) {
      this.frames = initialFrames
      this.currentFrame = 0
    } else {
      // Crear frame inicial con las capas actuales
      this.frames = [{
        id: Date.now(),
        name: "Frame 1",
        layers: JSON.parse(JSON.stringify(this.layers)),
        duration: 100 // 100ms por defecto
      }]
      this.currentFrame = 0
    }
    this.animationFps = 10 // 10 fps por defecto
  }

  private createDefaultLayer(): Layer {
    return {
      id: Date.now(),
      name: "Layer 1",
      visible: true,
      opacity: 1,
      pixels: {},
    }
  }

  getLayers(): Layer[] {
    return this.layers
  }

  getActiveLayer(): Layer {
    return this.layers[this.activeLayerIndex]
  }

  getActiveLayerIndex(): number {
    return this.activeLayerIndex
  }

  setActiveLayer(index: number) {
    if (index >= 0 && index < this.layers.length) {
      this.activeLayerIndex = index
    }
  }

  addLayer(name?: string): Layer {
    const newLayer: Layer = {
      id: Date.now(),
      name: name || `Layer ${this.layers.length + 1}`,
      visible: true,
      opacity: 1,
      pixels: {},
    }
    this.layers.push(newLayer)
    this.activeLayerIndex = this.layers.length - 1
    this.saveToHistory()
    return newLayer
  }
  getLayerById(id: number): Layer | null {
    return this.layers.find((layer) => layer.id === id) || null;
  }

  reorderLayer(id: number,order: number){
    const layerIndex = this.layers.findIndex((layer) => layer.id === id);
    if (layerIndex === -1 || order < 0 || order >= this.layers.length) return;

    const [layer] = this.layers.splice(layerIndex, 1);
    this.layers.splice(order, 0, layer);
    this.saveToHistory();
  }

  deleteLayer(index: number): Layer | null {
    if (this.layers.length <= 1) return null

    const removedLayer = this.layers.splice(index, 1)[0]
    this.activeLayerIndex = Math.min(this.activeLayerIndex, this.layers.length - 1)
    this.saveToHistory()
    return removedLayer
  }
  getLayerByOrder(order: number): Layer | null {
    if (order >= 0 && order < this.layers.length) {
      return this.layers[order];
    }
    return null;
  }
  renameLayer(order: number, newName: string): Layer | null {
    const layer = this.getLayerByOrder(order);
    if (layer) {
      layer.name = newName;
      this.saveToHistory();
      return layer;
    }
    return null;
  }
  toggleLayerVisibility(index: number): Layer | null {
    if (index >= 0 && index < this.layers.length) {
      this.layers[index].visible = !this.layers[index].visible
      return this.layers[index]
    }
    return null
  }
  getOrderById(id: number): number | null {
    const layerIndex = this.layers.findIndex((layer) => layer.id === id);
    return layerIndex !== -1 ? layerIndex : null;
  }

  updatePixel(x: number, y: number, color: string | null, layer?: number) {
    const key = `${x},${y}`
    const activeLayer = this.getActiveLayer()
    if( layer) {  
      if (color === null) {
        delete this.layers[layer].pixels[key]
      }
      else {
        this.layers[layer].pixels[key] = color
      }
    }else{

    if (color === null) {
      delete activeLayer.pixels[key]
    } else {
      activeLayer.pixels[key] = color
    }
    }
    this.moment++;
  }
  
  saveToHistory() {
    const newHistory = this.history.slice(0, this.historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(this.layers)))
    this.history = newHistory
    this.historyIndex = newHistory.length - 1
    this.moment++;
  }
  undo(): { type: string; x: number; y: number; color: string | null; layer: number }[] {
    if (this.historyIndex > 0) {
      const previousState = this.history[this.historyIndex];
      this.historyIndex--;
      const currentState = this.history[this.historyIndex];
      this.layers = JSON.parse(JSON.stringify(currentState));

      // Update active layer index if it was changed
      if (this.activeLayerIndex >= this.layers.length) {
        this.activeLayerIndex = this.layers.length - 1;
      }
    this.moment++;

      return this.getChangedPixels(previousState, currentState);
    }
    return [];
  }

  redo(): { type: string; x: number; y: number; color: string | null; layer: number }[] {
    if (this.historyIndex < this.history.length - 1) {
      const previousState = this.history[this.historyIndex];
      this.historyIndex++;
      const currentState = this.history[this.historyIndex];
      this.layers = JSON.parse(JSON.stringify(currentState));

      // Update active layer index if it was changed
      if (this.activeLayerIndex >= this.layers.length) {
        this.activeLayerIndex = this.layers.length - 1;
      }

    this.moment++;
      return this.getChangedPixels(previousState, currentState);
    }
    return [];
  }

  private getChangedPixels(
    previousState: Layer[],
    currentState: Layer[]
  ): { type: string; x: number; y: number; color: string | null; layer: number }[] {
    const changedPixels: { type: string; x: number; y: number; color: string | null; layer: number }[] = [];

    previousState.forEach((prevLayer, index) => {
    const currLayer = currentState[index];
    if (!currLayer) return;

    const prevPixels = prevLayer.pixels;
    const currPixels = currLayer.pixels;

    const allKeys = new Set([...Object.keys(prevPixels), ...Object.keys(currPixels)]);

    allKeys.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      if (prevPixels[key] !== currPixels[key]) {
      changedPixels.push({
        type: currPixels[key] ? "update" : "delete",
        x,
        y,
        color: currPixels[key] || null,
        layer: index,
      });
      }
    });
    });

    return changedPixels;
  }

  canUndo(): boolean {
    return this.historyIndex > 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  // Métodos para manejar frames de animación
  getCurrentFrame(): Frame {
    return this.frames[this.currentFrame]
  }

  setCurrentFrame(frameIndex: number) {
    if (frameIndex >= 0 && frameIndex < this.frames.length) {
      // Guardar las capas actuales en el frame actual
      this.frames[this.currentFrame].layers = JSON.parse(JSON.stringify(this.layers))
      
      // Cambiar al nuevo frame
      this.currentFrame = frameIndex
      this.layers = JSON.parse(JSON.stringify(this.frames[frameIndex].layers))
      
      // Ajustar activeLayerIndex si es necesario
      if (this.activeLayerIndex >= this.layers.length) {
        this.activeLayerIndex = this.layers.length - 1
      }
      
      this.moment++
    }
  }

  addFrame(name?: string, duration: number = 100): Frame {
    // Guardar las capas actuales en el frame actual
    this.frames[this.currentFrame].layers = JSON.parse(JSON.stringify(this.layers))
    
    const newFrame: Frame = {
      id: Date.now(),
      name: name || `Frame ${this.frames.length + 1}`,
      layers: JSON.parse(JSON.stringify(this.layers)), // Copiar capas del frame actual
      duration: duration
    }
    
    this.frames.push(newFrame)
    this.currentFrame = this.frames.length - 1
    this.saveToHistory()
    return newFrame
  }

  duplicateFrame(frameIndex: number): Frame | null {
    if (frameIndex >= 0 && frameIndex < this.frames.length) {
      const frameToDuplicate = this.frames[frameIndex]
      const newFrame: Frame = {
        id: Date.now(),
        name: `${frameToDuplicate.name} Copy`,
        layers: JSON.parse(JSON.stringify(frameToDuplicate.layers)),
        duration: frameToDuplicate.duration
      }
      
      this.frames.splice(frameIndex + 1, 0, newFrame)
      this.currentFrame = frameIndex + 1
      this.layers = JSON.parse(JSON.stringify(newFrame.layers))
      this.saveToHistory()
      return newFrame
    }
    return null
  }

  deleteFrame(frameIndex: number): Frame | null {
    if (this.frames.length <= 1 || frameIndex < 0 || frameIndex >= this.frames.length) {
      return null
    }

    const removedFrame = this.frames.splice(frameIndex, 1)[0]
    
    // Ajustar currentFrame si es necesario
    if (this.currentFrame >= this.frames.length) {
      this.currentFrame = this.frames.length - 1
    } else if (frameIndex <= this.currentFrame && this.currentFrame > 0) {
      this.currentFrame--
    }
    
    // Cargar las capas del frame actual
    this.layers = JSON.parse(JSON.stringify(this.frames[this.currentFrame].layers))
    
    // Ajustar activeLayerIndex si es necesario
    if (this.activeLayerIndex >= this.layers.length) {
      this.activeLayerIndex = this.layers.length - 1
    }
    
    this.saveToHistory()
    return removedFrame
  }

  moveFrame(fromIndex: number, toIndex: number) {
    if (fromIndex >= 0 && fromIndex < this.frames.length && 
        toIndex >= 0 && toIndex < this.frames.length && 
        fromIndex !== toIndex) {
      
      // Guardar las capas actuales en el frame actual
      this.frames[this.currentFrame].layers = JSON.parse(JSON.stringify(this.layers))
      
      const [frame] = this.frames.splice(fromIndex, 1)
      this.frames.splice(toIndex, 0, frame)
      
      // Actualizar currentFrame
      if (this.currentFrame === fromIndex) {
        this.currentFrame = toIndex
      } else if (fromIndex < this.currentFrame && toIndex >= this.currentFrame) {
        this.currentFrame--
      } else if (fromIndex > this.currentFrame && toIndex <= this.currentFrame) {
        this.currentFrame++
      }
      
      this.saveToHistory()
    }
  }

  updateFrameDuration(frameIndex: number, duration: number) {
    if (frameIndex >= 0 && frameIndex < this.frames.length) {
      this.frames[frameIndex].duration = duration
    }
  }

  renameFrame(frameIndex: number, newName: string) {
    if (frameIndex >= 0 && frameIndex < this.frames.length) {
      this.frames[frameIndex].name = newName
    }
  }

  setAnimationFps(fps: number) {
    this.animationFps = Math.max(1, Math.min(60, fps))
  }

  getAnimationDuration(): number {
    return this.frames.reduce((total, frame) => total + frame.duration, 0)
  }

  exportFramesData() {
    // Guardar las capas actuales en el frame actual antes de exportar
    this.frames[this.currentFrame].layers = JSON.parse(JSON.stringify(this.layers))
    
    return {
      frames: this.frames,
      currentFrame: this.currentFrame,
      animationFps: this.animationFps
    }
  }

  // Método para reemplazar colores en todas las capas y frames
  replaceColorInLayersAndFrames(oldColor: string, newColor: string) {
    // Reemplazar color en las capas actuales
    this.layers.forEach((layer: Layer) => {
      Object.entries(layer.pixels).forEach(([key, color]) => {
        if (color === oldColor) {
          layer.pixels[key] = newColor;
        } else if (color.startsWith("rgba") && (newColor.startsWith("#") || newColor.startsWith("rgb"))) {
          const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+|\d*\.\d+)\)/);
          if (rgbaMatch) {
            const [_, r, g, b, a] = rgbaMatch.map(Number);

            if (newColor.startsWith("#")) {
              const newHex = newColor.slice(1);
              const newR = parseInt(newHex.slice(0, 2), 16);
              const newG = parseInt(newHex.slice(2, 4), 16);
              const newB = parseInt(newHex.slice(4, 6), 16);
              layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
            } else if (newColor.startsWith("rgb")) {
              const rgbMatch = newColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                const [__, newR, newG, newB] = rgbMatch.map(Number);
                layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
              }
            }
          }
        }
      });
    });

    // Reemplazar color en todos los frames
    this.frames.forEach((frame: Frame) => {
      frame.layers.forEach((layer: Layer) => {
        Object.entries(layer.pixels).forEach(([key, color]) => {
          if (color === oldColor) {
            layer.pixels[key] = newColor;
          } else if (color.startsWith("rgba") && (newColor.startsWith("#") || newColor.startsWith("rgb"))) {
            const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+|\d*\.\d+)\)/);
            if (rgbaMatch) {
              const [_, r, g, b, a] = rgbaMatch.map(Number);

              if (newColor.startsWith("#")) {
                const newHex = newColor.slice(1);
                const newR = parseInt(newHex.slice(0, 2), 16);
                const newG = parseInt(newHex.slice(2, 4), 16);
                const newB = parseInt(newHex.slice(4, 6), 16);
                layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
              } else if (newColor.startsWith("rgb")) {
                const rgbMatch = newColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (rgbMatch) {
                  const [__, newR, newG, newB] = rgbMatch.map(Number);
                  layer.pixels[key] = `rgba(${newR}, ${newG}, ${newB}, ${a})`;
                }
              }
            }
          }
        });
      });
    });

    // Incrementar el momento para forzar re-render
    this.moment++;
  }
}

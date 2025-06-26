import { DrawingTool } from './base-tool'
import type { Point } from './types'

// Utilidad para interpolación
function lerp(a: number, b: number, t: number) {
  return a + t * (b - a)
}

// Perlin Noise básico
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function grad(hash: number, x: number, y: number) {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

function perlinNoise(x: number, y: number) {
  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)

  const u = fade(xf)
  const v = fade(yf)

  const p = NoiseTool.permutation
  const aa = p[p[xi] + yi]
  const ab = p[p[xi] + yi + 1]
  const ba = p[p[xi + 1] + yi]
  const bb = p[p[xi + 1] + yi + 1]

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u)
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u)

  return (lerp(x1, x2, v) + 1) / 2
}

// Cellular noise simplificado: distancia al punto aleatorio más cercano
function cellularNoise(x: number, y: number, cellSize: number = 5) {
  const cx = Math.floor(x / cellSize)
  const cy = Math.floor(y / cellSize)

  let minDist = Infinity
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = (cx + dx + 1000) % 1000
      const py = (cy + dy + 1000) % 1000
      const rx = (px + 0.5 + Math.sin(px * 12.9898 + py * 78.233) * 0.5) * cellSize
      const ry = (py + 0.5 + Math.cos(px * 45.12 + py * 94.53) * 0.5) * cellSize
      const dist = Math.hypot(rx - x, ry - y)
      if (dist < minDist) minDist = dist
    }
  }

  return Math.min(1, minDist / cellSize)
}

export class NoiseTool extends DrawingTool {
  private density = 0.3
  private pattern: "random" | "perlin" | "cellular" = "random"

  static permutation: number[] = (() => {
    const p = Array.from({ length: 256 }, (_, i) => i)
    for (let i = p.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    return p.concat(p)
  })()

  setDensity(density: number) {
    this.density = density
  }

  setPattern(pattern: "random" | "perlin" | "cellular") {
    this.pattern = pattern
  }

  onStart(point: Point) {
    return this.generateNoise(point, this.size)
  }

  onMove(point: Point) {
    return this.generateNoise(point, this.size)
  }

  onEnd() {
    return []
  }

  getPreview() {
    return {}
  }

  private generateNoise(center: Point, radius: number) {
    const pixels: { x: number; y: number; color: string }[] = []

    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        let value: number

        switch (this.pattern) {
          case "perlin":
            value = perlinNoise(x * 0.1, y * 0.1)
            break
          case "cellular":
            value = 1 - cellularNoise(x, y, 6) // invertir para que valores más cercanos sean más "densos"
            break
          default:
            value = Math.random()
        }

        if (value < this.density) {
          pixels.push({ x, y, color: this.color })
        }
      }
    }

    return pixels
  }
}

export interface Point {
  x: number
  y: number
}

// Convierte hex a rgba, soporta #RRGGBB y #RRGGBBAA
export function hexToRgba(hex: string, defaultAlpha: number = 1): { r: number; g: number; b: number; a: number } {
  hex = hex.replace('#', '');

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b, a: defaultAlpha };
  }

  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  // Por defecto si el formato no es válido
  return { r: 0, g: 0, b: 0, a: defaultAlpha };
}

// Convierte RGBA a HEX. Si alpha < 1, incluye componente alpha
export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a < 1 ? `${base}${toHex(Math.round(a * 255))}` : base;
}
function hexToRgbaArray(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const a = h.length === 8 ? parseInt(h.substring(6, 8), 16) : 255
  return [r, g, b, a]
}


export function averageColors(colors: string[]): string {
  if (colors.length === 0) return "#00000000"
  let total = [0, 0, 0, 0]
  colors.forEach(color => {
    const rgba = hexToRgbaArray(color)
    total = total.map((v, i) => v + rgba[i]) as [number, number, number, number]
  })
  const avg = total.map(v => Math.round(v / colors.length))
  return rgbaToHex(avg[0], avg[1], avg[2], avg[3])
}


// Mezcla dos colores considerando alpha si ambos tienen transparencia
export function blendColors(baseColor: string | null, newColor: string, alphaOverride?: number): string {
  const overlay = hexToRgba(newColor);

  // Si se pasa alphaOverride, sobrescribe la del overlay
  if (typeof alphaOverride === 'number') {
    overlay.a = alphaOverride;
  }

  // Si no hay color base, aplicar la opacidad al nuevo color sobre transparente
  if (!baseColor) {
    // Si la opacidad es completa, retorna el color tal como está
    if (overlay.a >= 1) return newColor;
    
    // Si hay transparencia, retorna el color con la opacidad aplicada
    const result = rgbaToHex(overlay.r, overlay.g, overlay.b, overlay.a);
    return result;
  }

  const base = hexToRgba(baseColor);

  // Si la opacidad del overlay es completa, retorna el nuevo color
  if (overlay.a >= 1) return newColor;

  // Alpha blending
  const outA = overlay.a + base.a * (1 - overlay.a);
  
  if (outA === 0) {
    return rgbaToHex(0, 0, 0, 0);
  }
  
  const r = Math.round((overlay.r * overlay.a + base.r * base.a * (1 - overlay.a)) / outA);
  const g = Math.round((overlay.g * overlay.a + base.g * base.a * (1 - overlay.a)) / outA);
  const b = Math.round((overlay.b * overlay.a + base.b * base.a * (1 - overlay.a)) / outA);

  return rgbaToHex(r, g, b, outA);
}

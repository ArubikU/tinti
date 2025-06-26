"use client"

import { useLanguage } from "@/lib/language"
import { Check, Edit2, Palette, RotateCcw, Shuffle, X } from "lucide-react"
import { useState } from "react"
import { CircleColor } from "./CircleColor"
import { PrimaryButton } from "./PrimaryButton"
import { Slider } from "./slider"

interface ColorPaletteProps {
  currentColor: string
  onColorSelect: (color: string) => void
  palette: string[]
  onPaletteChange: (palette: string[]) => void
  isDesktop?: boolean
  // Funciones opcionales para extraer colores del canvas
  onExtractFromCanvas?: () => string[]
  onExtractFromLayers?: () => string[]
  onExtractFromFrames?: () => string[]
}

export function ColorPalette({ 
  currentColor, 
  onColorSelect, 
  palette, 
  onPaletteChange, 
  isDesktop = false,
  onExtractFromCanvas,
  onExtractFromLayers,
  onExtractFromFrames
}: ColorPaletteProps) {
  const { t } = useLanguage()
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [paletteSize, setPaletteSize] = useState(16)
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null)
  const [tempColor, setTempColor] = useState<string>("")

  // Convertir hex a HSL
  const hexToHsl = (hex: string) => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return [h * 360, s * 100, l * 100]
  }

  // Convertir HSL a hex
  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Generar paleta basada en color actual
  const generatePalette = (type: "monochromatic" | "analogous" | "complementary" | "triadic" | "random") => {
    const [baseH, baseS, baseL] = hexToHsl(currentColor)
    const newPalette: string[] = []

    switch (type) {
      case "monochromatic":
        for (let i = 0; i < paletteSize; i++) {
          const l = Math.max(5, Math.min(95, baseL + (i - paletteSize / 2) * (80 / paletteSize)))
          newPalette.push(hslToHex(baseH, baseS, l))
        }
        break

      case "analogous":
        for (let i = 0; i < paletteSize; i++) {
          const h = (baseH + (i - paletteSize / 2) * (60 / paletteSize) + 360) % 360
          newPalette.push(hslToHex(h, baseS, baseL))
        }
        break

      case "complementary":
        const complementH = (baseH + 180) % 360
        for (let i = 0; i < paletteSize; i++) {
          const h = i < paletteSize / 2 ? baseH : complementH
          const l = Math.max(10, Math.min(90, baseL + ((i % (paletteSize / 2)) - paletteSize / 4) * (60 / paletteSize)))
          newPalette.push(hslToHex(h, baseS, l))
        }
        break

      case "triadic":
        const triad1 = (baseH + 120) % 360
        const triad2 = (baseH + 240) % 360
        for (let i = 0; i < paletteSize; i++) {
          const h = i % 3 === 0 ? baseH : i % 3 === 1 ? triad1 : triad2
          const l = Math.max(10, Math.min(90, baseL + (Math.floor(i / 3) - paletteSize / 6) * (40 / paletteSize)))
          newPalette.push(hslToHex(h, baseS, l))
        }
        break

      case "random":
        for (let i = 0; i < paletteSize; i++) {
          const h = Math.random() * 360
          const s = Math.random() * 50 + 50
          const l = Math.random() * 60 + 20
          newPalette.push(hslToHex(h, s, l))
        }
        break
    }

    onPaletteChange(newPalette)
  }

  // Ajustar toda la paleta
  const adjustPalette = () => {
    const newPalette = palette.map((color) => {
      const [h, s, l] = hexToHsl(color)
      return hslToHex(
        (h + hue) % 360,
        Math.max(0, Math.min(100, s * (saturation / 100))),
        Math.max(0, Math.min(100, l * (lightness / 100))),
      )
    })
    onPaletteChange(newPalette)
  }

  // Extraer colores únicos de una fuente
  const extractColors = (source: 'canvas' | 'layers' | 'frames') => {
    let extractedColors: string[] = []
    
    switch (source) {
      case 'canvas':
        if (onExtractFromCanvas) {
          extractedColors = onExtractFromCanvas()
        }
        break
      case 'layers':
        if (onExtractFromLayers) {
          extractedColors = onExtractFromLayers()
        }
        break
      case 'frames':
        if (onExtractFromFrames) {
          extractedColors = onExtractFromFrames()
        }
        break
    }

    // Filtrar y limitar colores únicos
    const uniqueColors = [...new Set(extractedColors)].slice(0, paletteSize)
    if (uniqueColors.length > 0) {
      onPaletteChange(uniqueColors)
    }
  }

  // Editar un color específico de la paleta
  const startEditingColor = (index: number) => {
    setEditingColorIndex(index)
    setTempColor(palette[index])
  }

  const saveColorEdit = () => {
    if (editingColorIndex !== null && tempColor) {
      const newPalette = [...palette]
      newPalette[editingColorIndex] = tempColor
      onPaletteChange(newPalette)
      setEditingColorIndex(null)
      setTempColor("")
    }
  }

  const cancelColorEdit = () => {
    setEditingColorIndex(null)
    setTempColor("")
  }

  const handleColorChange = (() => {
    let timeout: NodeJS.Timeout | null = null

    return (color: string) => {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        onColorSelect(color)
      }, 150)
    }
  })()
  return (
    <div className="space-y-6">
      {/* Color actual */}
    {(!isDesktop) && (      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{t("editor.panelContent.colorPalette.currentColor")}</h4>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => {
              const newColor = e.target.value
              handleColorChange(newColor)
            }}
            className="w-10 h-10 border rounded"
          />
          <span className="text-sm font-medium text-gray-700">{currentColor}</span>
        </div>
      </div>)}
      {/* Paleta actual */}
      {(!isDesktop && palette.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">{t("editor.panelContent.colorPalette.currentPalette")}</h4>
            <span className="text-xs text-gray-500">{t("editor.panelContent.colorPalette.doubleTapToEdit")}</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {palette.map((color, index) => (
              <div key={index} className="relative">
                {editingColorIndex === index ? (
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      className="w-6 h-6 border rounded cursor-pointer"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={saveColorEdit}
                        className="w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded text-xs"
                      >
                        <Check size={10} />
                      </button>
                      <button
                        onClick={cancelColorEdit}
                        className="w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded text-xs"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <CircleColor
                      hex={color}
                      onSelect={() => onColorSelect(color)}
                      isSelected={currentColor === color}
                      size="sm"
                    />
                    <button
                      onClick={() => startEditingColor(index)}
                      onDoubleClick={() => startEditingColor(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Generadores de paleta */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{t("editor.panelContent.colorPalette.generatePalette")}</h4>
        
        {/* Extraer colores del proyecto */}
        {(onExtractFromCanvas || onExtractFromLayers || onExtractFromFrames) && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">{t("editor.panelContent.colorPalette.extractFromProject")}</h5>
            <div className="flex gap-2 mb-3 flex-wrap overflow-x-auto scrollbar-hide">
              {onExtractFromCanvas && (
              <PrimaryButton
                variant="outline"
                size="sm"
                onClick={() => extractColors('canvas')}
                icon={Palette}
                className="flex-1 text-xs"
              >
                {t("editor.panelContent.colorPalette.canvas")}
              </PrimaryButton>
              )}
              {onExtractFromLayers && (
              <PrimaryButton
                variant="outline"
                size="sm"
                onClick={() => extractColors('layers')}
                icon={Palette}
                className="flex-1 text-xs"
              >
                {t("editor.panelContent.colorPalette.layers")}
              </PrimaryButton>
              )}
              {onExtractFromFrames && (
              <PrimaryButton
                variant="outline"
                size="sm"
                onClick={() => extractColors('frames')}
                icon={Palette}
                className="flex-1 text-xs"
              >
                {t("editor.panelContent.colorPalette.frames")}
              </PrimaryButton>
              )}
            </div>
          </div>
        )}

        {/* Paletas automáticas */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">{t("editor.panelContent.colorPalette.automaticPalettes")}</h5>
          <div className="flex flex-wrap gap-2 mb-3">
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={() => generatePalette("monochromatic")}
              className="flex-1 text-xs"
            >
              {t("editor.panelContent.colorPalette.monochromatic")}
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={() => generatePalette("analogous")}
              className="flex-1 text-xs"
            >
              {t("editor.panelContent.colorPalette.analogous")}
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={() => generatePalette("complementary")}
              className="flex-1 text-xs"
            >
              {t("editor.panelContent.colorPalette.complementary")}
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={() => generatePalette("triadic")}
              className="flex-1 text-xs"
            >
              {t("editor.panelContent.colorPalette.triadic")}
            </PrimaryButton>
          </div>
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => generatePalette("random")}
            icon={Shuffle}
            className="w-full text-xs"
          >
            {t("editor.panelContent.colorPalette.random")}
          </PrimaryButton>
        </div>
      </div>

      {/* Tamaño de paleta */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{t("editor.panelContent.colorPalette.paletteSize")}</h4>
        <div className="flex items-center gap-3">
          <Slider
            value={paletteSize}
            onValueChange={(value) => setPaletteSize(value)}
            min={8}
            max={32}
            step={4}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-8">{paletteSize}</span>
        </div>
      </div>

      {/* Ajustes de paleta */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{t("editor.panelContent.colorPalette.adjustPalette")}</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">{t("editor.panelContent.colorPalette.hue")}</label>
            <div className="flex items-center gap-3">
              <Slider
                value={hue}
                onValueChange={(value) => setHue(value)}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{hue}°</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">{t("editor.panelContent.colorPalette.saturation")}</label>
            <div className="flex items-center gap-3">
              <Slider
                value={saturation}
                onValueChange={(value) => setSaturation(value)}
                min={0}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{saturation}%</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">{t("editor.panelContent.colorPalette.lightness")}</label>
            <div className="flex items-center gap-3">
              <Slider
                value={lightness}
                onValueChange={(value) => setLightness(value)}
                min={0}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{lightness}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <PrimaryButton variant="secondary" size="sm" onClick={adjustPalette} className="flex-1">
              {t("editor.panelContent.colorPalette.apply")}
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={() => {
                setHue(0)
                setSaturation(100)
                setLightness(100)
              }}
              icon={RotateCcw}
            >
              {t("editor.panelContent.colorPalette.reset")}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

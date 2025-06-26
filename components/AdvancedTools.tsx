"use client"

import { Copy, FlipHorizontal, RotateCw, Sparkles, Type, Zap } from "lucide-react"
import { useState } from "react"
import { PrimaryButton } from "./ui/PrimaryButton"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"

interface AdvancedToolsProps {
  tool: string
  onToolChange: (settings: any) => void
}

export function AdvancedTools({ tool, onToolChange }: AdvancedToolsProps) {
  const [textSettings, setTextSettings] = useState({
    text: "Hello",
    fontSize: 8,
    fontFamily: "monospace",
  })

  const [gradientSettings, setGradientSettings] = useState({
    startColor: "#A678FF",
    endColor: "#FFB6A6",
    direction: "horizontal",
    steps: 8,
  })

  const [noiseSettings, setNoiseSettings] = useState({
    density: 0.3,
    colors: ["#A678FF", "#FFB6A6", "#A9FBD7"],
    pattern: "random",
  })

  const [mirrorSettings, setMirrorSettings] = useState({
    axis: "horizontal",
    fromCenter: true,
  })

  const [rotateSettings, setRotateSettings] = useState({
    angle: 90,
    direction: "clockwise",
  })

  const [cloneSettings, setCloneSettings] = useState({
    offsetX: 1,
    offsetY: 1,
    opacity: 0.8,
  })

  if (tool === "text") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Texto</h4>
        </div>

        <div>
          <Label htmlFor="text-input" className="text-sm text-gray-600">
            Texto
          </Label>
          <Input
            id="text-input"
            value={textSettings.text}
            onChange={(e) => {
              const newSettings = { ...textSettings, text: e.target.value }
              setTextSettings(newSettings)
              onToolChange(newSettings)
            }}
            className="mt-1"
            placeholder="Escribe tu texto..."
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">Tamaño de fuente</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={textSettings.fontSize}
              onValueChange={(value) => {
                const newSettings = { ...textSettings, fontSize: value }
                setTextSettings(newSettings)
                onToolChange(newSettings)
              }}
              min={4}
              max={32}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-8">{textSettings.fontSize}px</span>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Fuente</Label>
          <select
            value={textSettings.fontFamily}
            onChange={(e) => {
              const newSettings = { ...textSettings, fontFamily: e.target.value }
              setTextSettings(newSettings)
              onToolChange(newSettings)
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          >
            <option value="monospace">Monospace</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="cursive">Cursive</option>
          </select>
        </div>
      </div>
    )
  }

  if (tool === "gradient") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Degradado</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-gray-600">Color inicial</Label>
            <Input
              type="color"
              value={gradientSettings.startColor}
              onChange={(e) => {
                const newSettings = { ...gradientSettings, startColor: e.target.value }
                setGradientSettings(newSettings)
                onToolChange(newSettings)
              }}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-600">Color final</Label>
            <Input
              type="color"
              value={gradientSettings.endColor}
              onChange={(e) => {
                const newSettings = { ...gradientSettings, endColor: e.target.value }
                setGradientSettings(newSettings)
                onToolChange(newSettings)
              }}
              className="mt-1 h-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Dirección</Label>
          <select
            value={gradientSettings.direction}
            onChange={(e) => {
              const newSettings = { ...gradientSettings, direction: e.target.value }
              setGradientSettings(newSettings)
              onToolChange(newSettings)
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="diagonal">Diagonal</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Pasos</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={gradientSettings.steps}
              onValueChange={(value) => {
                const newSettings = { ...gradientSettings, steps: value }
                setGradientSettings(newSettings)
                onToolChange(newSettings)
              }}
              min={2}
              max={32}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-8">{gradientSettings.steps}</span>
          </div>
        </div>
      </div>
    )
  }

  if (tool === "noise") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Ruido</h4>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Densidad</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={noiseSettings.density}
              onValueChange={(value) => {
                const newSettings = { ...noiseSettings, density: value }
                setNoiseSettings(newSettings)
                onToolChange(newSettings)
              }}
              min={0.1}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12">{Math.round(noiseSettings.density * 100)}%</span>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Patrón</Label>
          <select
            value={noiseSettings.pattern}
            onChange={(e) => {
              const newSettings = { ...noiseSettings, pattern: e.target.value }
              setNoiseSettings(newSettings)
              onToolChange(newSettings)
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          >
            <option value="random">Aleatorio</option>
            <option value="perlin">Perlin</option>
            <option value="cellular">Celular</option>
            <option value="dots">Puntos</option>
          </select>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Colores</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {noiseSettings.colors.map((color, index) => (
              <Input
                key={index}
                type="color"
                value={color}
                onChange={(e) => {
                  const newColors = [...noiseSettings.colors]
                  newColors[index] = e.target.value
                  const newSettings = { ...noiseSettings, colors: newColors }
                  setNoiseSettings(newSettings)
                  onToolChange(newSettings)
                }}
                className="h-10"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tool === "mirror") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FlipHorizontal className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Espejo</h4>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Eje de simetría</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <PrimaryButton
              variant={mirrorSettings.axis === "horizontal" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                const newSettings = { ...mirrorSettings, axis: "horizontal" }
                setMirrorSettings(newSettings)
                onToolChange(newSettings)
              }}
            >
              Horizontal
            </PrimaryButton>
            <PrimaryButton
              variant={mirrorSettings.axis === "vertical" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                const newSettings = { ...mirrorSettings, axis: "vertical" }
                setMirrorSettings(newSettings)
                onToolChange(newSettings)
              }}
            >
              Vertical
            </PrimaryButton>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fromCenter"
            checked={mirrorSettings.fromCenter}
            onChange={(e) => {
              const newSettings = { ...mirrorSettings, fromCenter: e.target.checked }
              setMirrorSettings(newSettings)
              onToolChange(newSettings)
            }}
            className="rounded"
          />
          <Label htmlFor="fromCenter" className="text-sm text-gray-600">
            Desde el centro
          </Label>
        </div>
      </div>
    )
  }

  if (tool === "rotate") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <RotateCw className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Rotación</h4>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Ángulo</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={rotateSettings.angle}
              onValueChange={(value) => {
                const newSettings = { ...rotateSettings, angle: value }
                setRotateSettings(newSettings)
                onToolChange(newSettings)
              }}
              min={0}
              max={360}
              step={15}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12">{rotateSettings.angle}°</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[90, 180, 270, 360].map((angle) => (
            <PrimaryButton
              key={angle}
              variant="outline"
              size="sm"
              onClick={() => {
                const newSettings = { ...rotateSettings, angle }
                setRotateSettings(newSettings)
                onToolChange(newSettings)
              }}
            >
              {angle}°
            </PrimaryButton>
          ))}
        </div>
      </div>
    )
  }

  if (tool === "clone") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Copy className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Herramienta de Clonado</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-gray-600">Offset X</Label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={cloneSettings.offsetX}
                onValueChange={(value) => {
                  const newSettings = { ...cloneSettings, offsetX: value }
                  setCloneSettings(newSettings)
                  onToolChange(newSettings)
                }}
                min={-10}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-8">{cloneSettings.offsetX}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Offset Y</Label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={cloneSettings.offsetY}
                onValueChange={(value) => {
                  const newSettings = { ...cloneSettings, offsetY: value }
                  setCloneSettings(newSettings)
                  onToolChange(newSettings)
                }}
                min={-10}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-8">{cloneSettings.offsetY}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Opacidad</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={cloneSettings.opacity}
              onValueChange={(value) => {
                const newSettings = { ...cloneSettings, opacity: value }
                setCloneSettings(newSettings)
                onToolChange(newSettings)
              }}
              min={0.1}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12">{Math.round(cloneSettings.opacity * 100)}%</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

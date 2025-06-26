"use client"

import { AnimatePresence } from "framer-motion"
import { Crop, Expand, Maximize2, Move, RotateCcw } from "lucide-react"
import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"

interface CanvasResizerProps {
  currentWidth: number
  currentHeight: number
  onResize: (width: number, height: number, method: "stretch" | "crop" | "pad") => void
  showTitle?: boolean
}

export function CanvasResizer({ currentWidth, currentHeight, onResize,showTitle }: CanvasResizerProps) {
  const [newWidth, setNewWidth] = useState(currentWidth)
  const [newHeight, setNewHeight] = useState(currentHeight)
  const [resizeMethod, setResizeMethod] = useState<"stretch" | "crop" | "pad">("pad")
  const [maintainAspect, setMaintainAspect] = useState(true)

  const presets = [
    { name: "8x8", width: 8, height: 8 },
    { name: "16x16", width: 16, height: 16 },
    { name: "32x32", width: 32, height: 32 },
    { name: "64x64", width: 64, height: 64 },
    { name: "128x128", width: 128, height: 128 },
    { name: "16x32", width: 16, height: 32 },
    { name: "32x16", width: 32, height: 16 },
    { name: "64x32", width: 64, height: 32 },
    { name: "256x256", width: 256, height: 256 },
  ]

  const handleWidthChange = (width: number) => {
    setNewWidth(width)
    if (maintainAspect) {
      const aspectRatio = currentHeight / currentWidth
      setNewHeight(Math.round(width * aspectRatio))
    }
  }

  const handleHeightChange = (height: number) => {
    setNewHeight(height)
    if (maintainAspect) {
      const aspectRatio = currentWidth / currentHeight
      setNewWidth(Math.round(height * aspectRatio))
    }
  }

  const handleResize = () => {
    onResize(newWidth, newHeight, resizeMethod)
  }

  return (
    <AnimatePresence>
        {(showTitle && (

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-800">Redimensionar Canvas</h3>
                </div>
              </div>
        ))}

              {/* Tamaño actual */}
              <div className="p-4 bg-purple-50/50 backdrop-blur-sm rounded-xl mb-6 border border-purple-200/30">
                <p className="text-sm text-gray-600 mb-1">Tamaño actual</p>
                <p className="font-bold text-gray-800">
                  {currentWidth} × {currentHeight} píxeles
                </p>
              </div>

              {/* Presets */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Tamaños predefinidos</label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      size="sm"
                      onClick={() => {
                        setNewWidth(preset.width)
                        setNewHeight(preset.height)
                      }}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tamaño personalizado */}
              <div className="space-y-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Tamaño personalizado</label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="width" className="text-xs text-gray-600">
                      Ancho
                    </label>
                    <Input
                      id="width"
                      type="number"
                      value={newWidth}
                      onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 1)}
                      min={1}
                      max={512}
                      className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="text-xs text-gray-600">
                      Alto
                    </label>
                    <Input
                      id="height"
                      type="number"
                      value={newHeight}
                      onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 1)}
                      min={1}
                      max={512}
                      className="mt-1 bg-white/20 backdrop-blur-sm border border-white/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aspect"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="aspect" className="text-sm text-gray-600">
                    Mantener proporción
                  </label>
                </div>
              </div>

              {/* Método de redimensionado */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Método de redimensionado</label>
                <div className="space-y-2">
                  {[
                    { value: "pad", label: "Rellenar", desc: "Añade píxeles transparentes", icon: Expand },
                    { value: "crop", label: "Recortar", desc: "Corta el contenido sobrante", icon: Crop },
                    { value: "stretch", label: "Estirar", desc: "Escala el contenido existente", icon: Move },
                  ].map((method) => (
                    <div
                      key={method.value}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        resizeMethod === method.value
                          ? "bg-purple-100/50 backdrop-blur-sm border border-purple-300/50"
                          : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                      }`}
                      onClick={() => setResizeMethod(method.value as any)}
                    >
                      <input
                        type="radio"
                        id={method.value}
                        name="resizeMethod"
                        value={method.value}
                        checked={resizeMethod === method.value}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <method.icon className="w-4 h-4 text-gray-600" />
                      <div>
                        <label htmlFor={method.value} className="text-sm font-medium text-gray-700 cursor-pointer">
                          {method.label}
                        </label>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={handleResize}
                  disabled={newWidth === currentWidth && newHeight === currentHeight}
                  className="flex-1"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Aplicar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setNewWidth(currentWidth)
                    setNewHeight(currentHeight)
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
      
    </AnimatePresence>
  )
}

"use client"

import { useLanguage } from "@/lib/language"
import { LayoutGrid, Maximize2, RotateCcw, Settings } from "lucide-react"
import { useState } from "react"
import { GlassButton } from "./GlassButton"
import { PrimaryButton } from "./PrimaryButton"
import { Input } from "./input"

interface CanvasSettingsProps {
  currentWidth: number
  currentHeight: number
  onResize: (width: number, height: number, method: "stretch" | "crop" | "pad") => void
  showGrid: boolean
  onToggleGrid: () => void
  isDesktop?: boolean
}

export function CanvasSettings({ currentWidth, currentHeight, onResize, showGrid, onToggleGrid, isDesktop = false }: CanvasSettingsProps) {
  const { t } = useLanguage()
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
    <div className="space-y-6">
      {(!isDesktop) && (

      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="font-bold text-gray-800">{t("editor.panelContent.canvasSettings.title")}</h3>
      </div>
      )}

      {/* Tamaño actual */}
      <div className="p-4 bg-purple-50 rounded-xl">
        <p className="text-sm text-gray-600 mb-1">{t("editor.panelContent.canvasSettings.currentSize")}</p>
        <p className="font-bold text-gray-800">
          {t("editor.panelContent.canvasSettings.pixelSize", { 
            width: String(currentWidth), 
            height: String(currentHeight) 
          })}
        </p>
      </div>

      {/* Presets */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">{t("editor.panelContent.canvasSettings.presets")}</label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <PrimaryButton
              key={preset.name}
              variant="outline"
              size="md"
              onClick={() => {
              setNewWidth(preset.width)
              setNewHeight(preset.height)
              }}
              className="text-xs flex items-center justify-center h-8 w-full whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {preset.name}
            </PrimaryButton>
          ))}
        </div>
      </div>

      {/* Tamaño personalizado */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">{t("editor.panelContent.canvasSettings.customSize")}</label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="width" className="text-xs text-gray-600">
              {t("editor.panelContent.canvasSettings.width")}
            </label>
            <Input
              id="width"
              type="number"
              value={newWidth}
              onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 1)}
              min={1}
              max={512}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="height" className="text-xs text-gray-600">
              {t("editor.panelContent.canvasSettings.height")}
            </label>
            <Input
              id="height"
              type="number"
              value={newHeight}
              onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 1)}
              min={1}
              max={512}
              className="mt-1"
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
            {t("editor.panelContent.canvasSettings.maintainAspect")}
          </label>
        </div>
      </div>

      {/* Método de redimensionado */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">{t("editor.panelContent.canvasSettings.resizeMethod")}</label>
        <div className="space-y-2">
          {[
            { value: "pad", label: t("editor.panelContent.canvasSettings.pad"), desc: t("editor.panelContent.canvasSettings.padDescription") },
            { value: "crop", label: t("editor.panelContent.canvasSettings.crop"), desc: t("editor.panelContent.canvasSettings.cropDescription") },
            { value: "stretch", label: t("editor.panelContent.canvasSettings.stretch"), desc: t("editor.panelContent.canvasSettings.stretchDescription") },
          ].map((method) => (
            <div key={method.value} className="flex items-center gap-3">
              <input
                type="radio"
                id={method.value}
                name="resizeMethod"
                value={method.value}
                checked={resizeMethod === method.value}
                onChange={(e) => setResizeMethod(e.target.value as any)}
                className="rounded"
              />
              <div>
                <label htmlFor={method.value} className="text-sm font-medium text-gray-700">
                  {method.label}
                </label>
                <p className="text-xs text-gray-500">{method.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className={`flex ${isDesktop ? "flex-col space-y-2" : "gap-2"}`}>
        <PrimaryButton
          onClick={handleResize}
          disabled={newWidth === currentWidth && newHeight === currentHeight}
          className={`flex-1 ${isDesktop ? "text-sm h-8" : ""}`}
          icon={Maximize2}
        >
          {t("editor.panelContent.canvasSettings.applyChanges")}
        </PrimaryButton>
        <PrimaryButton
          variant="outline"
          onClick={() => {
        setNewWidth(currentWidth)
        setNewHeight(currentHeight)
          }}
          className={isDesktop ? "text-sm h-8" : ""}
          icon={RotateCcw}
        >
          {t("editor.panelContent.canvasSettings.reset")}
        </PrimaryButton>
      </div>

      {/* Configuración de Grid */}
      <div className="flex items-center gap-2 flex-wrap">
        <GlassButton
          active={showGrid}
          size="sm"
          onClick={onToggleGrid}
          icon={LayoutGrid}
          className="flex-1 sm:flex-none"
        >
          {t("editor.panelContent.canvasSettings.grid")}
        </GlassButton>
      </div>
    </div>
  )
}

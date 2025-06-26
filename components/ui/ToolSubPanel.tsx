"use client"

import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import {
  BoxIcon as Bucket, ChevronDown, ChevronUp, Circle, Eraser, FlipHorizontal, Lasso,
  Minus,
  MousePointer,
  Move, Palette, Pencil,
  Pipette,
  RectangleHorizontal,
  RotateCw,
  Scale, Sparkles, SprayCanIcon as Spray, Square, Type, Wand2, Zap
} from "lucide-react"
import { createElement, useMemo, useState } from "react"
import { Bubble, BubbleSidebar } from "../BubbleSidebar"
import { ToolType } from "../editor/ToolPanel"
import { GlassButton } from "./GlassButton"
import { GlassCard } from "./GlassCard"
import { Input } from "./input"
import { Slider } from "./slider"

interface ToolSubPanelProps {
  activeTool: string
  toolSettings: any
  onSettingsChange: (settings: any) => void
  className?: string
  variant?: "default" | "compact"
}

export function ToolSubPanel({ activeTool, toolSettings, onSettingsChange, className = "", variant = "default" }: ToolSubPanelProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(true)

  const renderShapeSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">{t("editor.settings.shapeSettings")}</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GlassButton
          active={!toolSettings.filled}
          size="sm"
          onClick={() => onSettingsChange({ ...toolSettings, filled: false })}
        >
          {t("editor.settings.outline")}
        </GlassButton>
        <GlassButton
          active={toolSettings.filled}
          size="sm"
          onClick={() => onSettingsChange({ ...toolSettings, filled: true })}
        >
          {t("editor.settings.filled")}
        </GlassButton>
      </div>

      <div>
        <label className="text-sm text-gray-600">{t("editor.settings.strokeWidth")}</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.strokeWidth || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, strokeWidth: value })}
            min={1}
            max={5}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-8">{toolSettings.strokeWidth || 1}</span>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">{t("editor.settings.opacity")}</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.opacity || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, opacity: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={Math.round((toolSettings.opacity || 1) * 255)}
              onChange={(e) => {
                const percent = parseInt(e.target.value) || 255
                const opacity = Math.max(0, Math.min(255, percent)) / 255
                onSettingsChange({ ...toolSettings, opacity })
              }}
              min={0}
              max={255}
              className="w-16 h-8 text-xs text-center"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGradientSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">{t("editor.settings.gradientSettings")}</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">{t("editor.settings.startColor")}</label>
          <Input
            type="color"
            value={toolSettings.startColor || "#A678FF"}
            onChange={(e) => onSettingsChange({ ...toolSettings, startColor: e.target.value })}
            className="mt-1 h-10"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">{t("editor.settings.endColor")}</label>
          <Input
            type="color"
            value={toolSettings.endColor || "#FFB6A6"}
            onChange={(e) => onSettingsChange({ ...toolSettings, endColor: e.target.value })}
            className="mt-1 h-10"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">{t("editor.settings.gradientType")}</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <GlassButton
            active={toolSettings.gradientType === "linear"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, gradientType: "linear" })}
          >
            {t("editor.settings.linear")}
          </GlassButton>
          <GlassButton
            active={toolSettings.gradientType === "radial"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, gradientType: "radial" })}
          >
            {t("editor.settings.radial")}
          </GlassButton>
        </div>
      </div>
    </div>
  )

  const renderTextSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">{t("editor.settings.textSettings")}</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">{t("editor.settings.text")}</label>
        <Input
          value={toolSettings.text || t("editor.settings.text")}
          onChange={(e) => onSettingsChange({ ...toolSettings, text: e.target.value })}
          className="mt-1"
          placeholder={t("editor.settings.textPlaceholder")}
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">{t("editor.settings.fontSize")}</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.fontSize || 8}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, fontSize: value })}
            min={4}
            max={32}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-8">{toolSettings.fontSize || 8}px</span>
        </div>
      </div>
    </div>
  )

  const renderSpraySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Spray</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Densidad</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.density || 0.3}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, density: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-12">
            {Math.round((toolSettings.density || 0.3) * 100)}%
          </span>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">Radio</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.radius || 5}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, radius: value })}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-8">{toolSettings.radius || 5}</span>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">Opacidad</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.opacity || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, opacity: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={Math.round((toolSettings.opacity || 1) * 255)}
              onChange={(e) => {
                const percent = parseInt(e.target.value) || 255
                const opacity = Math.max(0, Math.min(255, percent)) / 255
                onSettingsChange({ ...toolSettings, opacity })
              }}
              min={0}
              max={255}
              className="w-16 h-8 text-xs text-center"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMirrorSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlipHorizontal className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Espejo</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Eje de simetría</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <GlassButton
            active={toolSettings.axis === "horizontal"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, axis: "horizontal" })}
          >
            Horizontal
          </GlassButton>
          <GlassButton
            active={toolSettings.axis === "vertical"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, axis: "vertical" })}
          >
            Vertical
          </GlassButton>
        </div>
      </div>
    </div>
  )

  const renderBrushSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Pincel</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Tamaño</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.size || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, size: value })}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-8">{toolSettings.size || 1}</span>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600">Opacidad</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.opacity || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, opacity: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={Math.round((toolSettings.opacity || 1) * 255)}
              onChange={(e) => {
                const percent = parseInt(e.target.value) || 255
                const opacity = Math.max(0, Math.min(255, percent)) / 255
                onSettingsChange({ ...toolSettings, opacity })
              }}
              min={0}
              max={255}
              className="w-16 h-8 text-xs text-center"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNoiseSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Ruido</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Densidad</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.density || 0.5}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, density: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-700 w-12">
            {Math.round((toolSettings.density || 0.5) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )

  const renderBucketSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Relleno</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Opacidad</label>
        <div className="flex items-center gap-3 mt-2">
          <Slider
            value={toolSettings.opacity || 1}
            onValueChange={(value) => onSettingsChange({ ...toolSettings, opacity: value })}
            min={0.0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={Math.round((toolSettings.opacity || 1) * 255)}
              onChange={(e) => {
                const percent = parseInt(e.target.value) || 255
                const opacity = Math.max(0, Math.min(255, percent)) / 255
                onSettingsChange({ ...toolSettings, opacity })
              }}
              min={0}
              max={255}
              className="w-16 h-8 text-xs text-center"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRotationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Rotación</h4>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p><strong>Instrucciones:</strong></p>
        <p>• Primero selecciona píxeles con la herramienta de selección</p>
        <p>• Haz clic y arrastra para rotar alrededor del centro</p>
        <p>• La rotación se aplica en tiempo real</p>
      </div>
    </div>
  )

  const renderScaleSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Escala</h4>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p><strong>Instrucciones:</strong></p>
        <p>• Primero selecciona píxeles con la herramienta de selección</p>
        <p>• Haz clic cerca del centro y arrastra hacia afuera para agrandar</p>
        <p>• Arrastra hacia adentro para reducir</p>
        <p>• La escala se aplica desde el centro de la selección</p>
      </div>
    </div>
  )

  const renderMoveSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Configuración de Movimiento</h4>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p><strong>Instrucciones:</strong></p>
        <p>• Primero selecciona píxeles con la herramienta de selección</p>
        <p>• Haz clic y arrastra para mover la selección</p>
        <p>• Los píxeles se mueven en tiempo real</p>
      </div>
    </div>
  )

  const renderColorReplaceSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Reemplazo de Color</h4>
      </div>

      <div>
        <label className="text-sm text-gray-600">Modo de operación</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <GlassButton
            active={toolSettings.mode === "specific"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, mode: "specific" })}
          >
            Específico
          </GlassButton>
          <GlassButton
            active={toolSettings.mode === "hue-shift"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, mode: "hue-shift" })}
          >
            Matiz
          </GlassButton>
          <GlassButton
            active={toolSettings.mode === "palette-replace"}
            size="sm"
            onClick={() => onSettingsChange({ ...toolSettings, mode: "palette-replace" })}
          >
            Paleta
          </GlassButton>
        </div>
      </div>

      {toolSettings.mode === "specific" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Color objetivo</label>
              <Input
                type="color"
                value={toolSettings.targetColor || "#000000"}
                onChange={(e) => onSettingsChange({ ...toolSettings, targetColor: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nuevo color</label>
              <Input
                type="color"
                value={toolSettings.newColor || "#FFFFFF"}
                onChange={(e) => onSettingsChange({ ...toolSettings, newColor: e.target.value })}
                className="mt-1 h-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Tolerancia</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={toolSettings.tolerance || 0}
                onValueChange={(value) => onSettingsChange({ ...toolSettings, tolerance: value })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{toolSettings.tolerance || 0}%</span>
            </div>
          </div>
        </>
      )}

      {toolSettings.mode === "hue-shift" && (
        <>
          <div>
            <label className="text-sm text-gray-600">Desplazamiento de matiz</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={toolSettings.hueShift || 0}
                onValueChange={(value) => onSettingsChange({ ...toolSettings, hueShift: value })}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{toolSettings.hueShift || 0}°</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Ajuste de saturación</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={toolSettings.saturationAdjust || 0}
                onValueChange={(value) => onSettingsChange({ ...toolSettings, saturationAdjust: value })}
                min={-1}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">
                {Math.round((toolSettings.saturationAdjust || 0) * 100)}%
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Ajuste de luminosidad</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={toolSettings.lightnessAdjust || 0}
                onValueChange={(value) => onSettingsChange({ ...toolSettings, lightnessAdjust: value })}
                min={-1}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">
                {Math.round((toolSettings.lightnessAdjust || 0) * 100)}%
              </span>
            </div>
          </div>
        </>
      )}

      {toolSettings.mode === "palette-replace" && (
        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <p><strong>Modo Paleta:</strong></p>
          <p>• Selecciona colores de la paleta actual</p>
          <p>• Elige nuevos colores de reemplazo</p>
          <p>• Se aplicará automáticamente a toda la imagen</p>
        </div>
      )}

      <div className="pt-2 border-t">
        <GlassButton
          onClick={() => onSettingsChange({ ...toolSettings, apply: true })}
          className="w-full"
        >
          Aplicar Reemplazo
        </GlassButton>
      </div>
    </div>
  )

  const getSettingsContent = () => {
    switch (activeTool) {
      case "rectangle":
      case "circle":
      case "ellipse":
        return renderShapeSettings()
      case "gradient":
        return renderGradientSettings()
      case "text":
        return renderTextSettings()
      case "spray":
        return renderSpraySettings()
      case "mirror":
        return renderMirrorSettings()
      case "noise":
        return renderNoiseSettings()
      case "bucket":
        return renderBucketSettings()
      case "pencil":
      case "eraser":
      case "line":
        return renderBrushSettings()
      case "rotate":
        return renderRotationSettings()
      case "scale":
        return renderScaleSettings()
      case "move":
        return renderMoveSettings()
      case "color-replace":
        return renderColorReplaceSettings()
      default:
        return null
    }
  }

  const settingsContent = useMemo(() => getSettingsContent(), [activeTool, toolSettings])

  // Función para obtener el color de la categoría de la herramienta activa
  const getActiveToolColor = () => {
    const basicTools = ["pencil", "eraser", "bucket", "eyedropper"];
    const shapeTools = ["line", "rectangle", "circle", "ellipse"];
    const artisticTools = ["spray", "gradient"];
    const selectionTools = ["select", "border-select", "magic-wand", "move", "rotate", "scale"];
    const advancedTools = ["text", "noise", "mirror", "color-replace"];

    if (basicTools.includes(activeTool)) return "text-blue-600";
    if (shapeTools.includes(activeTool)) return "text-green-600";
    if (artisticTools.includes(activeTool)) return "text-orange-600";
    if (selectionTools.includes(activeTool)) return "text-purple-600";
    if (advancedTools.includes(activeTool)) return "text-red-600";
    return "text-gray-600";
  };
  
  const tools = [
    { tool: "pencil" as ToolType, icon: Pencil, tooltip: t("editor.tools.pencil"), category: "basic" },
    { tool: "eraser" as ToolType, icon: Eraser, tooltip: t("editor.tools.eraser"), category: "basic" },
    { tool: "bucket" as ToolType, icon: Bucket, tooltip: t("editor.tools.bucket"), category: "basic" },
    { tool: "eyedropper" as ToolType, icon: Pipette, tooltip: t("editor.tools.eyedropper"), category: "basic" },
    { tool: "line" as ToolType, icon: Minus, tooltip: t("editor.tools.line"), category: "shapes" },
    { tool: "rectangle" as ToolType, icon: RectangleHorizontal, tooltip: t("editor.tools.rectangle"), category: "shapes" },
    { tool: "circle" as ToolType, icon: Circle, tooltip: t("editor.tools.circle"), category: "shapes" },
    { tool: "ellipse" as ToolType, icon: Circle, tooltip: t("editor.tools.ellipse"), category: "shapes" },
    { tool: "spray" as ToolType, icon: Spray, tooltip: t("editor.tools.spray"), category: "artistic" },
    { tool: "gradient" as ToolType, icon: Zap, tooltip: t("editor.tools.gradient"), category: "artistic" },
    { tool: "select" as ToolType, icon: MousePointer, tooltip: t("editor.tools.select"), category: "selection" },
    { tool: "border-select" as ToolType, icon: Lasso, tooltip: t("editor.tools.border-select"), category: "selection" },
    { tool: "magic-wand" as ToolType, icon: Wand2, tooltip: t("editor.tools.magic-wand"), category: "selection" },
    { tool: "move" as ToolType, icon: Move, tooltip: t("editor.tools.move"), category: "selection" },
    { tool: "rotate" as ToolType, icon: RotateCw, tooltip: t("editor.tools.rotate"), category: "selection" },
    { tool: "scale" as ToolType, icon: Scale, tooltip: t("editor.tools.scale"), category: "selection" },
    { tool: "text" as ToolType, icon: Type, tooltip: t("editor.tools.text"), category: "advanced" },
    { tool: "noise" as ToolType, icon: Sparkles, tooltip: t("editor.tools.noise"), category: "advanced" },
    { tool: "mirror" as ToolType, icon: FlipHorizontal, tooltip: t("editor.tools.mirror"), category: "advanced" },
    { tool: "color-replace" as ToolType, icon: Palette, tooltip: t("editor.tools.color-replace"), category: "advanced" },
  ]

  if (!settingsContent) return null

  if(variant === "compact") {
    const Icon = tools.find(t => t.tool === activeTool)?.icon || Circle;

    return (
            <AnimatePresence key={"tool-subpanel-bubble"}>
<BubbleSidebar align="left">

            <Bubble bubbleKey={activeTool} variant="glass">
              <Bubble.Icon variant="glass">
                {createElement(Icon, { className: `w-5 h-5 ${getActiveToolColor()}` })}
              </Bubble.Icon>
              <Bubble.Content width="medium">
                <Bubble.Body>
                  <Bubble.Item hover={false} padding={false}>
                    {settingsContent}
                  </Bubble.Item>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>

            </BubbleSidebar>

            </AnimatePresence>)

  }

  return (
    <GlassCard className={`${className}`} intensity="medium">
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-semibold text-gray-800">Configuración de Herramienta</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              {settingsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

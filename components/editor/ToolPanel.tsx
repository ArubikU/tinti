"use client"

import { useLanguage } from "@/lib/language"
import React from "react"

import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import {
  BoxIcon as Bucket,
  Circle,
  Eraser,
  FlipHorizontal,
  Lasso,
  Minus,
  MousePointer,
  Move,
  Palette,
  Pencil,
  Pipette,
  RectangleHorizontal,
  RotateCw,
  Scale,
  Sparkles,
  SprayCanIcon as Spray,
  Type,
  Wand2,
  Zap,
} from "lucide-react"
import { Bubble, BubbleSidebar } from "../BubbleSidebar"

export type ToolType =
  | "pencil"
  | "eraser"
  | "bucket"
  | "eyedropper"
  | "circle"
  | "ellipse"
  | "spray"
  | "line"
  | "rectangle"
  | "move"
  | "select"
  | "border-select"
  | "magic-wand"
  | "rotate"
  | "scale"
  | "text"
  | "gradient"
  | "noise"
  | "mirror"
  | "color-replace"

interface ToolPanelProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  className?: string
  isMobile?: boolean
  variant?: "default" | "compact"
}

export function ToolPanel({ activeTool, onToolChange, className = "", isMobile = false, variant = "compact" }: ToolPanelProps) {
  const { t } = useLanguage()

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
  if (isMobile) {
    return (
      <div className="grid grid-cols-4 gap-3 p-4">
        {tools.map(({ tool, icon, tooltip }) => (
          <GlassButton
            key={tool}
            onClick={() => onToolChange(tool)}
            active={activeTool === tool}
            className="aspect-square flex-col text-xs p-3"
            size="sm"
          >
            {React.createElement(icon, { size: 48 })}
            <span className="mt-1 text-xs">{tooltip}</span>
          </GlassButton>
        ))}
      </div>
    )
  }

  const categories = {
    basic: tools.filter((t) => t.category === "basic"),
    shapes: tools.filter((t) => t.category === "shapes"),
    artistic: tools.filter((t) => t.category === "artistic"),
    selection: tools.filter((t) => t.category === "selection"),
    advanced: tools.filter((t) => t.category === "advanced"),
  }

  const categoryNames = {
    basic: t("editor.categories.basic"),
    shapes: t("editor.categories.shapes"),
    artistic: t("editor.categories.artistic"),
    selection: t("editor.categories.selection"),
    advanced: t("editor.categories.advanced"),
  }

  if (variant === "compact") {
    const categoryIcons = {
      basic: Pencil,
      shapes: RectangleHorizontal,
      artistic: Spray,
      selection: MousePointer,
      advanced: Palette,
    }
    const categoryColors = {
      basic: "text-blue-600",
      shapes: "text-green-600",
      artistic: "text-purple-600",
      selection: "text-yellow-600",
      advanced: "text-red-600",
    }
    return (
      <div className="w-full ">
        <BubbleSidebar align="left">
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <Bubble bubbleKey={category} key={category} variant={"glass"}>

              <Bubble.Icon >
                {React.createElement(Icon, { size: 20, className: categoryColors[category as keyof typeof categoryColors] })}
              </Bubble.Icon>
              <Bubble.Content width="medium" variant="glass">
                <Bubble.Body >
                  {tools.filter(tool => tool.category === category).map(({ tool, icon, tooltip }) => (
                    <Bubble.Item
                      icon={icon}
                      onClick={() => onToolChange(tool)}
                      closeOnClick={true}
                      hover={true}
                      variant="glass"
                    >{tooltip}</Bubble.Item>
                  ))}
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>
          ))}
        </BubbleSidebar>

      </div>


    )

  }

  return (
    <GlassCard className={`p-4 ${className}`} intensity="medium">
      <div className="space-y-4">
        {Object.entries(categories).map(([category, categoryTools]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {categoryNames[category as keyof typeof categoryNames]}
            </h4>
            <div className="space-y-2">
              {categoryTools.map(({ tool, icon, tooltip }) => (
                <GlassButton
                  key={tool}
                  onClick={() => onToolChange(tool)}
                  active={(activeTool === tool)}
                  className={`flex items-center justify-center space-x-2 w-full p-2 ${activeTool === tool ? "bg-purple-100 text-purple-700 border-purple-200" : "hover:bg-gray-50"
                    }`}
                  size="sm"
                >
                  {React.createElement(icon, { size: 20 })}
                  <span className="ml-2">{tooltip}</span>
                </GlassButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

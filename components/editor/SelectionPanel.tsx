"use client"

import { EditorPanel } from "@/components/ui/EditorPanel"
import { VanillaSlider as Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/language"
import { Square } from "lucide-react"

interface SelectionPanelProps {
  selectedPixels: Record<string, string>
  clipboard: Record<string, string>  
  selectionBounds?: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null
  showSelectionPreview: boolean
  onToggleSelectionPreview: () => void
  currentTool: string
  magicWandTolerance: number
  onMagicWandToleranceChange: (value: number) => void
  className?: string
  isMobile?: boolean
  isVisible?: boolean
  onVisibilityToggle?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export function SelectionPanel({
  selectedPixels,
  clipboard,
  selectionBounds,
  showSelectionPreview,
  onToggleSelectionPreview,
  currentTool,
  magicWandTolerance,
  onMagicWandToleranceChange,
  className = "",
  isMobile = false,
  isVisible = true,
  onVisibilityToggle,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: SelectionPanelProps) {
  const { t } = useLanguage()
  const hasSelection = Object.keys(selectedPixels).length > 0
  const hasClipboard = Object.keys(clipboard).length > 0

  // Only show panel if there's selection/clipboard data or magic wand tool is active
  const shouldShow = hasSelection || hasClipboard || currentTool === "magic-wand"

  if (!shouldShow || !isVisible) {
    return null
  }


  return (
    <EditorPanel
      title={t("editor.panels.selection")}
      icon={Square}
      className={className}
      isCollapsible={true}
      defaultCollapsed={false}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      isMobile={isMobile}
    >
      <div className="space-y-3">
        {/* Selection Preview Toggle 
        {(hasSelection || hasClipboard) && (
          
          <div className="flex items-center justify-between">

            

            <span className="text-xs text-gray-600">Preview de selección</span>
            <button
              onClick={onToggleSelectionPreview}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showSelectionPreview ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        )}*/}
        
        {/* Selection Info */}
        {hasSelection && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              {Object.keys(selectedPixels).length} {t("editor.panelContent.selection.pixelsSelected")}
            </p>
            {selectionBounds && (
              <p className="text-xs text-gray-500">
                {t("editor.panelContent.selection.size", {
                  width: String(selectionBounds.maxX - selectionBounds.minX + 1),
                  height: String(selectionBounds.maxY - selectionBounds.minY + 1)
                })}
              </p>
            )}
          </div>
        )}
        
        {/* Clipboard Info */}
        {hasClipboard && (
          <p className="text-xs text-gray-600">
            {Object.keys(clipboard).length} {t("editor.panelContent.selection.pixelsInClipboard")}
          </p>
        )}
        
        {/* Magic Wand Tool Controls */}
        {currentTool === "magic-wand" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{t("editor.panelContent.selection.tolerance")}</span>
              <span className="text-xs text-gray-500">{magicWandTolerance}</span>
            </div>            <Slider
              value={magicWandTolerance}
              onValueChange={(value) => onMagicWandToleranceChange(value)}
              min={0}
              max={255}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>
    </EditorPanel>
  )
}

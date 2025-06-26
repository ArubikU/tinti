"use client"

import { CircleColor } from "@/components/ui/CircleColor"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import { useState } from "react"

interface ColorPanelProps {
  currentColor: string
  onColorChange: (color: string) => void
  colorPalette: string[]
  onPaletteChange?: (palette: string[]) => void
  showGrid?: boolean
  onToggleGrid?: () => void
  onRandomColor?: () => void
  className?: string
  isMobile?: boolean
}

export function ColorPanel({
  currentColor,
  onColorChange,
  colorPalette,
  onPaletteChange,
  showGrid,
  onToggleGrid,
  onRandomColor,
  className = "",
  isMobile = false,
}: ColorPanelProps) {
  const { t } = useLanguage()
  const [showAllColors, setShowAllColors] = useState(false)
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null)
  const [tempColor, setTempColor] = useState<string>("")

  const generateRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98FB98",
      "#F0E68C",
      "#FFB347",
      "#A678FF",
      "#FFB6A6",
      "#A9FBD7",
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    onColorChange(randomColor)
    onRandomColor?.()
  }

  // Editar un color específico de la paleta
  const startEditingColor = (index: number) => {
    setEditingColorIndex(index)
    setTempColor(colorPalette[index])
  }

  const saveColorEdit = () => {
    if (editingColorIndex !== null && tempColor && onPaletteChange) {
      const newPalette = [...colorPalette]
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

  return (
    <div className={className}>
      <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">{t("editor.panelContent.colors.currentColor")}</h3>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/50 shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1">
          <Input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-10 sm:h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30"
          />
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-mono">{currentColor}</p>
        </div>
      </div>


      <div className="mb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{t("editor.panelContent.colors.colorPalette")}</span>
        </div>

        <motion.div
          className={`grid ${isMobile ? "grid-cols-8" : "grid-cols-6"} gap-2`}
          initial={{ height: isMobile ? "auto" : "80px", opacity: 0 }}
          animate={{
            height: showAllColors ? "auto" : isMobile ? "auto" : "80px",
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {colorPalette
            .slice(0, showAllColors ? colorPalette.length : isMobile ? 16 : 12)
            .map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
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
                        className="w-3 h-3 flex items-center justify-center bg-green-500 text-white rounded text-xs"
                        title={t("editor.panelContent.colors.save")}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelColorEdit}
                        className="w-3 h-3 flex items-center justify-center bg-red-500 text-white rounded text-xs"
                        title={t("editor.panelContent.colors.cancel")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CircleColor
                      hex={color}
                      onSelect={() => onColorChange(color)}
                      isSelected={currentColor === color}
                      size="sm"
                    />
                    {onPaletteChange && (
                      <button
                        onClick={() => startEditingColor(index)}
                        onDoubleClick={() => startEditingColor(index)}
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        title={t("editor.panelContent.colors.editColor")}
                      >
                        ✎
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            ))}
        </motion.div>
        
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowAllColors(!showAllColors)}
            className="text-sm text-blue-500 hover:underline"
          >
            {showAllColors ? t("editor.panelContent.colors.showLess") : t("editor.panelContent.colors.showMore")}
          </button>
        </div>
      </div>

    </div>
  )
}

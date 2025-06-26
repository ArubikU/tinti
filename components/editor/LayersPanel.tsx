"use client"

import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { VanillaSlider as Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/language"
import type { Layer } from "@/lib/pixel-engine"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import React, { useCallback, useState } from "react"

interface LayersPanelProps {
  layers: Layer[]
  activeLayer: number
  onLayerSelect: (index: number) => void
  onLayerAdd: () => void
  onLayerDelete: (index: number) => void
  onLayerToggleVisibility: (index: number) => void
  onLayerDuplicate?: (index: number) => void
  onLayerMove?: (index: number, direction: "up" | "down") => void
  onLayerOpacityChange?: (index: number, opacity: number) => void
  onLayerRename?: (index: number, name: string) => void
  showOnionSkin: boolean
  onionSkinOpacity: number
  onToggleOnionSkin: () => void
  onOnionSkinOpacityChange: (opacity: number) => void
  className?: string
  isMobile?: boolean
}

const LayersPanel = React.memo(function LayersPanel({
  layers,
  activeLayer,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerToggleVisibility,
  onLayerDuplicate,
  onLayerMove,
  onLayerOpacityChange,
  showOnionSkin,
  onionSkinOpacity,
  onToggleOnionSkin,
  onOnionSkinOpacityChange,
  onLayerRename,
  className = "",
  isMobile = false,
}: LayersPanelProps) {
  const { t } = useLanguage()
  const [editingLayerIndex, setEditingLayerIndex] = useState<number | null>(null)
  const [newLayerName, setNewLayerName] = useState<string>("")

  // Stable handler for onion skin opacity slider
  const handleOnionSkinSliderChange = useCallback((value: number) => {
    onOnionSkinOpacityChange(value)
  }, [onOnionSkinOpacityChange])

  // Stable handler for layer opacity slider - memoized per layer
  const handleLayerOpacitySliderChange = useCallback((index: number) => {
    return (value: number[]) => {
      if (onLayerOpacityChange) {
        onLayerOpacityChange(index, value[0])
      }
    }
  }, [onLayerOpacityChange])

  return (
    <div className={`flex-1 min-h-0 relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
            {layers.length}
          </span>
        </div>
        <GlassButton variant="glass" size="sm" onClick={onLayerAdd} icon={Plus}>
          {isMobile ? "" : t("editor.panelContent.layers.newLayer")}
        </GlassButton>
      </div>

      {/* Onion Skin */}
      <GlassCard className="mb-4 sm:mb-6 p-3 sm:p-4 relative z-10" intensity="light">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-medium text-gray-700">{t("editor.panelContent.layers.onionSkin")}</span>
          <GlassButton active={showOnionSkin} size="sm" onClick={onToggleOnionSkin} icon={showOnionSkin ? Eye : EyeOff}>
            {showOnionSkin ? t("editor.panelContent.layers.on") : t("editor.panelContent.layers.off")}
          </GlassButton>
        </div>
        <AnimatePresence>
          {showOnionSkin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <Slider
                  value={onionSkinOpacity}
                  onValueChange={(value) => handleOnionSkinSliderChange(value)}
                  min={0.1}
                  max={0.8}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>{Math.round(onionSkinOpacity * 100)}%</span>
                  <span>80%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <div className="space-y-2 overflow-y-auto flex-1 relative">
        <AnimatePresence>
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 z-10 ${
                activeLayer === index
                  ? "bg-gradient-to-r from-[#A678FF]/20 to-[#FFB6A6]/20 backdrop-blur-md border border-[#A678FF]/30 shadow-lg"
                  : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              }`}
              onClick={() => onLayerSelect(index)}
              style={{
                boxShadow:
                  activeLayer === index
                    ? "0 8px 32px rgba(166, 120, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

              <div className="relative flex items-center gap-3 p-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onLayerToggleVisibility(index)
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4 text-gray-700" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  {editingLayerIndex === index ? (
                    <input
                      type="text"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      onBlur={() => {
                        if (onLayerRename) {
                          onLayerRename(index, newLayerName)
                        }
                        setEditingLayerIndex(null)
                      }}
                      className="text-sm font-medium block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  ) : (
                    <span
                      className={`text-sm font-medium truncate block ${
                        activeLayer === index ? "text-gray-800" : "text-gray-700"
                      }`}
                      onDoubleClick={() => {
                        setEditingLayerIndex(index)
                        setNewLayerName(layer.name)
                      }}
                    >
                      {layer.name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-500">{t("editor.panelContent.layers.opacity", { percentage: String(Math.round(layer.opacity * 100)) })}</div>
                    <div className="text-xs text-gray-500">{t("editor.panelContent.layers.pixelsCount", { count: String(Object.keys(layer.pixels).length) })}</div>
                  </div>
                </div>

                {/* Layer controls - visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                  {onLayerMove && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onLayerMove(index, "up")
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                        disabled={index === layers.length - 1}
                      >
                        <ArrowUp className="w-3 h-3 text-gray-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onLayerMove(index, "down")
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                        disabled={index === 0}
                      >
                        <ArrowDown className="w-3 h-3 text-gray-600" />
                      </motion.button>
                    </>
                  )}

                  {onLayerDuplicate && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onLayerDuplicate(index)
                      }}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                    >
                      <Copy className="w-3 h-3 text-blue-600" />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerDelete(index)
                    }}
                    className="w-6 h-6 rounded-md flex items-center justify-center bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 transition-all"
                    disabled={layers.length <= 1}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </motion.button>
                </div>
              </div>

              {/* Layer opacity slider - only for active layer */}
              {activeLayer === index && onLayerOpacityChange && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-3 pb-3 relative z-10"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{t("editor.panelContent.layers.opacityLabel")}:</span>
                    <Slider
                      value={layer.opacity}
                      onValueChange={(val) => handleLayerOpacitySliderChange(index)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-600 w-8">{Math.round(layer.opacity * 100)}%</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

export { LayersPanel }


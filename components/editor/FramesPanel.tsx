"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VanillaSlider as Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/language"
import type { Frame } from "@/lib/pixel-engine"
import { AnimatePresence, motion } from "framer-motion"
import {
    Check,
    Copy,
    Download,
    Edit3,
    Pause,
    Play,
    Plus,
    SkipBack,
    SkipForward,
    Trash2,
    X
} from "lucide-react"
import React, { useCallback, useState } from "react"

interface FramesPanelProps {
  frames: Frame[]
  currentFrame: number
  animationFps: number
  isPlaying: boolean
  onFrameChange: (frameIndex: number) => void
  onAddFrame: () => void
  onDuplicateFrame: (frameIndex: number) => void
  onDeleteFrame: (frameIndex: number) => void
  onMoveFrame: (fromIndex: number, toIndex: number) => void
  onUpdateFrameDuration: (frameIndex: number, duration: number) => void
  onRenameFrame: (frameIndex: number, newName: string) => void
  onSetAnimationFps: (fps: number) => void
  onTogglePlayback: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onExportAnimation?: () => void
  className?: string
  isMobile?: boolean
}

const FramesPanel = React.memo(function FramesPanel({
  frames,
  currentFrame,
  animationFps,
  isPlaying,
  onFrameChange,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onMoveFrame,
  onUpdateFrameDuration,
  onRenameFrame,
  onSetAnimationFps,
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onExportAnimation,
  className = "",
  isMobile = false,
}: FramesPanelProps) {
  const { t } = useLanguage()
  const [editingFrame, setEditingFrame] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [draggedFrame, setDraggedFrame] = useState<number | null>(null)
  const [dragOverFrame, setDragOverFrame] = useState<number | null>(null)

  // Stable handlers for sliders
  const handleFpsChange = useCallback((value: number) => {
    onSetAnimationFps(value)
  }, [onSetAnimationFps])

  const handleFrameDurationChange = useCallback((index: number, value: number) => {
    onUpdateFrameDuration(index, value)
  }, [onUpdateFrameDuration])

  // Crear thumbnails para cada frame (simple preview)
  const generateFrameThumbnail = useCallback((frame: Frame) => {
    const pixelCount = frame.layers.reduce((count, layer) => 
      count + Object.keys(layer.pixels).length, 0
    )
    const hue = (pixelCount * 137.5) % 360
    return `hsl(${hue}, 70%, 85%)`
  }, [])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, frameIndex: number) => {
    setDraggedFrame(frameIndex)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, frameIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverFrame(frameIndex)
  }

  const handleDragLeave = () => {
    setDragOverFrame(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    if (draggedFrame !== null && draggedFrame !== targetIndex) {
      onMoveFrame(draggedFrame, targetIndex)
    }
    setDraggedFrame(null)
    setDragOverFrame(null)
  }

  const startEditing = (frameIndex: number, currentName: string) => {
    setEditingFrame(frameIndex)
    setEditingName(currentName)
  }

  const finishEditing = () => {
    if (editingFrame !== null && editingName.trim()) {
      onRenameFrame(editingFrame, editingName.trim())
    }
    setEditingFrame(null)
    setEditingName("")
  }

  const cancelEditing = () => {
    setEditingFrame(null)
    setEditingName("")
  }

  const getTotalDuration = () => {
    return frames.reduce((total, frame) => total + frame.duration, 0)
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
          {t("editor.panelContent.frames.framesAndDuration", { 
            count: String(frames.length), 
            duration: String(getTotalDuration()) 
          })}
        </span>
        {onExportAnimation && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportAnimation}
            disabled={frames.length === 0}
          >
            <Download className="w-3 h-3 mr-1" />
            {t("editor.panelContent.frames.export")}
          </Button>
        )}
      </div>

      {/* Controles de reproducción */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onStepBackward}
          disabled={frames.length <= 1}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={onTogglePlayback}
          disabled={frames.length <= 1}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onStepForward}
          disabled={frames.length <= 1}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* FPS Control */}
      <div className="space-y-2">
        <Label className="text-xs">{t("editor.panelContent.frames.fps", { value: String(animationFps) })}</Label>
        <Slider
          value={animationFps}
          onValueChange={handleFpsChange}
          min={1}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      {/* Add Frame Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddFrame}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("editor.panelContent.frames.addFrame")}
      </Button>

      {/* Lista de frames */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>          {frames.map((frame, index) => (
            <div
              key={frame.id}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all
                ${currentFrame === index 
                  ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                  : 'border-gray-200 bg-white/50 hover:bg-white/70'
                }
                ${dragOverFrame === index ? 'border-green-500 bg-green-50' : ''}
              `}
              onClick={() => onFrameChange(index)}              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-center gap-3">
                {/* Frame thumbnail */}
                <div
                  className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: generateFrameThumbnail(frame) }}
                />
                
                {/* Frame info */}
                <div className="flex-1 min-w-0">
                  {editingFrame === index ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditing()
                          if (e.key === 'Escape') cancelEditing()
                        }}
                        className="h-6 text-xs"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={finishEditing}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-medium truncate">{frame.name}</div>
                      <div className="text-xs text-gray-500">{frame.duration}ms</div>
                    </div>
                  )}
                </div>
                
                {/* Frame actions */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(index, frame.name)
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateFrame(index)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFrame(index)
                    }}
                    disabled={frames.length === 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Frame duration slider - only for current frame */}
              {currentFrame === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">{t("editor.panelContent.frames.duration")}:</Label>
                    <Slider
                      value={frame.duration}
                      onValueChange={(value) => handleFrameDurationChange(index, value)}
                      min={50}
                      max={1000}
                      step={50}
                      className="flex-1"
                    />                    <span className="text-xs w-12">{frame.duration}ms</span>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

export { FramesPanel }


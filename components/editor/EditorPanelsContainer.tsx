"use client"

import { ColorPanel } from "@/components/editor/ColorPanel"
import { FramesPanel } from "@/components/editor/FramesPanel"
import { LayersPanel } from "@/components/editor/LayersPanel"
import { SelectionPanel } from "@/components/editor/SelectionPanel"
import { EditorPanel } from "@/components/ui/EditorPanel"
import { usePanelOrder, type PanelType } from "@/hooks/editor/use-panel-order"
import { useLanguage } from "@/lib/language"
import { Film, Layers, Palette, Settings } from "lucide-react"
import { CanvasSettings } from "../ui/CanvasSettings"
import { ColorPalette } from "../ui/ColorPalette"

interface EditorPanelsContainerProps {
  // Selection Panel Props
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

  // Color Panel Props
  currentColor: string
  onColorChange: (color: string) => void
  colorPalette: string[]
  showGrid: boolean
  onToggleGrid: () => void
  onOpenPalette: () => void

  // Layers Panel Props
  layersData: any[]
  activeLayerIndex: number
  layerManagement: any
  showOnionSkin: boolean
  onionSkinOpacity: number
  onToggleOnionSkin: () => void
  onOnionSkinOpacityChange: (opacity: number) => void

  // Frames Panel Props
  frames: any[]
  currentFrame: number
  animationFps: number
  isAnimationPlaying: boolean
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
  onExportAnimation: () => void

  // Common Props
  isMobile?: boolean
  className?: string

  // Project Settings Props
  project?: any
  width?: number
  height?: number
  onProjectChange: (project: any) => void
  handleResize?: (width: number, height: number, method: "stretch" | "crop" | "pad") => void
  onColorPaletteChange?: (palette: string[]) => void
  // Funciones opcionales para extraer colores del canvas
  onExtractFromCanvas?: () => string[]
  onExtractFromLayers?: () => string[]
  onExtractFromFrames?: () => string[]
}

export function EditorPanelsContainer({
  // Selection props
  selectedPixels,
  clipboard,
  selectionBounds,
  showSelectionPreview,
  onToggleSelectionPreview,
  currentTool,
  magicWandTolerance,
  onMagicWandToleranceChange,

  // Color props
  currentColor,
  onColorChange,
  colorPalette,
  showGrid,
  onToggleGrid,
  onOpenPalette,

  // Layers props
  layersData,
  activeLayerIndex,
  layerManagement,
  showOnionSkin,
  onionSkinOpacity,
  onToggleOnionSkin,
  onOnionSkinOpacityChange,

  // Frames props
  frames,
  currentFrame,
  animationFps,
  isAnimationPlaying,
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

  // Common props
  isMobile = false,
  className = "",
  // Project settings props
  project,
  width,
  height,
  onProjectChange,
  handleResize,
  onColorPaletteChange,
  onExtractFromCanvas,
  onExtractFromLayers,
  onExtractFromFrames,
}: EditorPanelsContainerProps) {  
  const { t } = useLanguage()
  const {
    panelConfigs,
    movePanelUp,
    movePanelDown,
    canMovePanelUp,
    canMovePanelDown,
  } = usePanelOrder()

  // Solo ordenar paneles, no filtrar por visibilidad
  const sortedPanels = [...panelConfigs].sort((a, b) => a.order - b.order)

  const renderPanel = (panelType: PanelType, config: any) => {
    const commonProps = {
      onMoveUp: () => movePanelUp(panelType),
      onMoveDown: () => movePanelDown(panelType),
      canMoveUp: canMovePanelUp(panelType),
      canMoveDown: canMovePanelDown(panelType),
      isMobile,
    }

    switch (panelType) {
      case "selection":
        return (
          <SelectionPanel
            key="selection"
            selectedPixels={selectedPixels}
            clipboard={clipboard}
            selectionBounds={selectionBounds}
            showSelectionPreview={showSelectionPreview}
            onToggleSelectionPreview={onToggleSelectionPreview}
            currentTool={currentTool}
            magicWandTolerance={magicWandTolerance}
            onMagicWandToleranceChange={onMagicWandToleranceChange}
            {...commonProps}
          />
        )

      case "color":
        return (
          <EditorPanel
            key="color"
            title={t("editor.panels.colors")}
            icon={Palette}
            {...commonProps}
          >
            <ColorPanel
              currentColor={currentColor}
              onColorChange={onColorChange}
              colorPalette={colorPalette}
              onPaletteChange={onColorPaletteChange}
              isMobile={isMobile}
            />
          </EditorPanel>
        )
      case "palette":
        return (
          <EditorPanel
            key="palette"
            title={t("editor.panels.colorPalette")}
            icon={Palette}
            {...commonProps}
          >
            <ColorPalette
              currentColor={currentColor}
              palette={colorPalette}
              onColorSelect={onColorChange}
              onPaletteChange={onColorPaletteChange!}
              isDesktop={!isMobile}
              onExtractFromCanvas={onExtractFromCanvas}
              onExtractFromLayers={onExtractFromLayers}
              onExtractFromFrames={onExtractFromFrames}
            />
          </EditorPanel>
        )

      case "layers":
        return (
          <EditorPanel
            key="layers"
            title={t("editor.panels.layers")}
            icon={Layers}
            {...commonProps}
          >
            <LayersPanel
              layers={layersData}
              activeLayer={activeLayerIndex}
              onLayerSelect={layerManagement.handleLayerSelect}
              onLayerAdd={layerManagement.handleLayerAdd}
              onLayerDelete={layerManagement.handleLayerDelete}
              onLayerToggleVisibility={layerManagement.handleLayerToggleVisibility}
              onLayerDuplicate={layerManagement.handleLayerDuplicate}
              onLayerMove={layerManagement.handleLayerMove}
              onLayerOpacityChange={layerManagement.handleLayerOpacityChange}
              onLayerRename={layerManagement.handleLayerRename}
              showOnionSkin={showOnionSkin}
              onionSkinOpacity={onionSkinOpacity}
              onToggleOnionSkin={onToggleOnionSkin}
              onOnionSkinOpacityChange={onOnionSkinOpacityChange}
              isMobile={isMobile}
            />
          </EditorPanel>
        )

      case "frames":
        return (
          <EditorPanel
            key="frames"
            title={t("editor.panels.animation")}
            icon={Film}
            {...commonProps}
          >
            <FramesPanel
              frames={frames}
              currentFrame={currentFrame}
              animationFps={animationFps}
              isPlaying={isAnimationPlaying}
              onFrameChange={onFrameChange}
              onAddFrame={onAddFrame}
              onDuplicateFrame={onDuplicateFrame}
              onDeleteFrame={onDeleteFrame}
              onMoveFrame={onMoveFrame}
              onUpdateFrameDuration={onUpdateFrameDuration}
              onRenameFrame={onRenameFrame}
              onSetAnimationFps={onSetAnimationFps}
              onTogglePlayback={onTogglePlayback}
              onStepForward={onStepForward}
              onStepBackward={onStepBackward}
              onExportAnimation={onExportAnimation}
            />
          </EditorPanel>
        )
      case "settings":
        return (<EditorPanel key="settings" title={t("editor.panels.settings")} icon={Settings} {...commonProps}>
          <CanvasSettings
            currentWidth={width!}
            currentHeight={height!}
            onResize={handleResize as any}
            showGrid={showGrid}
            onToggleGrid={onToggleGrid}
            isDesktop={!isMobile}
          />
        </EditorPanel>)
      default:
        return null
    }
  }
  return (
    <div className={`flex flex-col gap-6 h-full overflow-y-auto scrollbar-hide ${className}`}>
      {/* Todos los paneles siempre visibles, solo se colapsan */}
      {sortedPanels.map(panel => renderPanel(panel.id, panel))}
    </div>
  )
}

"use client"

import { useLanguage } from "@/lib/language"
import type React from "react"

import { AnimationExportModal } from "@/components/AnimationExportModal"
import { CanvasComponent, type CanvasRef } from "@/components/editor/CanvasComponent"
import { EditorHeader } from "@/components/editor/EditorHeader"
import { EditorPanelsContainer } from "@/components/editor/EditorPanelsContainer"
import { FramesPanel } from "@/components/editor/FramesPanel"
import { LayersPanel } from "@/components/editor/LayersPanel"
import { ToolPanel } from "@/components/editor/ToolPanel"
import { ProjectSettings } from "@/components/ProjectSettings"
import { CanvasSettings } from "@/components/ui/CanvasSettings"
import { ColorPalette } from "@/components/ui/ColorPalette"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { MobileDrawer } from "@/components/ui/MobileDrawer"
import { MobileGestureHandler } from "@/components/ui/MobileGestureHandler"
import { Slider } from "@/components/ui/slider"
import { ToolSubPanel } from "@/components/ui/ToolSubPanel"
import { usePixelEditor } from "@/hooks/editor"
import { motion } from "framer-motion"
import {
  Circle,
  Diamond,
  Film,
  Layers,
  Menu,
  Palette,
  Plus,
  Redo,
  Settings,
  Square,
  Triangle,
  Undo,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createElement, useCallback, useEffect, useMemo, useRef } from "react"

interface PixelEditorProps {
  project: any
  user: any
  onSave: (data: any) => void
  setCurrentProject?: (project: any) => void
  setView?: (view: string) => void
}

export function PixelEditor({ project, user, onSave, setCurrentProject, setView }: PixelEditorProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const canvasRef = useRef<CanvasRef>(null)

  // Use the modular pixel editor hook
  const editor = usePixelEditor(project, user, onSave, setCurrentProject)
  // Early return if editor is not ready
  if (!editor || !editor.layerManager) {
    console.log("Editor not ready:", { editor: !!editor, layerManager: editor?.layerManager })
    return <div className="h-screen bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-orange-50/80 backdrop-blur-xl flex items-center justify-center">
      <div className="text-gray-500">{t("editor.loading")}</div>
    </div>
  }  // Debug specific changes
  useEffect(() => {
    console.log("isMobile changed:", editor.isMobile)
  }, [editor.isMobile])

  useEffect(() => {
    console.log("currentTool changed:", editor.currentTool)
  }, [editor.currentTool])

  useEffect(() => {
    console.log("canvasState changed:", editor.canvasState)
  }, [editor.canvasState])

  useEffect(() => {
    console.log("layersData length changed:", editor.layersData?.length)
  }, [editor.layersData?.length])
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      editor.setIsMobile(window.innerWidth < 1024)
    }

    // Add a small delay to ensure proper rendering
    setTimeout(checkMobile, 100)
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [editor.setIsMobile])
  // NOTE: Removed clearSelection on tool change to maintain persistent selection
  // Selection is now persistent across all tools and only cleared manually or when creating new selections
  
  const handleZoomOut = useCallback(() => editor.setZoom(prev => Math.max(4, prev - 2)), [editor.setZoom])
  const handleZoomIn = useCallback(() => editor.setZoom(prev => Math.min(32, prev + 2)), [editor.setZoom])
  const handleZoomChange = useCallback((value: number) => editor.setZoom(value), [editor.setZoom])
  const zoom = useMemo(() => editor.zoom, [editor.zoom])
  const handleToolSizeChange = useCallback((value: number) => {
    editor.setToolSettings(prev => ({ ...prev, size: value }))
  }, [editor.setToolSettings])
    const handleToggleOnionSkin = useCallback(() => {
    editor.setShowOnionSkin(prev => !prev)
    editor.updateMoment()
  }, [editor.setShowOnionSkin, editor.updateMoment])
  
  const handleOnionSkinOpacityChange = useCallback((opacity: number) => {
    editor.setOnionSkinOpacity(opacity)
    editor.updateMoment()  }, [editor.setOnionSkinOpacity, editor.updateMoment])

  // Stable references for slider handlers
  const handleMagicWandToleranceChange = useCallback((value: number) => {
    editor.setMagicWandTolerance(value)
  }, [editor.setMagicWandTolerance])

  // Stable handlers for header actions
  const handleBackAction = useCallback(() => {
    editor.projectOperations.handleSave()
    setView?.("dashboard")
    setCurrentProject?.(null)
  }, [editor.projectOperations.handleSave, setView, setCurrentProject])
  const handleSettingsAction = useCallback(() => {
    editor.setShowProjectSettings(true)
  }, [editor.setShowProjectSettings])

  // Stable handlers for toggle functions
  const handleToggleSelectionPreview = useCallback(() => {
    editor.setShowSelectionPreview(!editor.showSelectionPreview)
  }, [editor.setShowSelectionPreview, editor.showSelectionPreview])

  const handleToggleGrid = useCallback(() => {
    editor.setShowGrid(!editor.showGrid)
  }, [editor.setShowGrid, editor.showGrid])

  const handleOpenPalette = useCallback(() => {
    editor.setShowPaletteDrawer(true)
  }, [editor.setShowPaletteDrawer])


  const handleOpenAnimationExport = useCallback(() => {
    editor.setShowAnimationExport(true)
  }, [editor.setShowAnimationExport])

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-orange-50/80 backdrop-blur-xl flex flex-col">      
    {/* Header */}      
    <EditorHeader
        projectTitle={project.title}
        canvasSize={{ width: editor.canvasWidth, height: editor.canvasHeight }}
        isTemporary={project.isTemporary}
        user={user}
        onlineUsers={editor.collaboration.onlineUsers}
        canUndo={editor.layerManager.canUndo()}
        canRedo={editor.layerManager.canRedo()}
        onBack={handleBackAction}
        onUndo={editor.canvasInteractions.handleUndo}
        onRedo={editor.canvasInteractions.handleRedo}
        onSave={editor.projectOperations.handleSave}
      />

      <div className="flex-1 flex overflow-hidden">        
        {/* Desktop Tool Panel */}
        {!editor.isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className=" p-4 flex-shrink-0"
          >
            <div className="">
              <ToolPanel activeTool={editor.currentTool} onToolChange={editor.setCurrentTool} 
              variant="compact"/>
              <ToolSubPanel 
                activeTool={editor.currentTool} 
                toolSettings={editor.toolSettings} 
                onSettingsChange={editor.setToolSettings} 
                variant="compact"
              />
            </div>
          </motion.div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <GlassCard className="overflow-hidden" intensity="heavy">
                <MobileGestureHandler
                  onSingleTouch={(point) => {
                    const mockEvent = { clientX: point.x, clientY: point.y } as React.MouseEvent
                    editor.canvasInteractions.handleCanvasStart(mockEvent as any, canvasRef)
                  }}
                  onTouchMove={(point) => {
                    const mockEvent = { clientX: point.x, clientY: point.y } as React.MouseEvent
                    editor.canvasInteractions.handleCanvasMove(mockEvent as any, canvasRef)
                  }}
                  onTouchEnd={editor.canvasInteractions.handleCanvasEnd}
                  onPinchZoom={(scale, center) => 
                    editor.canvasInteractions.handlePinchZoom(scale, center, editor.zoom, editor.setZoom)
                  }
                >                  <CanvasComponent
                    ref={canvasRef}
                    state={editor.canvasState}
                    previewPixels={editor.combinedPreviewPixels}
                    onionSkin={editor.onionSkinLayer}
                    selectedPixels={editor.selectedPixels}
                    onMouseDown={(e) => editor.canvasInteractions.handleCanvasStart(e, canvasRef)}
                    onMouseMove={(e) => editor.canvasInteractions.handleCanvasMove(e, canvasRef)}
                    onMouseUp={editor.canvasInteractions.handleCanvasEnd}
                    onMouseLeave={editor.canvasInteractions.handleCanvasEnd}
                  />
                </MobileGestureHandler>
              </GlassCard>
            </motion.div>

            {/* Transformation Info */}
            {editor.transformInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2"
              >
                <GlassCard className="px-3 py-2" intensity="medium">
                  <span className="text-sm font-medium text-gray-700">
                    {editor.transformInfo}
                  </span>
                </GlassCard>
              </motion.div>
            )}            {/* Zoom Controls */}
            {!editor.isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 right-4"
              >
                <GlassCard className="flex items-center gap-3 p-3" intensity="medium">
                  <GlassButton
                    size="sm"
                    onClick={handleZoomOut}
                    icon={ZoomOut}
                    disabled={editor.zoom <= 4}
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">{editor.zoom}x</span>
                  <GlassButton
                    size="sm"
                    onClick={handleZoomIn}
                    icon={ZoomIn}
                    disabled={editor.zoom >= 32}
                  />
                </GlassCard>
              </motion.div>
            )}

          </div>         
        </div>

        {/* Desktop Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-80 p-6 flex-shrink-0"
        ><div className="flex flex-col gap-6 h-full overflow-y-auto">
            <EditorPanelsContainer              // Selection Panel Props
              selectedPixels={editor.selectedPixels}
              clipboard={editor.clipboard}
              selectionBounds={editor.selectionBounds}
              showSelectionPreview={editor.showSelectionPreview}
              onToggleSelectionPreview={handleToggleSelectionPreview}
              currentTool={editor.currentTool}
              magicWandTolerance={editor.magicWandTolerance}
              onMagicWandToleranceChange={handleMagicWandToleranceChange}
              // Color Panel Props
              currentColor={editor.currentColor}
              onColorChange={editor.setCurrentColor}
              colorPalette={editor.colorPalette}
              showGrid={editor.showGrid}
              onToggleGrid={handleToggleGrid}
              onOpenPalette={handleOpenPalette}
              
              // Layers Panel Props
              layersData={editor.layersData}
              activeLayerIndex={editor.activeLayerIndex}
              layerManagement={editor.layerManagement}
              showOnionSkin={editor.showOnionSkin}
              onionSkinOpacity={editor.onionSkinOpacity}
              onToggleOnionSkin={handleToggleOnionSkin}
              onOnionSkinOpacityChange={handleOnionSkinOpacityChange}
              
              // Frames Panel Props
              frames={editor.layerManager.frames}
              currentFrame={editor.layerManager.currentFrame}
              animationFps={editor.layerManager.animationFps}
              isAnimationPlaying={editor.isAnimationPlaying}
              onFrameChange={editor.handleFrameChange}
              onAddFrame={editor.handleAddFrame}
              onDuplicateFrame={editor.handleDuplicateFrame}
              onDeleteFrame={editor.handleDeleteFrame}
              onMoveFrame={editor.handleMoveFrame}
              onUpdateFrameDuration={editor.handleUpdateFrameDuration}
              onRenameFrame={editor.handleRenameFrame}
              onSetAnimationFps={editor.handleSetAnimationFps}              
              onTogglePlayback={editor.handleTogglePlayback}
              onStepForward={editor.handleStepForward}
              onStepBackward={editor.handleStepBackward}
              onExportAnimation={handleOpenAnimationExport}
              
              isMobile={false}            
              
              width={editor.canvasWidth}
              height={editor.canvasHeight}
              onProjectChange={editor.projectOperations.handleProjectUpdate}
              handleResize={editor.projectOperations.handleCanvasResize}
              onColorPaletteChange={editor.setColorPalette}
              onExtractFromCanvas={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromCanvas() || []}
              onExtractFromLayers={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromLayers() || []}
              onExtractFromFrames={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromFrames() || []}
              />
          </div>
        </motion.div>
      </div>

      {/* Mobile Controls - Outside main panels */}
      {editor.isMobile && (
        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-4 h-48 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              <GlassButton
                onClick={() => editor.setShowToolsDrawer(true)}
                className="rounded-xl aspect-square flex items-center justify-center"
              >
                {createElement(Menu, { size: 16 })}
              </GlassButton>
              <GlassButton
                onClick={() => editor.setShowLayersDrawer(true)}
                className="rounded-xl aspect-square flex items-center justify-center"
              >
                {createElement(Layers, { size: 16 })}
              </GlassButton>
              <GlassButton
                onClick={() => editor.setShowFramesDrawer(true)}
                className="rounded-xl aspect-square flex items-center justify-center"
              >
                {createElement(Film, { size: 16 })}
              </GlassButton>
              <GlassButton
                onClick={() => editor.setShowPaletteDrawer(true)}
                className="rounded-xl aspect-square flex items-center justify-center"
              >
                {createElement(Palette, { size: 16 })}
              </GlassButton>
              <GlassButton
                onClick={() => editor.setShowSettingsDrawer(true)}
                className="rounded-xl aspect-square flex items-center justify-center"
              >
                {createElement(Settings, { size: 16 })}
              </GlassButton>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                onClick={editor.canvasInteractions.handleUndo}
                disabled={!editor.layerManager.canUndo()}
                className="rounded-lg aspect-square flex items-center justify-center"
              >
                {createElement(Undo, { size: 16 })}
              </GlassButton>
              <GlassButton
                onClick={editor.canvasInteractions.handleRedo}
                disabled={!editor.layerManager.canRedo()}
                className="rounded-lg aspect-square flex items-center justify-center"
              >
                {createElement(Redo, { size: 16 })}
              </GlassButton>
            </div>
          </div>

          {/* Mobile Zoom */}
          <div className="flex items-center gap-3 mb-3">
            <GlassButton
              size="sm"
              onClick={handleZoomOut}
              disabled={editor.zoom <= 4}
              className="rounded-lg aspect-square flex items-center justify-center"
            >
              {createElement(ZoomOut, { size: 16 })}
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={handleZoomIn}
              disabled={editor.zoom >= 32}
              className="rounded-lg aspect-square flex items-center justify-center"
            >
              {createElement(ZoomIn, { size: 16 })}
            </GlassButton>
            <span className="text-sm font-medium text-gray-700 w-12 text-center">
              {editor.zoom}x
            </span>
          </div>

          {/* Tool-specific controls - with fixed height container */}
          <div className="h-20 overflow-y-auto">
            {["spray", "pencil", "eraser"].includes(editor.currentTool) && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Tamaño:</span>
                  <Slider
                    value={editor.toolSettings.size}
                    onValueChange={handleToolSizeChange}
                    min={1}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-8">
                    {editor.toolSettings.size}
                  </span>
                </div>
                
                {/* Brush shapes for pencil tool when size > 1 */}
                {editor.currentTool === "pencil" && editor.toolSettings.size > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Forma:</span>
                    <div className="flex gap-1">
                      <GlassButton
                        size="sm"
                        active={editor.toolSettings.brushShape === 'circle'}
                        onClick={() => editor.setToolSettings(prev => ({ ...prev, brushShape: 'circle' as const }))}
                        className="w-8 h-8 p-0"
                      >
                        <Circle className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        active={editor.toolSettings.brushShape === 'square'}
                        onClick={() => editor.setToolSettings(prev => ({ ...prev, brushShape: 'square' as const }))}
                        className="w-8 h-8 p-0"
                      >
                        <Square className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        active={editor.toolSettings.brushShape === 'diamond'}
                        onClick={() => editor.setToolSettings(prev => ({ ...prev, brushShape: 'diamond' as const }))}
                        className="w-8 h-8 p-0"
                      >
                        <Diamond className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        active={editor.toolSettings.brushShape === 'triangle'}
                        onClick={() => editor.setToolSettings(prev => ({ ...prev, brushShape: 'triangle' as const }))}
                        className="w-8 h-8 p-0"
                      >
                        <Triangle className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        active={editor.toolSettings.brushShape === 'cross'}
                        onClick={() => editor.setToolSettings(prev => ({ ...prev, brushShape: 'cross' as const }))}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Mobile Drawers */}
      <MobileDrawer 
        isOpen={editor.showToolsDrawer} 
        onClose={() => editor.setShowToolsDrawer(false)} 
        title={t("editor.panels.tools")}
      >
        <ToolPanel
          activeTool={editor.currentTool}
          onToolChange={(tool) => {
            editor.setCurrentTool(tool)
            editor.setShowToolsDrawer(false)
          }}
          isMobile={true}
        />
        <div className="mt-4">
          <ToolSubPanel 
            activeTool={editor.currentTool} 
            toolSettings={editor.toolSettings} 
            onSettingsChange={editor.setToolSettings} 
          />
        </div>
      </MobileDrawer>


      <MobileDrawer 
        isOpen={editor.showPaletteDrawer} 
        onClose={() => editor.setShowPaletteDrawer(false)} 
        title={t("editor.panels.paletteEditor")}
      >
        <ColorPalette
          currentColor={editor.currentColor}
          onColorSelect={editor.setCurrentColor}
          palette={editor.colorPalette}
          onPaletteChange={editor.setColorPalette}
          onExtractFromCanvas={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromCanvas() || []}
          onExtractFromLayers={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromLayers() || []}
          onExtractFromFrames={() => canvasRef.current?.getPixelCanvas()?.getUniqueColorsFromFrames() || []}
        />
      </MobileDrawer>

      <MobileDrawer
        isOpen={editor.showSettingsDrawer}
        onClose={() => editor.setShowSettingsDrawer(false)}
        title={t("editor.panels.canvasSettings")}
      >
        <CanvasSettings 
          currentWidth={editor.canvasWidth} 
          currentHeight={editor.canvasHeight} 
          onResize={editor.projectOperations.handleCanvasResize}
          showGrid={editor.showGrid}
          onToggleGrid={() => editor.setShowGrid(!editor.showGrid)}
        />
      </MobileDrawer>

      <MobileDrawer 
        isOpen={editor.showLayersDrawer} 
        onClose={() => editor.setShowLayersDrawer(false)} 
        title={t("editor.panels.layers")}
      >        <LayersPanel
          layers={editor.layersData}
          activeLayer={editor.activeLayerIndex}
          onLayerSelect={editor.layerManagement.handleLayerSelect}
          onLayerAdd={editor.layerManagement.handleLayerAdd}
          onLayerDelete={editor.layerManagement.handleLayerDelete}
          onLayerToggleVisibility={editor.layerManagement.handleLayerToggleVisibility}
          onLayerDuplicate={editor.layerManagement.handleLayerDuplicate}
          onLayerMove={editor.layerManagement.handleLayerMove}
          onLayerOpacityChange={editor.layerManagement.handleLayerOpacityChange}
          onLayerRename={editor.layerManagement.handleLayerRename}
          showOnionSkin={editor.showOnionSkin}
          onionSkinOpacity={editor.onionSkinOpacity}
          onToggleOnionSkin={handleToggleOnionSkin}
          onOnionSkinOpacityChange={handleOnionSkinOpacityChange}
          isMobile={true}
        />
      </MobileDrawer>

      <MobileDrawer 
        isOpen={editor.showFramesDrawer} 
        onClose={() => editor.setShowFramesDrawer(false)} 
        title={t("editor.panels.animation")}
      >        <FramesPanel
          frames={editor.layerManager.frames}
          currentFrame={editor.layerManager.currentFrame}
          animationFps={editor.layerManager.animationFps}
          isPlaying={editor.isAnimationPlaying}
          onFrameChange={editor.handleFrameChange}
          onAddFrame={editor.handleAddFrame}
          onDuplicateFrame={editor.handleDuplicateFrame}
          onDeleteFrame={editor.handleDeleteFrame}
          onMoveFrame={editor.handleMoveFrame}
          onUpdateFrameDuration={editor.handleUpdateFrameDuration}
          onRenameFrame={editor.handleRenameFrame}
          onSetAnimationFps={editor.handleSetAnimationFps}          onTogglePlayback={editor.handleTogglePlayback}
          onStepForward={editor.handleStepForward}
          onStepBackward={editor.handleStepBackward}
          onExportAnimation={handleOpenAnimationExport}
        />
      </MobileDrawer>

      
      {/* Project Settings */}
      {user && (
        <ProjectSettings
          project={project}
          onUpdate={editor.projectOperations.handleProjectUpdate}
          isOpen={editor.showProjectSettings}
          onOpenChange={editor.setShowProjectSettings}
        />
      )}      {/* Animation Export Modal */}
      <AnimationExportModal
        isOpen={editor.showAnimationExport}
        onClose={() => editor.setShowAnimationExport(false)}
        frames={editor.layerManager.frames}
        canvasWidth={editor.canvasWidth}
        canvasHeight={editor.canvasHeight}
        projectTitle={project.title}
        layerManager={editor.layerManager}
        user={user}
        colorPalette={editor.colorPalette}
      />
    </div>
  )
}

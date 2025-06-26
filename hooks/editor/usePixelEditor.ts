"use client"

import { Project } from "@/lib/database"
import { CanvasState } from "@/lib/pixel-engine"
import { useEffect, useMemo } from "react"
import { useAnimation } from "./useAnimation"
import { useCanvasInteractions } from "./useCanvasInteractions"
import { useCollaboration } from "./useCollaboration"
import { useDrawingTools } from "./useDrawingTools"
import { useEditorState } from "./useEditorState"
import { useKeyboardShortcuts } from "./useKeyboardShortcuts"
import { useLayerManagement } from "./useLayerManagement"
import { useProjectOperations } from "./useProjectOperations"
import { useSelection } from "./useSelection"
import { useUIState } from "./useUIState"

export function usePixelEditor(project: Project, user: any, onSave: (data: any) => void, setCurrentProject?: (project: any) => void) {
  // Core editor state
  const editorState = useEditorState(project)
  
  // UI state for drawers and modals
  const uiState = useUIState()
  
  // Selection and clipboard functionality
  const selection = useSelection()
    // Animation functionality
  const animation = useAnimation(
    editorState.layerManager, 
    editorState.updateMoment,
    // Pasar parámetros de sincronización solo si el proyecto es colaborativo
    project.is_collaborative ? project.id : undefined,
    project.is_collaborative ? user.id : undefined,
    project.is_collaborative ? user.username : undefined
  )
  
  // Collaboration via WebSocket
  var collaboration = {
    onlineUsers: {},
    sendMessage: () => {},
    broadcastLayerOperation: () => {},
    handleRemotePixelUpdate: () => {},
    handleRemotePixelsUpdate: () => {},
    handleLayerOperation: () => {},
    handleRemoteLayersSync: () => {}
  }
  if(project.is_collaborative){

        collaboration = useCollaboration(
        project,
        user,
        editorState.layerManager,
        editorState.updateMoment,
        editorState.setPreviewPixels
    ) as any
  }
  
  // Layer management with collaboration
  const layerManagement = useLayerManagement(
    editorState.layerManager,
    user,
    editorState.updateMoment,
    collaboration.broadcastLayerOperation
  )
  
  // Drawing tools management
  const drawingTools = useDrawingTools(
    editorState.currentTool,
    editorState.currentColor,
    editorState.toolSettings,
    editorState.canvasWidth,
    editorState.canvasHeight,
    editorState.layerManager,
    selection.selectedPixels,
    selection.magicWandTolerance,
    editorState.setCurrentColor
  )

  // Set up color replace functionality and handle apply flag
  useEffect(() => {
    drawingTools.setupColorReplace((oldColor: string, newColor: string) => {
      editorState.layerManager.replaceColorInLayersAndFrames(oldColor, newColor)
      editorState.layerManager.saveToHistory()
      editorState.updateMoment()
    })
  }, [drawingTools.setupColorReplace, editorState.layerManager, editorState.updateMoment])

  // Reset apply flag after it's been processed
  useEffect(() => {
    if (editorState.toolSettings.apply) {
      // Reset the apply flag after a short delay to prevent immediate re-triggering
      const timeout = setTimeout(() => {
        editorState.setToolSettings(prev => ({ ...prev, apply: false }))
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [editorState.toolSettings.apply, editorState.setToolSettings])
    // Canvas interactions
  const canvasInteractions = useCanvasInteractions(
    editorState.layerManager,
    user,
    editorState.canvasWidth,
    editorState.canvasHeight,
    collaboration.sendMessage,
    drawingTools.activeTool,
    drawingTools.isDrawing,
    drawingTools.setIsDrawing,
    editorState.setPreviewPixels,
    selection.selectedPixels,
    selection.setSelectedPixels,
    selection.setSelectionBounds,
    editorState.updateMoment // Pass updateMoment for undo/redo
  )
  // Project operations (save, export, etc.)
  const projectOperations = useProjectOperations(
    project,
    user,
    editorState.layerManager,
    editorState.canvasWidth,
    editorState.canvasHeight,
    editorState.colorPalette,
    onSave,
    setCurrentProject,
    collaboration.sendMessage,
    editorState.updateMoment,
    editorState.setCanvasWidth,
    editorState.setCanvasHeight
  )
    // Enhanced selection methods with project context
  const enhancedSelection = useMemo(() => ({
    ...selection,
    handleCut: () => selection.handleCut(canvasInteractions.applyPixels),
    handlePaste: () => selection.handlePaste(
      editorState.canvasWidth,
      editorState.canvasHeight,
      canvasInteractions.applyPixels
    ),
    selectAll: () => selection.selectAll(
      editorState.canvasWidth,
      editorState.canvasHeight,
      editorState.layerManager.getActiveLayer().pixels
    ),
    deleteSelectedPixels: () => {
      selection.deleteSelectedPixels(canvasInteractions.applyPixels)
      editorState.layerManager.saveToHistory()
    }
  }), [
    selection,
    canvasInteractions.applyPixels,
    editorState.canvasWidth,
    editorState.canvasHeight,
    editorState.layerManager
  ])
  
  // Keyboard shortcuts
  useKeyboardShortcuts(
    canvasInteractions.handleUndo,
    canvasInteractions.handleRedo,
    projectOperations.handleSave,
    projectOperations.handleExport,
    enhancedSelection.handleCopy,
    enhancedSelection.handleCut,
    enhancedSelection.handlePaste,
    enhancedSelection.selectAll,
    enhancedSelection.deleteSelectedPixels,
    enhancedSelection.clearSelection,
    editorState.setCurrentTool as any,
    selection.selectedPixels
  )

  // Animation effect for selection marching ants
  useEffect(() => {
    if (Object.keys(selection.selectedPixels).length === 0) return

    const interval = setInterval(() => {
      // Force re-render to animate selection
      editorState.updateMoment()
    }, 150) // Update every 150ms for smooth animation

    return () => clearInterval(interval)
  }, [selection.selectedPixels, editorState.updateMoment])

    // Memoized canvas state for rendering
  const canvasState: CanvasState = useMemo(() => ({
    width: editorState.canvasWidth,
    height: editorState.canvasHeight,
    layers: editorState.layersData,
    activeLayer: editorState.activeLayerIndex,
    zoom: editorState.zoom,
    showGrid: editorState.showGrid,
  }), [
    editorState.canvasWidth,
    editorState.canvasHeight,
    editorState.layersData,
    editorState.activeLayerIndex,
    editorState.zoom,
    editorState.showGrid
  ])  // Combine preview pixels (selection outline is now handled separately)
  const combinedPreviewPixels = useMemo(() => {
    // Just return the preview pixels without selection overlay
    // Selection outline is now handled directly in PixelCanvas.drawSelectionOutline
    return { ...editorState.previewPixels }
  }, [
    editorState.previewPixels
  ])

  const onionSkinLayer = editorState.showOnionSkin && editorState.activeLayerIndex > 0
    ? { layer: editorState.layersData[editorState.activeLayerIndex], opacity: editorState.onionSkinOpacity }
    : undefined

  // Memoize transform info to prevent recalculation
  const transformInfo = useMemo(() => 
    selection.getTransformInfo(drawingTools.activeTool, drawingTools.isDrawing),
    [selection.getTransformInfo, drawingTools.activeTool, drawingTools.isDrawing]
  )
  // Return the complete editor interface
  return {
    // State
    ...editorState,
    ...uiState,
    ...selection,
    ...animation,
    ...drawingTools,
    
    // Enhanced methods
    selection: enhancedSelection,
    layerManagement,
    canvasInteractions,
    projectOperations,
    collaboration,
    
    // Computed values
    canvasState,
    combinedPreviewPixels,
    onionSkinLayer,
    transformInfo,
  }
}

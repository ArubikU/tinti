"use client"

import { useMemo, useState } from "react"

export function useUIState() {
  // UI state for drawers and modals
  const [showColorDrawer, setShowColorDrawer] = useState(false)
  const [showLayersDrawer, setShowLayersDrawer] = useState(false)
  const [showToolsDrawer, setShowToolsDrawer] = useState(false)
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false)
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false)
  const [showCanvasResizer, setShowCanvasResizer] = useState(false)
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [showFramesDrawer, setShowFramesDrawer] = useState(false)
  const [showAnimationExport, setShowAnimationExport] = useState(false)
  return useMemo(() => ({
    showColorDrawer,
    setShowColorDrawer,
    showLayersDrawer,
    setShowLayersDrawer,
    showToolsDrawer,
    setShowToolsDrawer,
    showPaletteDrawer,
    setShowPaletteDrawer,
    showSettingsDrawer,
    setShowSettingsDrawer,
    showCanvasResizer,
    setShowCanvasResizer,
    showProjectSettings,
    setShowProjectSettings,
    showFramesDrawer,
    setShowFramesDrawer,
    showAnimationExport,
    setShowAnimationExport,
  }), [
    showColorDrawer,
    showLayersDrawer,
    showToolsDrawer,
    showPaletteDrawer,
    showSettingsDrawer,
    showCanvasResizer,
    showProjectSettings,
    showFramesDrawer,
    showAnimationExport,
  ])
}

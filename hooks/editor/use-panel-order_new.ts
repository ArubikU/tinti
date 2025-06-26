"use client"

import { useCallback, useEffect, useState } from "react"

export type PanelType = "selection" | "color" | "layers" | "frames"

export interface PanelConfig {
  id: PanelType
  isVisible: boolean
  order: number
}

const DEFAULT_PANEL_ORDER: PanelConfig[] = [
  { id: "selection", isVisible: true, order: 0 },
  { id: "color", isVisible: true, order: 1 },
  { id: "layers", isVisible: true, order: 2 },
  { id: "frames", isVisible: true, order: 3 },
]

const STORAGE_KEY = "tinti-editor-panels-config"

export function usePanelOrder() {
  const [panelConfigs, setPanelConfigs] = useState<PanelConfig[]>(DEFAULT_PANEL_ORDER)

  // Load panel configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as PanelConfig[]
        
        // Ensure all panels are present and have valid order
        const validatedConfigs = DEFAULT_PANEL_ORDER.map(defaultPanel => {
          const savedPanel = parsed.find(p => p.id === defaultPanel.id)
          return savedPanel || defaultPanel
        }).sort((a, b) => a.order - b.order)
        
        setPanelConfigs(validatedConfigs)
      }
    } catch (error) {
      console.warn("Failed to load panel configuration:", error)
    }
  }, [])

  // Save to localStorage whenever configs change
  const saveToStorage = useCallback((configs: PanelConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
    } catch (error) {
      console.warn("Failed to save panel configuration:", error)
    }
  }, [])

  // Move panel up in order
  const movePanelUp = useCallback((panelId: PanelType) => {
    setPanelConfigs(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const currentIndex = sorted.findIndex(p => p.id === panelId)
      
      if (currentIndex <= 0) return prev
      
      const newConfigs = [...sorted]
      
      // Swap orders
      const temp = newConfigs[currentIndex].order
      newConfigs[currentIndex].order = newConfigs[currentIndex - 1].order
      newConfigs[currentIndex - 1].order = temp
      
      saveToStorage(newConfigs)
      return newConfigs
    })
  }, [saveToStorage])

  // Move panel down in order
  const movePanelDown = useCallback((panelId: PanelType) => {
    setPanelConfigs(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const currentIndex = sorted.findIndex(p => p.id === panelId)
      
      if (currentIndex >= sorted.length - 1) return prev
      
      const newConfigs = [...sorted]
      
      // Swap orders
      const temp = newConfigs[currentIndex].order
      newConfigs[currentIndex].order = newConfigs[currentIndex + 1].order
      newConfigs[currentIndex + 1].order = temp
      
      saveToStorage(newConfigs)
      return newConfigs
    })
  }, [saveToStorage])

  // Toggle panel visibility
  const togglePanelVisibility = useCallback((panelId: PanelType) => {
    setPanelConfigs(prev => {
      const newConfigs = prev.map(config =>
        config.id === panelId
          ? { ...config, isVisible: !config.isVisible }
          : config
      )
      saveToStorage(newConfigs)
      return newConfigs
    })
  }, [saveToStorage])

  // Check if panel can move up/down - sin usar callbacks complejos
  const canMovePanelUp = (panelId: PanelType): boolean => {
    const sorted = [...panelConfigs].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex(p => p.id === panelId)
    return index > 0
  }

  const canMovePanelDown = (panelId: PanelType): boolean => {
    const sorted = [...panelConfigs].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex(p => p.id === panelId)
    return index < sorted.length - 1
  }

  // Reset to default configuration
  const resetPanelOrder = useCallback(() => {
    setPanelConfigs(DEFAULT_PANEL_ORDER)
    saveToStorage(DEFAULT_PANEL_ORDER)
  }, [saveToStorage])

  // Show all panels
  const showAllPanels = useCallback(() => {
    setPanelConfigs(prev => {
      const newConfigs = prev.map(config => ({ ...config, isVisible: true }))
      saveToStorage(newConfigs)
      return newConfigs
    })
  }, [saveToStorage])

  // Hide all panels
  const hideAllPanels = useCallback(() => {
    setPanelConfigs(prev => {
      const newConfigs = prev.map(config => ({ ...config, isVisible: false }))
      saveToStorage(newConfigs)
      return newConfigs
    })
  }, [saveToStorage])

  return {
    panelConfigs,
    movePanelUp,
    movePanelDown,
    togglePanelVisibility,
    canMovePanelUp,
    canMovePanelDown,
    resetPanelOrder,
    showAllPanels,
    hideAllPanels,
  }
}

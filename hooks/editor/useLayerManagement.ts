"use client"

import { LayerManager } from "@/lib/pixel-engine"
import { useMemo } from "react"

export function useLayerManagement(
  layerManager: LayerManager,
  user: any,
  updateMoment: () => void,
  broadcastLayerOperation: (type: "layer_created" | "layer_deleted" | "layer_updated" | "layer_reordered", layer: any, order?: number) => void
) {
  const handleLayerSelect = useMemo(() => (index: number) => {
    layerManager.setActiveLayer(index)
    updateMoment()
  }, [layerManager, updateMoment])

  const handleLayerAdd = useMemo(() => () => {
    const layer = layerManager.addLayer()
    broadcastLayerOperation("layer_created", layer)
    updateMoment()
  }, [layerManager, broadcastLayerOperation, updateMoment])

  const handleLayerDelete = useMemo(() => (index: number) => {
    const layer = layerManager.deleteLayer(index)
    if (layer) {
      broadcastLayerOperation("layer_deleted", layer, index)
    }
    updateMoment()
  }, [layerManager, broadcastLayerOperation, updateMoment])
  const handleLayerToggleVisibility = useMemo(() => (index: number) => {
    const layer = layerManager.toggleLayerVisibility(index)
    if (layer) {
      broadcastLayerOperation("layer_updated", layer, index)
    }
    updateMoment()
  }, [layerManager, broadcastLayerOperation, updateMoment])

  const handleLayerDuplicate = useMemo(() => (index: number) => {
    const layer = layerManager.getLayers()[index]
    const newLayer = layerManager.addLayer(`${layer.name} Copy`)
    newLayer.pixels = { ...layer.pixels }
    layerManager.reorderLayer(newLayer.id, index + 1)
    layerManager.setActiveLayer(index + 1)
    layerManager.saveToHistory()

    broadcastLayerOperation("layer_created", newLayer, index + 1)
    updateMoment()
  }, [layerManager, broadcastLayerOperation, updateMoment])

  const handleLayerMove = useMemo(() => (index: number, direction: "up" | "down") => {
    const layers = layerManager.getLayers()
    const newIndex = direction === "up" ? index + 1 : index - 1

    if (newIndex >= 0 && newIndex < layers.length) {
      const temp = layers[index]
      layers[index] = layers[newIndex]
      layers[newIndex] = temp

      if (layerManager.getActiveLayerIndex() === index) {
        layerManager.setActiveLayer(newIndex)
      } else if (layerManager.getActiveLayerIndex() === newIndex) {
        layerManager.setActiveLayer(index)
      }

      layerManager.saveToHistory()

      const layer = layerManager.getLayerByOrder(newIndex)
      if (layer) {
        broadcastLayerOperation("layer_reordered", layer, newIndex)
      }
      updateMoment()
    }
  }, [layerManager, broadcastLayerOperation, updateMoment])

  const handleLayerOpacityChange = useMemo(() => (index: number, opacity: number) => {
    const layers = layerManager.getLayers()
    layers[index].opacity = opacity
    layerManager.saveToHistory()

    broadcastLayerOperation("layer_updated", layers[index], index)
    updateMoment()
  }, [layerManager, broadcastLayerOperation, updateMoment])

  const handleLayerRename = useMemo(() => (index: number, newName: string) => {
    const layer = layerManager.renameLayer(index, newName)
    if (layer) {
      broadcastLayerOperation("layer_updated", layer, index)
      updateMoment()
    }
  }, [layerManager, broadcastLayerOperation, updateMoment])

  return {
    handleLayerSelect,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerToggleVisibility,
    handleLayerDuplicate,
    handleLayerMove,
    handleLayerOpacityChange,
    handleLayerRename,
  }
}

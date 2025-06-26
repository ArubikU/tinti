"use client"

import { LayerManager } from "@/lib/pixel-engine"
import { LayerOperation, LayerUpdate, PixelsUpdate, PixelUpdate, useWebSocketCompat } from "@/lib/websocket-ably"
import { useCallback, useEffect, useState } from "react"

export function useCollaboration(
  project: any,
  user: any,
  layerManager: LayerManager,
  updateMoment: () => void,
  setPreviewPixels: (pixels: { [key: string]: string }) => void
) {
  const [onlineUsers, setOnlineUsers] = useState<{
    [userId: string]: { username: string }
  }>({})
  const [wsMessage, setWsMessage] = useState<any>(null)
  
  const { sendMessage, onMessage } = useWebSocketCompat(project.id, user?.id, user?.username)

  // Setup WebSocket message handler
  useEffect(() => {
    if (onMessage) {
      onMessage((message) => {
        setWsMessage(message)
      })
    }
  }, [onMessage])

  useEffect(() => {
    if (wsMessage) {
      switch (wsMessage.type) {
        case "pixel_update":
          handleRemotePixelUpdate(wsMessage.data)
          break
        case "pixels_update":
          handleRemotePixelsUpdate(wsMessage.data)
          break
        case "user_joined":
          setOnlineUsers((prev) => ({
            ...prev,
            [wsMessage.data.userId]: { username: wsMessage.data.username },
          }))
          break
        case "user_left":
          setOnlineUsers((prev) => {
            const newUsers = { ...prev }
            delete newUsers[wsMessage.data.userId]
            return newUsers          })
          break
        case "layer_created": 
        case "layer_deleted": 
        case "layer_updated": 
        case "layer_reordered": 
        case "layers_sync":
          handleLayerOperation(wsMessage.data)
          break
        case "canvas_resize":
          handleRemoteCanvasResize(wsMessage.data)
          break
      }
    }
  }, [wsMessage])

  const handleRemotePixelUpdate = useCallback((update: PixelUpdate) => {
    if (!user || update.userId === user.id) return
    layerManager.updatePixel(update.x, update.y, update.color, update.layer)
    updateMoment() 
    setPreviewPixels({})
  }, [user, layerManager, updateMoment, setPreviewPixels])

  const handleRemotePixelsUpdate = useCallback((update: PixelsUpdate) => {
    console.log("Received remote pixel update:", update)
    if (!update || !update.pixels || update.pixels.length === 0) return
    if (!user || update.pixels[0].userId === user.id) return
    update.pixels.forEach(({ x, y, color, layer }) => {
      layerManager.updatePixel(x, y, color, layer)
    })
    updateMoment() 
    setPreviewPixels({})
  }, [user, layerManager, updateMoment, setPreviewPixels])

  const handleLayerOperation = (data: LayerOperation) => {
    switch (data.type) {
      case "create":
        if (!layerManager.getLayerById(data.layer.layerId)) {
          layerManager.addLayer(data.layer.name || "Nueva capa")
        }
        break
      case "delete":
        if (layerManager.getLayerById(data.layer.layerId)) {
          layerManager.deleteLayer(data.layer.layerId)
        }
        break
      case "update":
        const layer = layerManager.getLayerById(data.layer.layerId)
        if (layer) {
          if (data.layer.name !== undefined) layer.name = data.layer.name
          if (data.layer.visible !== undefined) layer.visible = data.layer.visible
          if (data.layer.opacity !== undefined) layer.opacity = data.layer.opacity
        }
        break
      case "reorder":
        if (layerManager.getLayerById(data.layer.layerId)) {
          layerManager.reorderLayer(data.layer.layerId, data.layer.order || 0)
        }
        break
    }
    updateMoment()
  }
  const handleRemoteCanvasResize = useCallback((data: any) => {
    // Verificar que no sea del mismo usuario para evitar bucle infinito
    if (!user || data.userId === user.id) return
    
    console.log(`Canvas redimensionado remotamente por ${data.username}:`, data)
    
    // Aquí se podría agregar lógica adicional como mostrar una notificación
    // o actualizar el estado del canvas, pero por ahora solo logueamos
    // ya que el canvas se actualizará cuando se recargue la página o se sincronicen los datos
  }, [user])

  const broadcastLayerOperation = (type: "layer_created" | "layer_deleted" | "layer_updated" | "layer_reordered", layer: any, order?: number) => {
    sendMessage({
      type: type,
      data: {
        type: type.replace("layer_", "") as "create" | "delete" | "update" | "reorder",
        userId: user.id,
        username: user.username,
        timestamp: Date.now(),
        layer: {
          layerId: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          order: order || layerManager.getOrderById(layer.id),
          userId: user.id,
          username: user.username,
        } as LayerUpdate
      } as LayerOperation
    })
  }
  return {
    onlineUsers,
    sendMessage,
    broadcastLayerOperation,
    handleRemotePixelUpdate,
    handleRemotePixelsUpdate,
    handleLayerOperation,
    handleRemoteCanvasResize,
  }
}

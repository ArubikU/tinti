"use client"

import { LayerManager } from "@/lib/pixel-engine"
import { AnimationState, FrameOperation, useWebSocket } from "@/lib/websocket-ably"
import { useCallback, useEffect } from "react"

export function useFrameSync(
  projectId: string,
  userId: string,
  username: string,
  layerManager: LayerManager,
  updateMoment: () => void
) {
  const { 
    sendFrameOperation, 
    sendAnimationStateChange, 
    sendFramesSync, 
    onMessage 
  } = useWebSocket(projectId, userId, username)

  // Funciones para enviar cambios de frames
  const syncFrameCreate = useCallback((frameId: number, name: string, duration: number) => {
    const operation: FrameOperation = {
      type: "create",
      frame: {
        frameId,
        name,
        duration,
        layers: layerManager.frames[layerManager.currentFrame]?.layers,
        userId,
        username
      },
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, layerManager, userId, username])

  const syncFrameDelete = useCallback((frameId: number, frameIndex: number) => {
    const operation: FrameOperation = {
      type: "delete",
      frame: {
        frameId,
        userId,
        username
      },
      fromIndex: frameIndex,
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, userId, username])

  const syncFrameUpdate = useCallback((frameId: number, updates: Partial<{ name: string, duration: number, layers: any[] }>) => {
    const operation: FrameOperation = {
      type: "update",
      frame: {
        frameId,
        ...updates,
        userId,
        username
      },
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, userId, username])

  const syncFrameReorder = useCallback((frameId: number, fromIndex: number, toIndex: number) => {
    const operation: FrameOperation = {
      type: "reorder",
      frame: {
        frameId,
        userId,
        username
      },
      fromIndex,
      toIndex,
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, userId, username])

  const syncFrameDuplicate = useCallback((originalFrameId: number, newFrameId: number, frameIndex: number) => {
    const operation: FrameOperation = {
      type: "duplicate",
      frame: {
        frameId: newFrameId,
        layers: layerManager.frames[frameIndex]?.layers,
        userId,
        username
      },
      fromIndex: frameIndex,
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, layerManager, userId, username])

  const syncFrameChange = useCallback((frameIndex: number) => {
    const operation: FrameOperation = {
      type: "change",
      frame: {
        frameId: layerManager.frames[frameIndex]?.id || frameIndex,
        userId,
        username
      },
      toIndex: frameIndex,
      userId,
      username,
      timestamp: Date.now()
    }
    sendFrameOperation(operation)
  }, [sendFrameOperation, layerManager, userId, username])

  const syncAnimationState = useCallback((isPlaying: boolean, currentFrame: number, fps: number) => {
    const animationState: AnimationState = {
      isPlaying,
      currentFrame,
      fps,
      userId,
      username,
      timestamp: Date.now()
    }
    sendAnimationStateChange(animationState)
  }, [sendAnimationStateChange, userId, username])

  const syncAllFrames = useCallback(() => {
    sendFramesSync(layerManager.frames, layerManager.currentFrame)
  }, [sendFramesSync, layerManager])

  // Manejar mensajes entrantes de frames
  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      // Ignorar mensajes propios
      if (message.data?.userId === userId) return

      switch (message.type) {
        case "frame_created":
          {
            const operation = message.data as FrameOperation
            // Agregar el frame si no existe
            const frameExists = layerManager.frames.some(f => f.id === operation.frame.frameId)
            if (!frameExists && operation.frame.name && operation.frame.duration) {
              layerManager.addFrame(operation.frame.name, operation.frame.duration)
              updateMoment()
            }
          }
          break

        case "frame_deleted":
          {
            const operation = message.data as FrameOperation
            if (operation.fromIndex !== undefined && operation.fromIndex < layerManager.frames.length) {
              layerManager.deleteFrame(operation.fromIndex)
              updateMoment()
            }
          }
          break

        case "frame_updated":
          {
            const operation = message.data as FrameOperation
            const frameIndex = layerManager.frames.findIndex(f => f.id === operation.frame.frameId)
            if (frameIndex !== -1) {
              if (operation.frame.name) {
                layerManager.renameFrame(frameIndex, operation.frame.name)
              }
              if (operation.frame.duration) {
                layerManager.updateFrameDuration(frameIndex, operation.frame.duration)
              }
              updateMoment()
            }
          }
          break

        case "frame_reordered":
          {
            const operation = message.data as FrameOperation
            if (operation.fromIndex !== undefined && operation.toIndex !== undefined) {
              layerManager.moveFrame(operation.fromIndex, operation.toIndex)
              updateMoment()
            }
          }
          break

        case "frame_duplicated":
          {
            const operation = message.data as FrameOperation
            if (operation.fromIndex !== undefined) {
              layerManager.duplicateFrame(operation.fromIndex)
              updateMoment()
            }
          }
          break

        case "frame_changed":
          {
            const operation = message.data as FrameOperation
            if (operation.toIndex !== undefined) {
              layerManager.setCurrentFrame(operation.toIndex)
              updateMoment()
            }
          }
          break

        case "animation_state_changed":
          {
            const state = message.data as AnimationState
            // Solo sincronizar el frame actual y FPS, no el estado de reproducción
            // para evitar conflictos entre usuarios
            if (state.currentFrame !== layerManager.currentFrame) {
              layerManager.setCurrentFrame(state.currentFrame)
            }
            if (state.fps !== layerManager.animationFps) {
              layerManager.setAnimationFps(state.fps)
            }
            updateMoment()
          }
          break

        case "frames_sync":
          {
            const data = message.data
            // Sincronizar todos los frames (usado cuando un usuario se une)
            if (data.frames && Array.isArray(data.frames)) {
              layerManager.frames = data.frames
              layerManager.currentFrame = data.currentFrame || 0
              layerManager.layers = layerManager.frames[layerManager.currentFrame]?.layers || []
              updateMoment()
            }
          }
          break
      }
    })

    return unsubscribe
  }, [onMessage, layerManager, updateMoment, userId])

  return {
    syncFrameCreate,
    syncFrameDelete,
    syncFrameUpdate,
    syncFrameReorder,
    syncFrameDuplicate,
    syncFrameChange,
    syncAnimationState,
    syncAllFrames
  }
}

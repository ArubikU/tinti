"use client"

import { LayerManager } from "@/lib/pixel-engine"
import { useCallback, useEffect, useState } from "react"
import { useFrameSync } from "./useFrameSync"

export function useAnimation(
  layerManager: LayerManager,
  updateMoment: () => void,
  projectId?: string,
  userId?: string,
  username?: string
) {  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [animationIntervalId, setAnimationIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Sincronización de frames si se proporcionan los parámetros de WebSocket
  const frameSync = projectId && userId && username ? 
    useFrameSync(projectId, userId, username, layerManager, updateMoment) : null
  const handleFrameChange = useCallback((frameIndex: number) => {
    layerManager.setCurrentFrame(frameIndex)
    updateMoment()
    // Sincronizar cambio de frame si está disponible
    frameSync?.syncFrameChange(frameIndex)
  }, [layerManager, updateMoment, frameSync])
  const handleAddFrame = useCallback(() => {
    const newFrame = layerManager.addFrame()
    updateMoment()
    // Sincronizar creación de frame si está disponible
    if (frameSync && newFrame) {
      frameSync.syncFrameCreate(newFrame.id, newFrame.name, newFrame.duration)
    }
  }, [layerManager, updateMoment, frameSync])
  const handleDuplicateFrame = useCallback((frameIndex: number) => {
    const originalFrame = layerManager.frames[frameIndex]
    const newFrame = layerManager.duplicateFrame(frameIndex)
    updateMoment()
    // Sincronizar duplicación de frame si está disponible
    if (frameSync && originalFrame && newFrame) {
      frameSync.syncFrameDuplicate(originalFrame.id, newFrame.id, frameIndex)
    }
  }, [layerManager, updateMoment, frameSync])
  const handleDeleteFrame = useCallback((frameIndex: number) => {
    const frameToDelete = layerManager.frames[frameIndex]
    layerManager.deleteFrame(frameIndex)
    updateMoment()
    // Sincronizar eliminación de frame si está disponible
    if (frameSync && frameToDelete) {
      frameSync.syncFrameDelete(frameToDelete.id, frameIndex)
    }
  }, [layerManager, updateMoment, frameSync])
  const handleMoveFrame = useCallback((fromIndex: number, toIndex: number) => {
    const frameToMove = layerManager.frames[fromIndex]
    layerManager.moveFrame(fromIndex, toIndex)
    updateMoment()
    // Sincronizar movimiento de frame si está disponible
    if (frameSync && frameToMove) {
      frameSync.syncFrameReorder(frameToMove.id, fromIndex, toIndex)
    }
  }, [layerManager, updateMoment, frameSync])
  const handleUpdateFrameDuration = useCallback((frameIndex: number, duration: number) => {
    const frame = layerManager.frames[frameIndex]
    layerManager.updateFrameDuration(frameIndex, duration)
    updateMoment()
    // Sincronizar actualización de duración si está disponible
    if (frameSync && frame) {
      frameSync.syncFrameUpdate(frame.id, { duration })
    }
  }, [layerManager, updateMoment, frameSync])
  const handleRenameFrame = useCallback((frameIndex: number, newName: string) => {
    const frame = layerManager.frames[frameIndex]
    layerManager.renameFrame(frameIndex, newName)
    updateMoment()
    // Sincronizar cambio de nombre si está disponible
    if (frameSync && frame) {
      frameSync.syncFrameUpdate(frame.id, { name: newName })
    }
  }, [layerManager, updateMoment, frameSync])
  const handleSetAnimationFps = useCallback((fps: number) => {
    layerManager.setAnimationFps(fps)
    updateMoment()
    // Sincronizar cambio de FPS si está disponible
    frameSync?.syncAnimationState(isAnimationPlaying, layerManager.currentFrame, fps)
  }, [layerManager, updateMoment, frameSync, isAnimationPlaying])
  const handleTogglePlayback = useCallback(() => {
    if (isAnimationPlaying) {
      if (animationIntervalId) {
        clearInterval(animationIntervalId)
        setAnimationIntervalId(null)
      }
      setIsAnimationPlaying(false)
      // Sincronizar estado de pausa si está disponible
      frameSync?.syncAnimationState(false, layerManager.currentFrame, layerManager.animationFps)
    } else {
      if (layerManager.frames.length > 1) {
        setIsAnimationPlaying(true)
        // Sincronizar estado de reproducción si está disponible
        frameSync?.syncAnimationState(true, layerManager.currentFrame, layerManager.animationFps)
        
        const playNextFrame = () => {
          const currentFrameIndex = layerManager.currentFrame
          const nextFrameIndex = (currentFrameIndex + 1) % layerManager.frames.length
          const currentFrame = layerManager.frames[currentFrameIndex]
          
          setTimeout(() => {
            layerManager.setCurrentFrame(nextFrameIndex)
            updateMoment()
            // Sincronizar cambio de frame durante la reproducción
            frameSync?.syncFrameChange(nextFrameIndex)
          }, currentFrame.duration)
        }
        
        const intervalId = setInterval(playNextFrame, 0)
        setAnimationIntervalId(intervalId)
        playNextFrame()
      }
    }
  }, [isAnimationPlaying, animationIntervalId, layerManager, updateMoment, frameSync])

  const handleStepForward = useCallback(() => {
    const nextFrame = (layerManager.currentFrame + 1) % layerManager.frames.length
    handleFrameChange(nextFrame)
  }, [layerManager.currentFrame, layerManager.frames.length, handleFrameChange])

  const handleStepBackward = useCallback(() => {
    const prevFrame = (layerManager.currentFrame - 1 + layerManager.frames.length) % layerManager.frames.length
    handleFrameChange(prevFrame)
  }, [layerManager.currentFrame, layerManager.frames.length, handleFrameChange])

  // Stop animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationIntervalId) {
        clearInterval(animationIntervalId)
      }
    }
  }, [animationIntervalId])
  return {
    isAnimationPlaying,
    animationIntervalId,
    handleFrameChange,
    handleAddFrame,
    handleDuplicateFrame,
    handleDeleteFrame,
    handleMoveFrame,
    handleUpdateFrameDuration,
    handleRenameFrame,
    handleSetAnimationFps,
    handleTogglePlayback,
    handleStepForward,
    handleStepBackward,
    // Exponer métodos de sincronización para uso avanzado
    frameSync
  }
}

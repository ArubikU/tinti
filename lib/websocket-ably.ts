"use client"

import * as Ably from "ably"
import { useCallback, useEffect, useRef } from "react"

export interface PixelUpdate {
  x: number
  y: number
  color: string | null
  layer: number
  userId: string
  username: string
}

export interface PixelsUpdate {
  pixels: PixelUpdate[]
  layer: number
}

export interface LayerUpdate {
  layerId: number
  name?: string
  visible?: boolean
  opacity?: number
  order?: number
  userId: string
  username: string
}

export interface LayerOperation {
  type: "create" | "delete" | "update" | "reorder"
  layer: LayerUpdate
  userId: string
  username: string
  timestamp: number
}

export interface WebSocketMessage {
  type: "pixel_update" | "user_joined" | "user_left" | "cursor_move" | "users_list" | "pixels_update" | "layer_created" | "layer_deleted" | "layer_updated" | "layer_reordered" | "layers_sync" | "frame_created" | "frame_deleted" | "frame_updated" | "frame_reordered" | "frame_duplicated" | "frame_changed" | "frames_sync" | "animation_state_changed" | "canvas_resize"
  data: any
}

export interface FrameUpdate {
  frameId: number
  name?: string
  duration?: number
  layers?: any[] // Array de capas del frame
  userId: string
  username: string
}

export interface FrameOperation {
  type: "create" | "delete" | "update" | "reorder" | "duplicate" | "change"
  frame: FrameUpdate
  fromIndex?: number
  toIndex?: number
  userId: string
  username: string
  timestamp: number
}

export interface AnimationState {
  isPlaying: boolean
  currentFrame: number
  fps: number
  userId: string
  username: string
  timestamp: number
}

export function useWebSocketCompat(projectId: string, userId: string, username: string) {
  const ably = useRef<Ably.Realtime | null>(null)
  const channel = useRef<Ably.RealtimeChannel | null>(null)
  const isConnected = useRef(false)
  const isDetaching = useRef(false)
  const messageCallbacks = useRef<Set<(message: WebSocketMessage) => void>>(new Set())

  const connect = useCallback(() => {
    if (isConnected.current || isDetaching.current) return

    try {
      isDetaching.current = false // Reset detaching flag when connecting
      
      ably.current = new Ably.Realtime({
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY || 'your-ably-api-key-here',
        clientId: userId
      })

      channel.current = ably.current.channels.get(`project:${projectId}`)

      ably.current.connection.on('connected', () => {
        console.log("Ably connected")
        isConnected.current = true

        channel.current?.publish('user_joined', {
          userId,
          username
        })
      })

      ably.current.connection.on('disconnected', () => {
        console.log("Ably disconnected")
        isConnected.current = false
      })

      ably.current.connection.on('failed', (error: any) => {
        console.error("Ably connection failed:", error)
        isConnected.current = false
      })

      channel.current.subscribe((message: any) => {
        // Ignorar mensajes enviados por uno mismo
        if (message.clientId === userId) return

        const wsMessage: WebSocketMessage = {
          type: message.name as WebSocketMessage['type'],
          data: message.data
        }

        messageCallbacks.current.forEach(callback => {
          try {
            callback(wsMessage)
          } catch (error) {
            console.error("Error in message callback:", error)
          }
        })
      })

    } catch (error) {
      console.error("Failed to connect to Ably:", error)
      isConnected.current = false
    }
  }, [projectId, userId, username])
  useEffect(() => {
    connect()    
    return () => {
      if (isDetaching.current) return // Evitar detach concurrentes
      
      isDetaching.current = true
      
      if (channel.current && channel.current.state === 'attached') {
        try {
          channel.current.publish('user_left', {
            userId,
            username
          })
          channel.current.detach()
        } catch (error) {
          console.warn("Error during channel detach:", error)
        }
      }
      
      if (ably.current && ably.current.connection.state !== 'closed' && ably.current.connection.state !== 'closing') {
        try {
          //ably.current.close()
        } catch (error) {
          console.warn("Error during Ably close:", error)
        }
      }
      
      isConnected.current = false
      messageCallbacks.current.clear()
      isDetaching.current = false
    }
  }, [connect])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (channel.current && isConnected.current) {
      channel.current.publish(message.type, message.data)
    }
  }, [])

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacks.current.add(callback)
    return () => {
      messageCallbacks.current.delete(callback)
    }
  }, [])

  // Métodos para sincronización de frames
  const sendFrameOperation = useCallback((operation: FrameOperation) => {
    if (channel.current && isConnected.current) {
      const eventType = `frame_${operation.type}` as WebSocketMessage['type']
      channel.current.publish(eventType, operation)
    }
  }, [])

  const sendAnimationStateChange = useCallback((animationState: AnimationState) => {
    if (channel.current && isConnected.current) {
      channel.current.publish('animation_state_changed', animationState)
    }
  }, [])

  const sendFramesSync = useCallback((frames: any[], currentFrame: number) => {
    if (channel.current && isConnected.current) {
      channel.current.publish('frames_sync', {
        frames,
        currentFrame,
        userId,
        username,
        timestamp: Date.now()
      })
    }
  }, [userId, username])

  return { 
    sendMessage, 
    onMessage, 
    isConnected: isConnected.current,
    ably: ably.current,
    channel: channel.current,
    sendFrameOperation,
    sendAnimationStateChange,
    sendFramesSync
  }
}

export function useAblyWebSocket(projectId: string, userId: string, username: string) {
  const ably = useRef<Ably.Realtime | null>(null)
  const channel = useRef<Ably.RealtimeChannel | null>(null)
  const isConnected = useRef(false)
  const isDetaching = useRef(false)

  const connect = useCallback(() => {
    if (isConnected.current) return

    try {
      ably.current = new Ably.Realtime({
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY || 'your-ably-api-key-here',
        clientId: userId
      })

      channel.current = ably.current.channels.get(`project:${projectId}`)

      ably.current.connection.on('connected', () => {
        console.log("Ably connected")
        isConnected.current = true

        channel.current?.publish('user_joined', {
          userId,
          username
        })
      })

      ably.current.connection.on('disconnected', () => {
        console.log("Ably disconnected")
        isConnected.current = false
      })

      ably.current.connection.on('failed', (error: any) => {
        console.error("Ably connection failed:", error)
        isConnected.current = false
      })

    } catch (error) {
      console.error("Failed to connect to Ably:", error)
      isConnected.current = false
    }
  }, [projectId, userId, username])  
  useEffect(() => {
    connect()

    return () => {
      if (isDetaching.current) return // Evitar detach concurrentes
      
      isDetaching.current = true
      
      if (channel.current && channel.current.state === 'attached') {
        try {
          channel.current.publish('user_left', {
            userId,
            username
          })
          channel.current.detach()
        } catch (error) {
          console.warn("Error during channel detach:", error)
        }
      }
      
      if (ably.current && ably.current.connection.state !== 'closed' && ably.current.connection.state !== 'closing') {
        try {
          //ably.current.close()
        } catch (error) {
          console.warn("Error during Ably close:", error)
        }
      }
      
      isConnected.current = false
      isDetaching.current = false
    }
  }, [connect])

  const publish = useCallback((eventName: string, data: any) => {
    if (channel.current && isConnected.current) {
      channel.current.publish(eventName, data)
    }
  }, [])

  const subscribe = useCallback((eventName: string, callback: (data: any) => void) => {
    if (channel.current) {
      channel.current.subscribe(eventName, (message: any) => {
        if (message.clientId === userId) return
        callback(message.data)
      })
    }
  }, [userId])

  const subscribeAll = useCallback((callback: (eventName: string, data: any) => void) => {
    if (channel.current) {
      channel.current.subscribe((message: any) => {
        if (message.clientId === userId) return
        callback(message.name, message.data)
      })
    }
  }, [userId])

  // Métodos específicos para frames
  const publishFrameOperation = useCallback((operation: FrameOperation) => {
    if (channel.current && isConnected.current) {
      const eventType = `frame_${operation.type}`
      channel.current.publish(eventType, operation)
    }
  }, [])

  const publishAnimationStateChange = useCallback((animationState: AnimationState) => {
    if (channel.current && isConnected.current) {
      channel.current.publish('animation_state_changed', animationState)
    }
  }, [])

  const publishFramesSync = useCallback((frames: any[], currentFrame: number) => {
    if (channel.current && isConnected.current) {
      channel.current.publish('frames_sync', {
        frames,
        currentFrame,
        userId,
        username,
        timestamp: Date.now()
      })
    }
  }, [userId, username])

  return { 
    publish,
    subscribe,
    subscribeAll,
    isConnected: isConnected.current,
    ably: ably.current,
    channel: channel.current,
    publishFrameOperation,
    publishAnimationStateChange,
    publishFramesSync
  }
}

// Exportar el hook principal manteniendo compatibilidad
export { useWebSocketCompat as useWebSocket }


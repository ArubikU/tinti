"use client"

import type { GlassToastProps } from "@/components/ui/GlassToast"
import { useCallback, useState } from "react"

interface ToastOptions {
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info"
  duration?: number
}

export function useGlassToast() {
  const [toasts, setToasts] = useState<GlassToastProps[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: GlassToastProps = {
      id,
      ...options,
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: "success" })
  }, [showToast])

  const error = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: "error" })
  }, [showToast])

  const warning = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: "warning" })
  }, [showToast])

  const info = useCallback((title: string, description?: string) => {
    showToast({ title, description, variant: "info" })
  }, [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}

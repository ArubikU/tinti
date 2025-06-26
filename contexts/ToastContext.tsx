"use client"

import { GlassToastContainer } from "@/components/ui/GlassToast"
import { useGlassToast } from "@/hooks/use-glass-toast"
import React, { createContext, useContext } from "react"

interface ToastContextType {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function GlassToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast, success, error, warning, info } = useGlassToast()

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <GlassToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a GlassToastProvider")
  }
  return context
}

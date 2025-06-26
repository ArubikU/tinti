"use client"

import { useToast } from "@/contexts/ToastContext"
import { GlassButton } from "./GlassButton"

export function ToastDemo() {
  const { success, error, warning, info } = useToast()

  const showSuccessToast = () => {
    success(
      "¡Acción exitosa!",
      "Esta es una demostración de un toast de éxito con diseño glass."
    )
  }

  const showErrorToast = () => {
    error(
      "Error encontrado",
      "Esta es una demostración de un toast de error con diseño glass."
    )
  }

  const showWarningToast = () => {
    warning(
      "Advertencia importante",
      "Esta es una demostración de un toast de advertencia con diseño glass."
    )
  }

  const showInfoToast = () => {
    info(
      "Información útil",
      "Esta es una demostración de un toast de información con diseño glass."
    )
  }

  return (
    <div className="flex flex-wrap gap-3 p-4">
      <GlassButton onClick={showSuccessToast} variant="primary" size="sm">
        Toast Éxito
      </GlassButton>
      <GlassButton onClick={showErrorToast} variant="secondary" size="sm">
        Toast Error
      </GlassButton>
      <GlassButton onClick={showWarningToast} variant="outline" size="sm">
        Toast Advertencia
      </GlassButton>
      <GlassButton onClick={showInfoToast} variant="glass" size="sm">
        Toast Info
      </GlassButton>
    </div>
  )
}

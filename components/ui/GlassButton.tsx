"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import React from "react"

interface GlassButtonProps {
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  icon?: LucideIcon
  variant?: "primary" | "secondary" | "outline" | "glass"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
  active?: boolean
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(({
  children = null,
  onClick,
  icon: Icon,
  variant = "glass",
  size = "md",
  disabled = false,
  className = "",
  active = false,
}, ref) => {
  const baseClasses =
    "flex items-center gap-2 rounded-2xl transition-all duration-300 font-medium relative overflow-hidden"

  const variants = {
    primary: "bg-gradient-to-r from-[#A678FF] to-[#965fff] text-white shadow-lg shadow-purple-200/50",
    secondary: "bg-gradient-to-r from-[#FFB6A6] to-[#ff9d89] text-white shadow-lg shadow-orange-200/50",
    outline: "bg-white/10 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/20",
    glass: active
      ? "bg-white/30 backdrop-blur-lg border border-white/40 text-gray-800 shadow-lg"
      : "bg-white/10 backdrop-blur-md border border-white/20 text-gray-700 hover:bg-white/20",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        boxShadow: active
          ? `0 8px 32px rgba(166, 120, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)`
          : `0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
      }}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      {Icon && <Icon size={iconSizes[size]} />}
      {children}
    </motion.button>
  )
})

GlassButton.displayName = "GlassButton"

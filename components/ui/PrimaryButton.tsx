"use client"

import { motion } from "framer-motion"
import { Paintbrush, type LucideIcon } from "lucide-react"
import type React from "react"

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: LucideIcon
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

export function PrimaryButton({
  children,
  onClick,
  icon: Icon = Paintbrush,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: PrimaryButtonProps) {
  const baseClasses = "flex items-center gap-2 rounded-2xl shadow-lg transition-colors font-medium"

  const variants = {
    primary: "bg-[#A678FF] text-white hover:bg-[#965fff] shadow-purple-200",
    secondary: "bg-[#FFB6A6] text-white hover:bg-[#ff9d89] shadow-orange-200",
    outline: "bg-white border-2 border-[#A678FF] text-[#A678FF] hover:bg-[#A678FF] hover:text-white",
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
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={iconSizes[size]} />
      {children}
    </motion.button>
  )
}

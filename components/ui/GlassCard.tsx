"use client"

import { motion } from "framer-motion"
import type React from "react"

interface GlassCardProps {
  children?: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  intensity?: "light" | "medium" | "heavy" | "weight" | "2xlight" | "2xmedium"
}

export function GlassCard({ children, className = "", hover = true, delay = 0, intensity = "medium" }: GlassCardProps) {
  const intensityStyles = {
    light: "bg-white/10 backdrop-blur-sm border border-white/20",
    medium: "bg-white/20 backdrop-blur-md border border-white/30",
    heavy: "bg-white/30 backdrop-blur-lg border border-white/40",
    weight: "bg-white/40 backdrop-blur-xl border border-white/50",
    "2xlight": "bg-white/50 backdrop-blur-2xl border border-white/60",
    "2xmedium": "bg-white/60 backdrop-blur-3xl border border-white/70",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      className={`${intensityStyles[intensity]} rounded-2xl shadow-xl ${className}`}
      style={{
        boxShadow: `
          0 8px 32px rgba(166, 120, 255, 0.1),
          0 4px 16px rgba(255, 182, 166, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
      }}
    >
      {children}
    </motion.div>
  )
}

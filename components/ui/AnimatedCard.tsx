"use client"

import { motion } from "framer-motion"
import type React from "react"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  onClick?: () => void
}

export function AnimatedCard({ children, className = "", hover = true, delay = 0, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

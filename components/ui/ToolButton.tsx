"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface ToolButtonProps {
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
  tooltip: string
}

export function ToolButton({ icon: Icon, isActive, onClick, tooltip }: ToolButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
        isActive
          ? "bg-[#A678FF] text-white shadow-lg shadow-purple-200"
          : "bg-white/80 text-gray-600 hover:bg-[#A678FF]/10 hover:text-[#A678FF]"
      }`}
      onClick={onClick}
      title={tooltip}
    >
      <Icon size={24} />
    </motion.button>
  )
}

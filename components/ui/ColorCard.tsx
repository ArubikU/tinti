"use client"

import { motion } from "framer-motion"

interface ColorCardProps {
  hex: string
  name?: string
  onClick?: () => void
  isSelected?: boolean
}

export function ColorCard({ hex, name, onClick, isSelected = false }: ColorCardProps) {
  return (
    <motion.div
      whileHover={{ rotate: -2, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      className={`w-24 h-24 rounded-xl shadow-lg cursor-pointer relative overflow-hidden ${
        isSelected ? "ring-4 ring-[#A678FF] ring-offset-2" : ""
      }`}
      style={{ backgroundColor: hex }}
      onClick={onClick}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-1">
        <p className="text-xs text-center text-white font-medium">{hex}</p>
        {name && <p className="text-xs text-center text-white/80">{name}</p>}
      </div>
    </motion.div>
  )
}

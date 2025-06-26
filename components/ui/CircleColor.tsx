"use client"

import { motion } from "framer-motion"

interface CircleColorProps {
  hex: string
  onSelect: () => void
  isSelected?: boolean
  size?: "sm" | "md" | "lg"
}

export function CircleColor({ hex, onSelect, isSelected = false, size = "md" }: CircleColorProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizes[size]} rounded-full border-2 ${
        isSelected ? "border-[#A678FF] border-4" : "border-white"
      } shadow-lg cursor-pointer relative`}
      style={{ backgroundColor: hex }}
      onClick={onSelect}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 rounded-full border-2 border-[#A678FF] animate-pulse"
        />
      )}
    </motion.div>
  )
}

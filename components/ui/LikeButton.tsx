"use client"

import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useState } from "react"

interface LikeButtonProps {
  isLiked: boolean
  likesCount: number
  onToggle: () => Promise<void>
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  showCount?: boolean
}

export function LikeButton({ 
  isLiked, 
  likesCount, 
  onToggle, 
  disabled = false,
  size = "md",
  showCount = true
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentCount, setCurrentCount] = useState(likesCount)

  const handleToggle = async () => {
    if (disabled || isAnimating) return
    
    setIsAnimating(true)
    
    // Animación optimista
    const newCount = isLiked ? currentCount - 1 : currentCount + 1
    setCurrentCount(newCount)
    
    try {
      await onToggle()
    } catch (error) {
      // Revertir en caso de error
      setCurrentCount(likesCount)
    } finally {
      setIsAnimating(false)
    }
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2", 
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  }

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Button
        onClick={handleToggle}
        disabled={disabled || isAnimating}
        variant={isLiked ? "default" : "outline"}
        className={`
          relative overflow-hidden transition-all duration-200
          ${isLiked 
            ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" 
            : "border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
          }
          ${sizeClasses[size]}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <motion.div
            key={isLiked ? "liked" : "unliked"}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Heart 
              className={`
                ${iconSizes[size]} 
                ${isLiked ? "fill-current" : ""} 
                transition-all duration-200
              `} 
            />
          </motion.div>
          
          {showCount && (
            <AnimatePresence mode="wait">
              <motion.span
                key={currentCount}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-medium min-w-[1.5rem] text-center"
              >
                {currentCount}
              </motion.span>
            </AnimatePresence>
          )}
        </div>

        {/* Efecto de ondas cuando se hace click */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-red-400 rounded-full"
            />
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}

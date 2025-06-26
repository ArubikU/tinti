"use client"

import { motion } from "framer-motion"
import { Eye, Heart, MessageCircle } from "lucide-react"

interface ProjectStatsProps {
  likes: number
  views?: number
  comments?: number
  className?: string
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
}

export function ProjectStats({ 
  likes, 
  views, 
  comments, 
  className = "", 
  showLabels = false,
  size = "md"
}: ProjectStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const sizeClasses = {
    sm: {
      icon: "w-3 h-3",
      text: "text-xs",
      gap: "gap-1"
    },
    md: {
      icon: "w-4 h-4", 
      text: "text-sm",
      gap: "gap-2"
    },
    lg: {
      icon: "w-5 h-5",
      text: "text-base", 
      gap: "gap-3"
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className={`flex items-center ${styles.gap} ${className}`}>
      {/* Likes */}
      <motion.div 
        className={`flex items-center gap-1 text-red-400 ${styles.text}`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Heart className={`${styles.icon} ${likes > 0 ? "fill-current" : ""}`} />
        <span className="font-medium">{formatNumber(likes)}</span>
        {showLabels && <span className="hidden sm:inline">likes</span>}
      </motion.div>

      {/* Views */}
      {views !== undefined && (
        <motion.div 
          className={`flex items-center gap-1 text-blue-400 ${styles.text}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Eye className={styles.icon} />
          <span className="font-medium">{formatNumber(views)}</span>
          {showLabels && <span className="hidden sm:inline">vistas</span>}
        </motion.div>
      )}

      {/* Comments */}
      {comments !== undefined && (
        <motion.div 
          className={`flex items-center gap-1 text-green-400 ${styles.text}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <MessageCircle className={styles.icon} />
          <span className="font-medium">{formatNumber(comments)}</span>
          {showLabels && <span className="hidden sm:inline">comentarios</span>}
        </motion.div>
      )}
    </div>
  )
}

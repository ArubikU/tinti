"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

export interface GlassToastProps {
  id: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: (id: string) => void
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    gradient: "from-green-400/20 to-emerald-500/20",
    border: "border-green-400/30",
    iconColor: "text-green-500",
    titleColor: "text-green-800",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-400/20 to-rose-500/20", 
    border: "border-red-400/30",
    iconColor: "text-red-500",
    titleColor: "text-red-800",
  },
  warning: {
    icon: AlertCircle,
    gradient: "from-yellow-400/20 to-amber-500/20",
    border: "border-yellow-400/30", 
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-800",
  },
  info: {
    icon: Info,
    gradient: "from-blue-400/20 to-cyan-500/20",
    border: "border-blue-400/30",
    iconColor: "text-blue-500", 
    titleColor: "text-blue-800",
  },
}

export function GlassToast({ 
  id, 
  title, 
  description, 
  variant = "info", 
  duration = 5000,
  onClose 
}: GlassToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = toastVariants[variant]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={`
            relative p-4 rounded-2xl backdrop-blur-xl border shadow-2xl
            bg-gradient-to-r ${config.gradient} ${config.border}
            min-w-[320px] max-w-[400px]
          `}
          style={{
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 rounded-2xl opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
          </div>

          <div className="relative flex items-start gap-3">
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              <Icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${config.titleColor}`}>
                {title}
              </h4>
              {description && (
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white/30 to-white/60 rounded-b-2xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast container component
export function GlassToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: GlassToastProps[]
  onRemove: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <GlassToast {...toast} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

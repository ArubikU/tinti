"use client"

import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import React, { ReactNode, useState } from "react"

interface EditorPanelProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
  intensity?: "light" | "medium" | "heavy" | "weight" | "2xlight" | "2xmedium"
  isCollapsible?: boolean
  defaultCollapsed?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  isMobile?: boolean
}

export function EditorPanel({
  title,
  icon: Icon,
  children,
  className = "",
  intensity = "2xmedium",
  isCollapsible = true,
  defaultCollapsed = false,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isMobile = false,
}: EditorPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Removido el early return que ocultaba completamente el panel
  // Ahora los paneles siempre se muestran, solo se colapsan

  const handleToggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <GlassCard className={`${className}`} intensity={intensity}>
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-600" />}
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
          <div className="flex items-center gap-1">
          {/* Panel order controls */}
          {(onMoveUp || onMoveDown) && !isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 hover:bg-white/20"
                >
                  <GripVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onMoveUp && (
                  <DropdownMenuItem
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                    className="text-xs"
                  >
                    <ChevronUp className="w-3 h-3 mr-2" />
                    Mover arriba
                  </DropdownMenuItem>
                )}
                {onMoveDown && (
                  <DropdownMenuItem
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                    className="text-xs"
                  >
                    <ChevronDown className="w-3 h-3 mr-2" />
                    Mover abajo
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Collapse toggle */}
          {isCollapsible && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleCollapse}
              className="w-6 h-6 p-0 hover:bg-white/20"
            >
              {isCollapsed ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

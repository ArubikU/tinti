"use client"

import { GlassButton } from "@/components/ui/GlassButton"
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer"
import { motion } from "framer-motion"
import { ArrowLeft, LogIn, Redo, Save, Sparkles, Undo } from "lucide-react"
import OnlineUsersList from "../online-user-list"

interface EditorHeaderProps {
  projectTitle: string
  canvasSize: { width: number; height: number }
  isTemporary?: boolean
  user?: any
  onlineUsers?: {
    [userId: string]: {
        username: string;
    };
  }
  canUndo: boolean
  canRedo: boolean
  onBack: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
}

export function EditorHeader({
  projectTitle,
  canvasSize,
  isTemporary,
  user,
  onlineUsers = {},
  canUndo,
  canRedo,
  onBack,
  onUndo,
  onRedo,
  onSave,
}: EditorHeaderProps) {


  return (


    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-3 sm:p-4 flex-shrink-0"
      style={{
        boxShadow: "0 8px 32px rgba(166, 120, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
    >
      <ResponsiveContainer>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <GlassButton variant="glass" size="sm" onClick={onBack} icon={ArrowLeft} className="flex-shrink-0">
              <span className="hidden sm:inline">Volver</span>
            </GlassButton>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A678FF]" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{projectTitle}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {canvasSize.width}×{canvasSize.height} píxeles
                </span>
                {isTemporary && <span className="text-orange-600 font-medium">Proyecto temporal</span>}
              </div>
            </div>

            {user && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                {/* Mobile view */}
                <div className="flex sm:hidden">
                  <span>{Object.keys(onlineUsers).length} usuarios en línea</span>
                </div>
                {/* Desktop view */}
                <div className="hidden sm:flex">
                  <OnlineUsersList
                  onlineUsers={onlineUsers}
                  limit={5}
                  ></OnlineUsersList>
                </div>
                </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <GlassButton
              variant="glass"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              icon={Undo}
              className="hidden sm:flex"
            >
              Deshacer
            </GlassButton>
            <GlassButton
              variant="glass"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              icon={Redo}
              className="hidden sm:flex"
            >
              Rehacer
            </GlassButton>
            {user ? (
              <GlassButton variant="secondary" size="sm" onClick={onSave} icon={Save}>
                <span className="hidden sm:inline">Guardar</span>
              </GlassButton>
            ) : (
              <GlassButton variant="primary" size="sm" onClick={onSave} icon={LogIn}>
                <span className="hidden sm:inline">Registrarse</span>
              </GlassButton>
            )}
          </div>
        </div>
      </ResponsiveContainer>
    </motion.div>
  )
}

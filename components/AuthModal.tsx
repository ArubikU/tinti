"use client"

import type React from "react"

import { AnimatedCard } from "@/components/ui/AnimatedCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, Mail, Sparkles, User, X } from "lucide-react"
import { useState } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: any) => void
}

export function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const body = isLogin ? { email: formData.email, password: formData.password } : formData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      onAuth(data.user)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <AnimatedCard className="p-8 relative overflow-hidden">
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A678FF]/20 to-[#FFB6A6]/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#A9FBD7]/20 to-[#A678FF]/20 rounded-full translate-y-12 -translate-x-12" />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A678FF] to-[#FFB6A6] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A678FF] to-[#FFB6A6] bg-clip-text text-transparent">
                      {isLogin ? t('auth.welcome') : t('auth.joinTinti')}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label htmlFor="username" className="text-gray-700 font-medium">
                        {t('auth.username')}
                      </Label>
                      <div className="relative mt-2">
                        <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                          className="pl-11 h-12 rounded-xl border-gray-200 focus:border-[#A678FF] focus:ring-[#A678FF]"
                          placeholder={t('auth.usernamePlaceholder')}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      {t('auth.email')}
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-11 h-12 rounded-xl border-gray-200 focus:border-[#A678FF] focus:ring-[#A678FF]"
                        placeholder={t('auth.emailPlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      {t('auth.password')}
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-11 h-12 rounded-xl border-gray-200 focus:border-[#A678FF] focus:ring-[#A678FF]"
                        placeholder={t('auth.passwordPlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PrimaryButton type="submit" className="w-full" disabled={loading} size="lg">
                    {loading ? t('auth.processing') : isLogin ? t('auth.login') : t('auth.createAccount')}
                  </PrimaryButton>

                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[#A678FF] hover:text-[#965fff] font-medium transition-colors"
                    >
                      {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                    </motion.button>
                  </div>
                </form>
              </div>
            </AnimatedCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

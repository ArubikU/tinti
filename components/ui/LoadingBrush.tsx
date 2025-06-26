"use client"

import { useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import { Paintbrush } from "lucide-react"

export function LoadingBrush() {
  const {t} = useLanguage()
  let loadingText = t('navigation.loading')
  if (loadingText === 'navigation.loading') {
    loadingText = 'Loading your canvas...'
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: "linear" }}
        className="w-16 h-16 text-[#A678FF]"
      >
        <Paintbrush size={64} />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
        className="text-[#A678FF] font-medium"
      >
        {loadingText}
      </motion.p>
    </div>
  )
}

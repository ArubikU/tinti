"use client"

import { useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import Image from "next/image"

interface WelcomeBannerProps {
  title?: string
  subtitle?: string
}

export function WelcomeBanner({
  title,
  subtitle,
}: WelcomeBannerProps) {
  const { t } = useLanguage()
  
  const displayTitle = title || t('landing.welcome.title')
  const displaySubtitle = subtitle || t('landing.welcome.subtitle')
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <Image src="/icons/tinti-logo.png" alt="Tinti.art" width={200} height={200} className="mx-auto" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl font-bold bg-gradient-to-r from-[#A678FF] to-[#FFB6A6] bg-clip-text text-transparent mb-4"
      >
        {displayTitle}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 text-xl max-w-2xl mx-auto"
      >
        {displaySubtitle}
      </motion.p>
    </motion.div>
  )
}
